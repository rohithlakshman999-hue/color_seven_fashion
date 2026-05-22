// Ensure `self` is available in Node to match edge/browser globals used by Next dev middleware
if (typeof globalThis.self === 'undefined') {
  try {
    globalThis.self = globalThis;
  } catch (e) {
    // ignore
  }
}
