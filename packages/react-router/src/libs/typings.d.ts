export interface Path {
  pathname: string;
  search: string;
  hash: string;
}

export interface Location<State = any> extends Path {
  state: State;
  key: string;
}

export type To = string | number;

export interface Update {
  action: Action;
  location: Location;
  delta: number | null;
}

export interface Listener {
  (update: Update): void;
}

export interface History {
  readonly action: Action;
  readonly location: Location;
  createHref(to: To): string;
  createURL(to: To): URL;
  encodeLocation(to: To): Path;
  push(to: To, state?: any): void;
  replace(to: To, state?: any): void;
  go(delta: number): void;
  listen(listener: Listener): () => void;
}

export type RouteObject = {
  index?: boolean;
  path?: string;
  children?: RouteObject[];
  element?: React.ReactNode | null;
};

export interface NavigateOptions {
  replace?: boolean;
  state?: any;
  preventScrollReset?: boolean;
  relative?: RelativeRoutingType;
  unstable_flushSync?: boolean;
  unstable_viewTransition?: boolean;
}
