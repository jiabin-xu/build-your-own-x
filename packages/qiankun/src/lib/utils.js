export const qiankunHeadTagName = 'qiankun-head';
// import { version } from '../package.json';

const version = '1.0.0'

export function noop() {
  return undefined
}

export function getDefaultTplWrapper(name, sandboxOpts) {
  return function (tpl) {
    var tplWithSimulatedHead;

    if (tpl.indexOf('<head>') !== -1) {
      // We need to mock a head placeholder as native head element will be erased by browser in micro app
      tplWithSimulatedHead = tpl
        .replace('<head>', "<" + qiankunHeadTagName + ">")
        .replace('</head>', "</" + qiankunHeadTagName + ">");
    } else {
      // Some template might not be a standard html document, thus we need to add a simulated head tag for them
      tplWithSimulatedHead = "<" + qiankunHeadTagName + "></" + qiankunHeadTagName + ">" + tpl;
    }
    version
    return "<div id=\"" + getWrapperId(name) + "\" data-name=\"" + name + "\" data-version=\"" + + "\" data-sandbox-cfg=" + JSON.stringify(sandboxOpts) + ">" + tplWithSimulatedHead + "</div>";
  };
}


export function getWrapperId(name) {
  return `__qiankun_microapp_wrapper_for_${name}__`;
}

export function isEnableScopedCSS(sandbox) {
  if (typeof sandbox !== 'object') {
    return false;
  }

  if (sandbox.strictStyleIsolation) {
    return false;
  }

  return !!sandbox.experimentalStyleIsolation;
}

export function createElement(appContent, strictStyleIsolation, scopedCSS, appInstanceId) {
  const containerElement = document.createElement('div');
  containerElement.innerHTML = appContent;
  // appContent always wrapped with a singular div
  const appElement = containerElement.firstChild;

  return appElement;
}

export function getRender(appInstanceId, appContent) {
  return function ({ element, loading, container }, phase) {
    const containerElement = document.querySelector(container);
    if (containerElement) {
      containerElement.innerHTML = '';
      containerElement.appendChild(element)
    }
  }
}