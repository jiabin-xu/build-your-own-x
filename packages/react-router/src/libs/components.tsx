import { useLayoutEffect, useRef, useState } from "react";
import { createBrowserHistory } from "./history";
import { Update } from "./typings";
import { NavigationContext, LocationContext } from "./contexts";

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
      <LocationContext.Provider value={{ location: location }}>
        {children}
      </LocationContext.Provider>
    </NavigationContext.Provider>
  );
};

export const Routes = (props: { children: React.ReactNode }) => {
  return <div>{props.children}</div>;
};

export const Route = (props: { path?: string; element: JSX.Element }) => {
  return props.element;
};
