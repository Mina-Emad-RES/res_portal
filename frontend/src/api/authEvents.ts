export const AUTH_LOGOUT_EVENT = "auth:logout";

export function emitLogout() {
  window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
}
