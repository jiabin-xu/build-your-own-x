import { useContext, useLayoutEffect, useRef, useState } from "react";
import { createBrowserHistory } from "./history";
import { RouteMatch, RouteObject, Update } from "./typings";
import {
  NavigationContext,
  LocationContext,
  RouteContextObject,
  RouteContext,
} from "./contexts";
import { createRoutesFromChildren } from "./utils";
import { useRoutes } from "./hooks";

export const BrowserRouter = (props: {
  basename: string;
  children: React.ReactNode;
}) => {
  const { basename, children } = props;
  const [location, setLocation] = useState(window.location);
  const historyRef = useRef<any>();
  if (historyRef.current === undefined) {
    historyRef.current = createBrowserHistory();
  }

  useLayoutEffect(() => {
    const unListen = historyRef.current.listen((update: Update) => {
      setLocation(update.location);
    });

    return () => {
      unListen();
    };
  });

  return (
    <NavigationContext.Provider
      value={{ basename, navigator: historyRef.current }}
    >
      <LocationContext.Provider value={{ location }}>
        {children}
      </LocationContext.Provider>
    </NavigationContext.Provider>
  );
};

export const Routes = (props: { children: React.ReactNode }) => {
  const matches = useRoutes(createRoutesFromChildren(props.children));

  if (matches.length === 0) {
    return null;
  }
  return matches.reduceRight((outlet, match, index) => {
    return (
      <RenderedRoute
        key={index}
        routeContext={{ outlet, matches: matches.slice(0, index + 1) }}
        match={match}
      />
    );
  }, null as React.ReactNode);
};

interface RenderedRouteProps {
  routeContext: RouteContextObject;
  match: RouteMatch<string, RouteObject>;
  children: React.ReactNode | null;
}

const RenderedRoute = (props: RenderedRouteProps) => {
  const { routeContext, match } = props;
  return (
    <RouteContext.Provider value={routeContext}>
      {match.route.element}
    </RouteContext.Provider>
  );
};

export const Route = (props: {
  path?: string;
  element: JSX.Element;
  children?: React.ReactNode;
}) => {
  return props.element;
};

export const Outlet = () => {
  const { outlet } = useContext(RouteContext);
  return outlet;
};
