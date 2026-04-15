/**
 * NequiApiError — typed error from Nequi REST API.
 */

export class NequiApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
  ) {
    super(message)
    this.name = 'NequiApiError'
  }
}
