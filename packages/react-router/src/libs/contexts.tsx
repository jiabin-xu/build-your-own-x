import React from "react";
import { To } from "./typings";

interface LocationContextObject {
  location: Location;
}

export interface Navigator {
  createHref: any;
  // Optional for backwards-compat with Router/HistoryRouter usage (edge case)
  encodeLocation?: any;
  go: History["go"];
  push: (to: To, state?: any, opts?: any) => void;
  replace: (to: To, state?: any, opts?: any) => void;
}

export const LocationContext = React.createContext<LocationContextObject>(
  null!
);

interface NavigationContextObject {
  basename: string;
  navigator: Navigator;
  // static: boolean;
}

export const NavigationContext = React.createContext<NavigationContextObject>(
  null!
);

export interface RouteContextObject {
  outlet: React.ReactElement | null;
  matches: any[];
}

export const RouteContext = React.createContext<RouteContextObject>({
  outlet: null,
  matches: [],
});
