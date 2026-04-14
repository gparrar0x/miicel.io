/**
 * AWS Signature Version 4 — node:crypto only, no external deps.
 * Used by NequiClient to sign requests to Nequi Conecta API (AWS API Gateway backend).
 */

import * as crypto from 'node:crypto'

export interface SigV4Options {
  method: string
  url: string
  headers: Record<string, string>
  body: string
  service: string
  region: string
  accessKeyId: string
  secretAccessKey: string
  /**
   * Optional: override timestamp (for testing with fixed clock).
   */
  date?: Date
}

export interface SignedHeaders {
  Authorization: string
  'x-amz-date': string
  'x-amz-content-sha256': string
}

function sha256Hex(data: string): string {
  return crypto.createHash('sha256').update(data, 'utf8').digest('hex')
}

function hmacSha256(key: Buffer | string, data: string): Buffer {
  return crypto.createHmac('sha256', key).update(data, 'utf8').digest()
}

function toAmzDate(d: Date): string {
  // Format: YYYYMMDDTHHMMSSZ
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '')
}

function toDateStamp(d: Date): string {
  // Format: YYYYMMDD
  return d.toISOString().slice(0, 10).replace(/-/g, '')
}

/**
 * Sign a request with AWS SigV4 and return the Authorization + required headers.
 * Caller must include the returned headers in the actual HTTP request.
 */
export function signRequest(opts: SigV4Options): SignedHeaders {
  const now = opts.date ?? new Date()
  const amzDate = toAmzDate(now)
  const dateStamp = toDateStamp(now)

  const parsedUrl = new URL(opts.url)
  const canonicalUri = parsedUrl.pathname || '/'
  const canonicalQueryString = parsedUrl.searchParams.toString()

  const payloadHash = sha256Hex(opts.body)

  // Merge caller headers with required SigV4 headers.
  // Normalise to lowercase keys so canonical-form lookup is safe regardless of
  // caller casing (Content-Type vs content-type).
  const allHeaders: Record<string, string> = {
    host: parsedUrl.host,
    'x-amz-date': amzDate,
    'x-amz-content-sha256': payloadHash,
  }
  for (const [k, v] of Object.entries(opts.headers)) {
    allHeaders[k.toLowerCase()] = v
  }

  // Sort header names for canonical form
  const sortedHeaderNames = Object.keys(allHeaders).sort()

  const canonicalHeaders = sortedHeaderNames.map((k) => `${k}:${allHeaders[k].trim()}\n`).join('')

  const signedHeadersStr = sortedHeaderNames.join(';')

  const canonicalRequest = [
    opts.method.toUpperCase(),
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeadersStr,
    payloadHash,
  ].join('\n')

  const credentialScope = `${dateStamp}/${opts.region}/${opts.service}/aws4_request`

  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join('\n')

  // Derive signing key
  const kDate = hmacSha256(Buffer.from(`AWS4${opts.secretAccessKey}`, 'utf8'), dateStamp)
  const kRegion = hmacSha256(kDate, opts.region)
  const kService = hmacSha256(kRegion, opts.service)
  const kSigning = hmacSha256(kService, 'aws4_request')

  const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex')

  const authorization = [
    `AWS4-HMAC-SHA256 Credential=${opts.accessKeyId}/${credentialScope}`,
    `SignedHeaders=${signedHeadersStr}`,
    `Signature=${signature}`,
  ].join(', ')

  return {
    Authorization: authorization,
    'x-amz-date': amzDate,
    'x-amz-content-sha256': payloadHash,
  }
}
