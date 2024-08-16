import { useLayoutEffect, useRef, useState } from "react";
import { createBrowserHistory } from "./history";
import { Update } from "./typings";
import { NavigationContext, LocationContext } from "./contexts";
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
  return <div>{matches[matches.length - 1].route.element}</div>;
};

export const Route = (props: {
  path?: string;
  element: JSX.Element;
  children?: React.ReactNode;
}) => {
  return props.element;
};
