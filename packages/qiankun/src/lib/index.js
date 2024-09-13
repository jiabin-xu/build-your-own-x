import { registerApplication, start as startSingleSpa } from 'single-spa';
import { loadApp } from './loader';
import { noop } from './utils';

let microApps = [];
let frameworkConfiguration = {}


export function start(params) {
  console.log('params :>> ', params);
  startSingleSpa({
    ...params,
    // urlRerouteOnly: true,
  })
}

export function registerMicroApps(apps, lifeCycles) {
  console.log('apps :>> ', apps);
  // Each app only needs to be registered once
  const unregisteredApps = apps.filter((app) => !microApps.some((registeredApp) => registeredApp.name === app.name));

  microApps = [...microApps, ...unregisteredApps];

  unregisteredApps.forEach((app) => {
    const { name, activeRule, loader = noop, props, ...appConfig } = app;

    registerApplication({
      name,
      app: async () => {
        loader(true);
        // await frameworkStartedDefer.promise;

        const { mount, ...otherMicroAppConfigs } = (
          await loadApp({ name, props, ...appConfig }, frameworkConfiguration, lifeCycles)
        )();

        return {
          mount: [async () => loader(true), ...toArray(mount), async () => loader(false)],
          ...otherMicroAppConfigs,
        };
      },
      activeWhen: activeRule,
      customProps: props,
    });
  });
}