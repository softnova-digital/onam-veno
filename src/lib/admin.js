// The results screen is gated by one shared passcode from .env.local.
// It keeps the running totals off the projector mid-round; it is not security.
export function checkPasscode(passcode) {
  const expected = process.env.ADMIN_PASSCODE;
  if (!expected) return false;
  return String(passcode ?? "").trim() === expected;
}
