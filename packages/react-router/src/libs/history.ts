// 1. 监听 popstate 事件
// 2. 当路由有变化时，通知订阅者

import { Listener, Location, To, Path } from "./typings";

export const history = createBrowserHistory();

export function createBrowserHistory() {
  function createBrowserLocation(
    window: Window,
    globalHistory: Window["history"]
  ) {
    const { pathname, search, hash } = window.location;
    return {
      pathname,
      search,
      hash,
      state: globalHistory.state,
      key: "default",
    };
  }

  function createBrowserHref(window: Window, to: To) {
    return typeof to === "string" ? to : createPath(to);
  }
  return getUrlBasedHistory(createBrowserLocation, createBrowserHref);
}

export function getUrlBasedHistory(
  getLocation: (window: Window, globalHistory: Window["history"]) => Location,
  createHref: (window: Window, to: To) => string
) {
  let listener: Listener | null = null;

  function notify(event?: PopStateEvent) {
    if (listener) {
      console.log("event :>> ", event);
      listener({ action: "POP", location: history.location, delta: 0 });
    }
  }

  const history = {
    listen(fn: Listener) {
      listener = fn;
      window.addEventListener("popstate", notify);

      return () => {
        console.log("cancel :>> ");
        listener = null;
        window.removeEventListener("popstate", notify);
      };
    },
    push(to: To, state: any) {
      window.history.pushState(state, "", createHref(window, to));
      notify();
    },
    replace(to: To, state: any) {
      window.history.replaceState(state, "", createHref(window, to));
      notify();
    },
    go(delta: number) {
      window.history.go(delta);
    },
    get location() {
      return getLocation(window, window.history);
    },
  };
  return history;
}

export function createPath({
  pathname = "/",
  search = "",
  hash = "",
}: Partial<Path>) {
  if (search && search !== "?") {
    pathname += search.charAt(0) === "?" ? search : `?${search}`;
  }
  if (hash && hash !== "#") {
    pathname += hash.charAt(0) === "#" ? hash : `#${hash}`;
  }
  return pathname;
}
