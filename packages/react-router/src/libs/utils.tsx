import React from "react";
import { RouteMatch, RouteObject } from "./typings";

export function resolveTo(
  toArg: string,
  locationPathname: string,
  isPathRelative = false
): string {
  let to: string;

  if (isPathRelative) {
    // If the path is relative, resolve it against the current location
    to = `${locationPathname}/${toArg}`;
  } else {
    // If the path is absolute, use it as is
    to = toArg;
  }

  // Normalize the path by removing any redundant slashes
  to = to.replace(/\/+/g, "/");

  // Ensure the path starts with a single slash
  if (!to.startsWith("/")) {
    to = `/${to}`;
  }

  return to;
}

export function createRoutesFromChildren(
  children: React.ReactNode,
  parentPath? = ""
): RouteObject[] {
  const routes: RouteObject[] = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) {
      return;
    }

    const { path, element, children } = child.props as any;
    const route: RouteObject = { path: parentPath + path, element };

    routes.push(route);
    if (children) {
      const childrenRoutes = createRoutesFromChildren(
        children,
        parentPath + path
      );
      routes.push(...childrenRoutes);
    }
  });
  return routes;
}

function parsePath(path: string): string[] {
  return path.split("/").filter(Boolean);
}

export function matchPath(
  routePath: string,
  pathname: string
): { params: Record<string, string>; matched: boolean } {
  console.log("routePath :>> ", routePath);
  if (!routePath) {
    return { params: {}, matched: false };
  }
  const routeSegments = parsePath(routePath);
  const pathSegments = parsePath(pathname);

  if (routeSegments.length !== pathSegments.length) {
    return { params: {}, matched: false };
  }

  const params: Record<string, string> = {};

  for (let i = 0; i < routeSegments.length; i++) {
    const routeSegment = routeSegments[i];
    const pathSegment = pathSegments[i];

    if (routeSegment.startsWith(":")) {
      const paramName = routeSegment.slice(1);
      params[paramName] = pathSegment;
    } else if (routeSegment !== pathSegment) {
      return { params: {}, matched: false };
    }
  }

  return { params, matched: true };
}

function matchRouteBranch<
  ParamKey extends string,
  RouteObjectType extends RouteObject
>(
  route: RouteObjectType,
  basename: string,
  pathname: string,
  allowPartial: boolean
): RouteMatch<ParamKey, RouteObjectType> | null {
  const { params, matched } = matchPath(basename + route.path, pathname);
  if (matched || (allowPartial && pathname.startsWith(route.path))) {
    return {
      params: params as Record<ParamKey, string>,
      pathname: route.path,
      route: route,
    };
  }

  return null;
}

export function matchRoutes(
  routes: RouteObject[],
  location: Location,
  basename = "/"
) {
  const matchedRoute = [];
  const segments = parsePath(location.pathname);
  if (segments.length === 0) {
    segments.push("");
  }

  let index = 0;
  while (index < segments.length) {
    const pathname = "/" + segments.slice(0, index + 1).join("/");
    for (const route of routes) {
      const matched = matchRouteBranch(route, basename, pathname, false);
      if (matched) {
        matchedRoute.push(matched);
      }
    }
    index++;
  }
  return matchedRoute;
}
