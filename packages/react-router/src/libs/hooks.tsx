import { useContext, useCallback } from "react";
import { LocationContext, NavigationContext } from "./contexts";
import { NavigateOptions } from "./typings";
import { resolveTo } from "./utils";

export function useLocation(): Location {
  return useContext(LocationContext).location;
}

export function useNavigate() {
  const { navigator, basename } = useContext(NavigationContext);
  const location = useLocation();

  const navigate = useCallback(
    (to: string | number, opts?: NavigateOptions) => {
      if (typeof to === "number") {
        navigator.go(to);
        return;
      }
      const { state, replace, relative } = opts || {};
      let path = resolveTo(to, location.pathname, relative === "path");
      if (basename !== "/") {
        path = basename + path;
      }
      replace ? navigator.replace(path, state) : navigator.push(path, state);
    },
    [basename, location.pathname, navigator]
  );
  return navigate;
}

export const useParams = () => {
  return {} as any;
};
