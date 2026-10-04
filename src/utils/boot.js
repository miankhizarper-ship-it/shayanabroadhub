/**
 * First-load boot signal.
 *
 * The site presents a branded preloader until the first API-backed
 * view settles, so visitors never watch placeholder content flash
 * before their CMS data arrives (the "bulk image first" effect).
 *
 * The first `useResource` call anywhere in the public tree calls
 * `markAppReady()` when it settles (success OR error — the preloader
 * must never trap a visitor on a failing API). `SitePreloader`
 * listens for the signal and fades out; a failsafe timer in the
 * preloader covers views that fetch nothing at all.
 */

const READY_EVENT = "shb:app-ready";

let appReady = false;

/** Signal that the app's first data fetch has settled. Idempotent. */
export function markAppReady() {
  if (appReady) return;
  appReady = true;
  window.dispatchEvent(new CustomEvent(READY_EVENT));
}

/**
 * Subscribe to the ready signal. If the app is already ready, the
 * callback fires on the next microtask.
 * @param {() => void} callback
 * @returns {() => void} unsubscribe
 */
export function onAppReady(callback) {
  if (appReady) {
    queueMicrotask(callback);
    return () => {};
  }
  window.addEventListener(READY_EVENT, callback, { once: true });
  return () => window.removeEventListener(READY_EVENT, callback);
}
