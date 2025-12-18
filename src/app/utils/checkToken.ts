// Buffer time before actual expiry to proactively refresh (30 seconds)
const TOKEN_EXPIRY_BUFFER_MS = 30 * 1000;

export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));

    // exp is in seconds → convert to milliseconds
    const expiryTime = payload.exp * 1000;

    // Consider token expired 30 seconds before actual expiry
    return Date.now() > (expiryTime - TOKEN_EXPIRY_BUFFER_MS);
  } catch {
    return true; // if token is malformed → treat as expired
  }
}
