import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

export function useRoute() {
  return useSyncExternalStore(
    subscribe,
    () => window.location.hash.slice(1) || "/",
    () => "/",
  );
}
