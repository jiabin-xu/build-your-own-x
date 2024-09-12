import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from "./types";
import { InterceptorManager } from "./interceptor";
import mergeConfig from "./utils";

export class Axios {
  constructor(public defaults: AxiosRequestConfig) {
    this.defaults = defaults;
    this.interceptors = {
      request: new InterceptorManager<AxiosRequestConfig>(),
      response: new InterceptorManager<AxiosResponse>(),
    };
  }

  request(configOrUrl, config) {
    if (typeof configOrUrl === "string") {
      config = config || {};
      config.url = configOrUrl;
    } else {
      config = configOrUrl || {};
    }

    config = mergeConfig(this.defaults, config);

    config.method = config.method ? config.method.toUpperCase() : "GET";
    let chains = [];
    console.log("this.interceptors :>> ", this.interceptors);
    this.interceptors.request.forEach((interceptor) => {
      chains.unshift(interceptor.fulfilled, interceptor.rejected);
    });

    chains.push(this.dispatchRequest, undefined);

    this.interceptors.response.forEach((interceptor) => {
      chains.push(interceptor.fulfilled, interceptor.rejected);
    });

    let len = chains.length,
      i = 0;
    console.log("len :>> ", len);
    let promise = Promise.resolve(config);
    while (i < len) {
      const onFulfilled = chains[i++];
      const onRejected = chains[i++];

      promise = promise.then(onFulfilled, onRejected);
    }
    return promise;
  }

  dispatchRequest(config) {
    return fetch(config.url).then((res) => {
      return res.json();
    });
  }
}
