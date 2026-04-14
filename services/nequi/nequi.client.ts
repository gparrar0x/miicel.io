/**
 * NequiClient — REST client for Nequi Conecta push payments.
 *
 * Auth: AWS Signature v4 via node:crypto (no external deps).
 * Transport: native fetch (Node 20+).
 *
 * Mock mode (NEQUI_MOCK_MODE=1 or options.mockMode=true):
 *   - requestPayment → { transactionId: 'mock-tx-001', status: 'pending' }
 *   - getPaymentStatus → { status: 'pending', rawCode: '33' }
 *   No network calls, no SigV4 computation.
 */

import { NequiApiError } from './errors'
import { signRequest } from './sigv4'
import { mapNequiStatusCode } from './status-mapper'

export interface NequiCredentials {
  clientId: string
  apiKey: string
  appSecret: string
  phoneNumber: string
  commerceCode: string
}

export interface NequiPaymentStatus {
  status: 'pending' | 'paid' | 'failed' | 'expired' | 'cancelled'
  rawCode?: string
  message?: string
}

interface NequiClientOptions {
  baseUrl?: string
  mockMode?: boolean
}

export class NequiClient {
  private readonly baseUrl: string
  private readonly mockMode: boolean

  constructor(
    private readonly creds: NequiCredentials,
    private readonly options?: NequiClientOptions,
  ) {
    const isMock = options?.mockMode === true || process.env.NEQUI_MOCK_MODE === '1'
    this.mockMode = isMock

    if (isMock) {
      // Base URL irrelevant in mock — assign empty to satisfy type
      this.baseUrl = ''
    } else {
      this.baseUrl =
        options?.baseUrl ?? process.env.NEQUI_API_BASE_URL ?? 'https://api.nequi.com/payments/v2'
    }
  }

  /**
   * Send a push payment request to the buyer's phone.
   * Returns transactionId (= Nequi's internal ID) immediately.
   * Poll getPaymentStatus() until terminal.
   */
  async requestPayment(params: {
    phoneNumber: string // buyer's phone, /^3\d{9}$/
    amount: number // COP integer
    messageId: string // order ID as string
    reference?: string
  }): Promise<{ transactionId: string; status: 'pending' }> {
    if (this.mockMode) {
      return { transactionId: 'mock-tx-001', status: 'pending' }
    }

    const url = `${this.baseUrl}/charges`
    const bodyObj = {
      commerceId: this.creds.clientId,
      phoneNumber: params.phoneNumber,
      value: params.amount,
      messageId: params.messageId,
      ...(params.reference ? { reference: params.reference } : {}),
    }
    const bodyStr = JSON.stringify(bodyObj)

    const response = await this.signedFetch('POST', url, bodyStr)

    if (!response.ok) {
      const text = await response.text()
      throw new NequiApiError(
        `Nequi requestPayment failed: ${text}`,
        'NEQUI_REQUEST_FAILED',
        response.status,
      )
    }

    const json = await response.json()

    // Nequi returns transactionId in multiple possible paths — normalise
    const transactionId: string = json?.transactionId ?? json?.data?.transactionId ?? json?.id

    if (!transactionId) {
      throw new NequiApiError('Nequi response missing transactionId', 'NEQUI_MISSING_TX_ID', 502)
    }

    return { transactionId, status: 'pending' }
  }

  /**
   * Poll transaction status.
   * Maps Nequi numeric code to canonical NequiPaymentStatus.
   */
  async getPaymentStatus(transactionId: string): Promise<NequiPaymentStatus> {
    if (this.mockMode) {
      return { status: 'pending', rawCode: '33' }
    }

    const url = `${this.baseUrl}/charges/${encodeURIComponent(transactionId)}`
    const response = await this.signedFetch('GET', url, '')

    if (!response.ok) {
      const text = await response.text()
      throw new NequiApiError(
        `Nequi getPaymentStatus failed: ${text}`,
        'NEQUI_STATUS_FAILED',
        response.status,
      )
    }

    const json = await response.json()

    // Code may be at root or nested under status/data
    const rawCode: string =
      json?.status?.statusCode ??
      json?.statusCode ??
      json?.data?.statusCode ??
      json?.code ??
      'unknown'

    const message: string | undefined = json?.status?.statusDesc ?? json?.message

    return {
      status: mapNequiStatusCode(rawCode),
      rawCode,
      ...(message ? { message } : {}),
    }
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private async signedFetch(method: string, url: string, body: string): Promise<Response> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': this.creds.apiKey,
    }

    const signed = signRequest({
      method,
      url,
      headers,
      body,
      service: 'execute-api',
      region: 'us-east-1',
      accessKeyId: this.creds.clientId,
      secretAccessKey: this.creds.appSecret,
    })

    return fetch(url, {
      method,
      headers: { ...headers, ...signed },
      body: method !== 'GET' ? body : undefined,
    })
  }
}
