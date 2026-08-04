// Shared constants and helpers used across this package's startos/ code.
// Port numbers referenced by both main.ts (env wiring / health checks) and
// interfaces.ts (binding) live here so the two stay in sync.

// Internal port the memos web UI listens on. Matches the image default
// (MEMOS_PORT=5230) and the ui interface binding in interfaces.ts.
export const uiPort = 5230

// Sentinel for "derive MEMOS_INSTANCE_URL from the current ui address at
// runtime". Stored as '' in store.json so main.ts's `instanceUrl || <derived>`
// fallback routes to derivation. Mirrors linkwarden's PRIMARY_URL_AUTO.
export const INSTANCE_URL_AUTO = '__auto__'
