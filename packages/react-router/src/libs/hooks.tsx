import { NavigateOptions } from "./typings";

export const useNavigate = () => {
  return (to: string | number, options?: NavigateOptions) => {
    console.log("Navigating to", to);
    console.log("options :>> ", options);
  };
};

export const useParams = () => {
  return {} as any;
};
