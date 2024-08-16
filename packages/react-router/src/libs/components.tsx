export const BrowserRouter = (props: {
  basename: string;
  children: React.ReactNode;
}) => {
  return <div>{props.children}</div>;
};

export const Routes = (props: { children: React.ReactNode }) => {
  return <div>{props.children}</div>;
};

export const Route = (props: { path?: string; element: JSX.Element }) => {
  console.log("props :>> ", props);
  return null;
};
