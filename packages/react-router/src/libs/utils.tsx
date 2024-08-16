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
