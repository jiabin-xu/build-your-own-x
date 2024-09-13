import { importEntry } from 'import-html-entry';
import { getDefaultTplWrapper, isEnableScopedCSS, createElement, getRender } from './utils';

export async function loadApp(
  app,
  configuration,
  lifeCycles,
) {
  const { entry, name: appName } = app;
  const appInstanceId = appName;

  const markName = `[qiankun] App ${appInstanceId} Loading`;

  const {
    singular = false,
    sandbox = true,
    excludeAssetFilter,
    globalContext = window,
    ...importEntryOpts
  } = configuration;

  // get the entry html content and script executor
  const { template, execScripts, assetPublicPath, getExternalScripts } = await importEntry(entry, importEntryOpts);
  console.log('template :>> ', template);
  console.log('assetPublicPath :>> ', assetPublicPath);
  // trigger external scripts loading to make sure all assets are ready before execScripts calling
  await getExternalScripts();


  const appContent = getDefaultTplWrapper(appInstanceId, sandbox)(template);

  const strictStyleIsolation = typeof sandbox === 'object' && !!sandbox.strictStyleIsolation;


  const scopedCSS = isEnableScopedCSS(sandbox);
  let initialAppWrapperElement = createElement(
    appContent,
    strictStyleIsolation,
    scopedCSS,
    appInstanceId,
  );

  const initialContainer = 'container' in app ? app.container : undefined;
  const legacyRender = 'render' in app ? app.render : undefined;

  const render = getRender(appInstanceId, appContent);
  console.log('render :>> ', render);

  // 第一次加载设置应用可见区域 dom 结构
  // 确保每次应用加载前容器 dom 结构已经设置完毕
  render({ element: initialAppWrapperElement, loading: true, container: initialContainer }, 'loading');



  let global = globalContext;
  let mountSandbox = () => Promise.resolve();
  let unmountSandbox = () => Promise.resolve();
  const useLooseSandbox = typeof sandbox === 'object' && !!sandbox.loose;
  // enable speedy mode by default
  const speedySandbox = typeof sandbox === 'object' ? sandbox.speedy !== false : true;
  let sandboxContainer;


  // const {
  //   beforeUnmount = [],
  //   afterUnmount = [],
  //   afterMount = [],
  //   beforeMount = [],
  //   beforeLoad = [],
  // } = mergeWith({}, getAddOns(global, assetPublicPath), lifeCycles, (v1, v2) => concat(v1 ?? [], v2 ?? []));

  // await execHooksChain(toArray(beforeLoad), app, global);

  // get the lifecycle hooks from module exports
  debugger
  const scriptExports = await execScripts(global, sandbox && !useLooseSandbox, {
    scopedGlobalVariables: [],
  });
  console.log('scriptExports :>> ', scriptExports);
  const { bootstrap, mount, unmount, update } = getLifecyclesFromExports(
    scriptExports,
    appName,
    global,
    sandboxContainer?.instance?.latestSetProp,
  );

  const { onGlobalStateChange, setGlobalState, offGlobalStateChange } =
    getMicroAppStateActions(appInstanceId);

  // FIXME temporary way
  const syncAppWrapperElement2Sandbox = (element) => (initialAppWrapperElement = element);

  const parcelConfigGetter = (remountContainer = initialContainer) => {
    let appWrapperElement;
    let appWrapperGetter;

    const parcelConfig = {
      name: appInstanceId,
      bootstrap,
      mount: [
        async () => {
          if (process.env.NODE_ENV === 'development') {
            const marks = performanceGetEntriesByName(markName, 'mark');
            // mark length is zero means the app is remounting
            if (marks && !marks.length) {
              performanceMark(markName);
            }
          }
        },
        async () => {
          if ((await validateSingularMode(singular, app)) && prevAppUnmountedDeferred) {
            return prevAppUnmountedDeferred.promise;
          }

          return undefined;
        },
        // initial wrapper element before app mount/remount
        async () => {
          appWrapperElement = initialAppWrapperElement;
          appWrapperGetter = getAppWrapperGetter(
            appInstanceId,
            !!legacyRender,
            strictStyleIsolation,
            scopedCSS,
            () => appWrapperElement,
          );
        },
        // 添加 mount hook, 确保每次应用加载前容器 dom 结构已经设置完毕
        async () => {
          const useNewContainer = remountContainer !== initialContainer;
          if (useNewContainer || !appWrapperElement) {
            // element will be destroyed after unmounted, we need to recreate it if it not exist
            // or we try to remount into a new container
            appWrapperElement = createElement(appContent, strictStyleIsolation, scopedCSS, appInstanceId);
            syncAppWrapperElement2Sandbox(appWrapperElement);
          }

          render({ element: appWrapperElement, loading: true, container: remountContainer }, 'mounting');
        },
        mountSandbox,
        // exec the chain after rendering to keep the behavior with beforeLoad
        async () => execHooksChain(toArray(beforeMount), app, global),
        async (props) => mount({ ...props, container: appWrapperGetter(), setGlobalState, onGlobalStateChange }),
        // finish loading after app mounted
        async () => render({ element: appWrapperElement, loading: false, container: remountContainer }, 'mounted'),
        async () => execHooksChain(toArray(afterMount), app, global),
        // initialize the unmount defer after app mounted and resolve the defer after it unmounted

        async () => {
          if (process.env.NODE_ENV === 'development') {
            const measureName = `[qiankun] App ${appInstanceId} Loading Consuming`;
            performanceMeasure(measureName, markName);
          }
        },
      ],
      unmount: [
        async () => execHooksChain(toArray(beforeUnmount), app, global),
        async (props) => unmount({ ...props, container: appWrapperGetter() }),
        unmountSandbox,
        async () => execHooksChain(toArray(afterUnmount), app, global),
        async () => {
          render({ element: null, loading: false, container: remountContainer }, 'unmounted');
          offGlobalStateChange(appInstanceId);
          // for gc
          appWrapperElement = null;
          syncAppWrapperElement2Sandbox(appWrapperElement);
        },
        async () => {
          if ((await validateSingularMode(singular, app)) && prevAppUnmountedDeferred) {
            prevAppUnmountedDeferred.resolve();
          }
        },
      ],
    };

    if (typeof update === 'function') {
      parcelConfig.update = update;
    }

    return parcelConfig;
  };

  return parcelConfigGetter;
}