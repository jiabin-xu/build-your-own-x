# 10 分钟动手实现可用的 react-router

## 背景

最近升级了项目中 react-router 从比较老的 4.x 版本升级到最新的 6.26，感叹 API 变化之大，有一种陌生的感觉。于是在阅读了源码之后，想通过实现一个简单的 react-router 来加深对其原理的理解。

## 目标

实现一个能满足项目中高频使用场景的 react-router，包括以下功能：

- [x] 基本路由匹配 /路由跳转
- [x] 嵌套路由 /动态路由
- [x] <outlet> 组件
- [x] useParams & useNavigate & useLocation

项目地址：[react-router-clone]()
项目演示 sandbox 地址：[react-router-clone-demo]()
对应的路由结构如下：

```tsx
export default function App() {
  return (
    <BrowserRouter basename="/">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/article/:id" element={<Article />} />
        <Route path="/about" element={<About />}>
          <Route path="/:name" element={<People />} />
        </Route>
        <Route path="/contact" element={<Contact />} />
        <Route element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
```

## 实践

在 react-router 官方文档中，对于提供了比较精炼的描述，包括以下几个部分：

1. 订阅和操作 history (Subscribing and manipulating the history stack)
2. 根据 URL 匹配对应的 Route （Matching the URL to your routes）
3. 渲染嵌套的 Route 组件 （Rendering a nested UI from the route matches）

### 订阅和操作 history

<!-- 对于 history 的操作，主要封装在 getUrlBasedHistory 中: -->

因为 popstate 事件在 JS 操作 history 时不会触发，所以需要需要代理 history 的 push 和 replace 方法，当这两个方法被调用时，更新 history stack 并通知 listener 有对应的变更。

```tsx
export function getUrlBasedHistory(
  getLocation: (window: Window, globalHistory: Window["history"]) => Location,
  createHref: (window: Window, to: To) => string
) {
  let listener: Listener | null = null;

  function notify(event?: PopStateEvent) {
    if (listener) {
      listener({ action: "POP", location: history.location, delta: 0 });
    }
  }

  const history = {
    listen(fn: Listener) {
      listener = fn;
      window.addEventListener("popstate", notify);

      return () => {
        listener = null;
        window.removeEventListener("popstate", notify);
      };
    },
    push(to: To, state: any) {
      window.history.pushState(state, "", createHref(window, to));
      notify();
    },
    replace(to: To, state: any) {
      window.history.replaceState(state, "", createHref(window, to));
      notify();
    },
    go(delta: number) {
      window.history.go(delta);
    },
    get location() {
      return getLocation(window, window.history);
    },
  };
  return history;
}
```

在 BrowserRouter 中，我们在 useLayoutEffect 中监听 popstate 事件，并在事件触发时更新 location，通过 LocationContext 将 location 传递给子组件。
此外，我们将封装之后的 history 方法 通过 NavigationContext 传递给子组件，使得可以在子组件中操作 history stack。
这样我们就完成了对 history 的订阅和操作。

```tsx
export const BrowserRouter = (props: {
  basename: string;
  children: React.ReactNode;
}) => {
  const { basename, children } = props;
  const [location, setLocation] = useState(window.location);
  const historyRef = useRef<any>();
  if (historyRef.current === undefined) {
    historyRef.current = createBrowserHistory();
  }

  useLayoutEffect(() => {
    const unListen = historyRef.current.listen((update: Update) => {
      setLocation(update.location);
    });

    return () => {
      unListen();
    };
  });

  return (
    <NavigationContext.Provider
      value={{ basename, navigator: historyRef.current }}
    >
      <LocationContext.Provider value={{ location }}>
        {children}
      </LocationContext.Provider>
    </NavigationContext.Provider>
  );
};
```

### 根据 URL 匹配对应的 Route

这个阶段的主要工作是将 URL 和 Route 进行匹配，找到匹配的 Route 为下一步的渲染做准备。

```tsx
export const Routes = (props: { children: React.ReactNode }) => {
  const matches = useRoutes(createRoutesFromChildren(props.children));

  if (matches.length === 0) {
    return null;
  }
  return matches[0].element;
};
```

上述代码中 createRoutesFromChildren 会将 children 转换为 Route 对象，然后通过 useRoutes 匹配当前 URL 对应的 Route。
实现逻辑并不复杂，通过简单的递归遍历 children，将树形结构转换为扁平结构的 Route 对象数组。

```tsx
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
```

接下来看一下核心的 matchPath 的实现

1. 对两个 segments 数组中的元素逐个进行比较
2. 如果匹配到动态 segment，将其存入 params 中
3. 如果有一个 segment 不匹配，则返回 false

```tsx
export function matchPath(
  routePath: string,
  pathname: string
): { params: Record<string, string>; matched: boolean } {
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
```

因为需要支持嵌套路由所以我们需要匹配所有符合规则的 Route。
例如 /about/people 路由中 /about 和 /about/people 都符合规则，所以我们需要匹配两个 Route。

```tsx
export function matchRoutes(
  routes: RouteObject[],
  location: Location,
  basename = "/"
) {
  const matchedRoute = [];
  const segments = parsePath(location.pathname);

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
```

于是我们我们通过 useRoutes 就可以获取到当前 URL 对应的 Route。这里有两个注意点

1. 需要考虑到部署到了非根目录场景，于是引入了 basename
2. 是用了 useMemo 避免相同 routes 的重复渲染

```tsx
export function useRoutes(routes: RouteObject[]) {
  const location = useLocation();
  const { basename } = useContext(NavigationContext);
  const matches = useMemo(() => {
    return matchRoutes(routes, location, basename);
  }, [location, basename, routes]);
  return matches;
}
```

### 渲染嵌套的 Route 组件

首先我们来看一下，新版本 react-router 里是如何利用<Outlet>组件来渲染嵌套的 Route 组件的。

```tsx
// 对应 Route 配置
<Route path="/about" element={<About />}>
  <Route path="/:name" element={<People />} />
</Route>;

function About() {
  const navigate = useNavigate();
  return (
    <>
      <h1 onClick={() => navigate(-1)}>About Us</h1>
      <Outlet />
    </>
  );
}

function People() {
  const { name } = useParams();
  return <h1>People: {`${name}`}</h1>;
}

export const Outlet = () => {
  const { outlet } = useContext(RouteContext);
  return outlet;
};
```

在这里 <Outlet> 组件相当于一个占位符，用来渲染可能的嵌套的 Route 组件，至于是否存在嵌套的组件，由 RouteContext 上下文中的 outlet 属性决定的。
x

让我们回到 Routes 组件中，在获取到当前路由匹配的 matches 后，我们需要经过如下步骤来处理：

1. 通过 reduceRight 来逐个将可能存在的嵌套 Route 传递给 <RenderedRoute> 组件的 routeContext
2. 在 <RenderedRoute> 组件中，通过 RouteContext.Provider 将 routeContext 传递给组件，即 Route 组件中声明的 element
3. 在 element 中，通过 RouteContext 获取到 outlet，然后渲染嵌套的 Route 组件

```tsx
export const Routes = (props: { children: React.ReactNode }) => {
  const matches = useRoutes(createRoutesFromChildren(props.children));

  if (matches.length === 0) {
    return null;
  }
  return matches.reduceRight((outlet, match, index) => {
    return (
      <RenderedRoute
        key={index}
        routeContext={{ outlet, matches: matches.slice(0, index + 1) }}
        match={match}
      />
    );
  }, null as React.ReactNode);
};

const RenderedRoute = (props: RenderedRouteProps) => {
  const { routeContext, match } = props;
  return (
    <RouteContext.Provider value={routeContext}>
      {match.route.element}
    </RouteContext.Provider>
  );
};
```

这里需要注意到一个细节点 `routeContext={{ outlet, matches: matches.slice(0, index + 1) }}`。 当前 Route 只能获取到当前匹配的 match.params 参数，所以需要通过 slice 来截断。

可以看到在 useParams 中通过 RouteContext 获取对应匹配的动态路由参数。

```tsx
export const useParams = () => {
  const { matches } = useContext(RouteContext);
  const routeMatch = matches[matches.length - 1];
  return routeMatch ? (routeMatch.params as any) : {};
};
```

最后查看一下 useNavigate 的实现，通过 NavigationContext 获取到 navigator 对象，然后调用 push 方法进行跳转。
在新版本中提供了新的 navigate 方法，支持传入 相对路径 和 delate 参数，大大方便了开发者。

```tsx
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
```

## 总结

在梳理 react-router 的核心实现中，发现核心原理并不复杂，但是设计非常巧妙。尤其是新版本中加入的 data api 和 outlet 等 API 虽然大大方便了开发者，但是代码复杂度也大大增加。对于 react-router 这个开源项目更加的敬畏！
