import { Axios } from "./core";

export default function createInstance(defaults) {
  const context = new Axios(defaults);
  const instance = Axios.prototype.request.bind(context);
  instance.interceptors = context.interceptors;
  return instance;
}

export const axios = createInstance({});
