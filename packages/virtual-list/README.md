# Build Your Own Virtual List

通过简单的代码实现一个无限虚拟滚动列表

![alt text](https://web.dev/static/articles/virtualize-long-lists-react-window/image/difference-scrolling-bet-517c003019905_1920.jpg?hl=zh-cn)

## 任务拆解

分成两个部分来实现

1. 虚拟滚动列表
2. 无限滚动

## 虚拟滚动列表

虚拟滚动的技术点在于只渲染可视区域的列表项，而不是渲染整个列表。这样可以减少渲染的节点数量，提高性能。需要解决计算可视化区域 和布局两个问题
我们这里以固定高度的列表项为例，先不考虑动态高度的情况。需要分别制定

1. 列表的 width/height
2. 列表元素的个数和 高度
3. 最后需要提供 子元素的渲染函数

我们基于这样的 API 来实现一个虚拟滚动列表

```jsx
const Row = ({ index, style }) => (
  <div key={index} style={style}>
    Row {index}
  </div>
);

const List = (
  <FixedList height={150} itemCount={1000} itemSize={35} width={300}>
    {Row}
  </FixedList>
);
```

实现的原理如下

1. 在外层容器(.outer)上监听滚动事件， 通过计算 scrollTop 来确定当前可视区域的起始和结束位置，同时设置父容器布局为 relative
2. 设置内层容器(.inner)的高度为 itemCount \* itemSize， 保证滚动条的长度正确
3. 根据计算的 Range 设置子元素的 top 值为 `${index * itemSize}px`， 保证元素的位置正确

```jsx
const overScan = 3;

export const FixedList = (props) => {
  const containerRef = useRef(null);
  const [range, setRange] = useState([0, 15]);
  const { width, height, itemCount, itemSize, children } = props;

  const handleScroll = () => {
    if (containerRef.current) {
      const scrollTop = containerRef.current.scrollTop;
      const start = Math.max(Math.floor(scrollTop / itemSize) - overScan, 0);
      const end = Math.min(
        Math.ceil((scrollTop + height) / itemSize) + overScan,
        itemCount - 1
      );
      setRange([start, end]);
    }
  };

  return (
    <div
      id="outer"
      style={{
        width,
        height,
        position: "relative",
        overflow: "auto",
        willChange: "transform",
      }}
      ref={containerRef}
      onScroll={handleScroll}
    >
      <div id="inner" style={{ height: `${itemCount * itemSize}px` }}>
        {Array.from({ length: itemCount })
          .map((_, index) => index)
          .slice(range[0], range[1])
          .map((index) => {
            return children({
              index,
              style: { position: "absolute", top: `${index * itemSize}px` },
            });
          })}
      </div>
    </div>
  );
};
```

## 无限滚动

无限滚动的技术点在于当滚动到底部时，加载更多的数据。我们需要监听滚动事件，当滚动到底部时，触发加载更多的数据。

示例代码如下，相对于虚拟滚动列表，我们需要提供一个 loadMore 的函数

```jsx
const Row = ({ index, style }) => (
  <div key={index} style={style}>Row {index}</div>
);

const [count, setCount] = useState(20)

<InfiniteList
  height={150}
  itemCount={count}
  itemSize={35}
  width={300}
  loadMore={() => {
    setTimeout(() => {
      setCount((prev) => prev + 20);
    }, 500);
  }}
>
  {Row}
</InfiniteList>
```

### 具体实现

1. 在底部添加一个 div 作为加载更多的容器，布局 top 为 itemCount \* itemSize，即已经加载数据的最底部
2. 借助 IntersectionObserver 来监听这个 div 是否进入可视区域，如果进入可视区域，触发 loadMore 函数
3. 当 loadMore 加载完成之后，需要更新 itemCount 的值，重新计算 range，完成新数据的渲染

```jsx
useEffect(() => {
  let observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        console.log("loadMore :>> ");
        loadMore();
      }
    },
    {
      rootMargin: "0px",
      threshold: 0.2,
    }
  );
  if (loadMoreRef.current) {
    observer.observe(loadMoreRef.current);
  }

  return () => {
    if (loadMoreRef.current) {
      observer.unobserve(loadMoreRef.current);
    }
  };
}, [itemCount, loadMore]);

return (
  <div
    style={{
      width,
      height,
      position: "relative",
      overflow: "auto",
      willChange: "transform",
    }}
    ref={containerRef}
    onScroll={handleScroll}
  >
    <div style={{ height: `${itemCount * itemSize + 40}px` }}>
      {Array.from({ length: itemCount })
        .map((_, index) => index)
        .slice(range[0], range[1] + 1)
        .map((index) => {
          return children({
            index,
            style: { position: "absolute", top: `${index * itemSize}px` },
          });
        })}
      <div
        ref={loadMoreRef}
        style={{
          height: "40px",
          backgroundColor: "red",
          position: "absolute",
          top: `${itemCount * itemSize}px`,
          width: "100%",
        }}
      >
        {" "}
        LoadMore
      </div>
    </div>
  </div>
);
```

## 总结上文

本文参考了 react-window 的实现，通过简单的代码实现了一个虚拟滚动列表和无限滚动的功能。虚拟滚动列表通过监听滚动事件，计算可视区域的范围，只渲染可视区域的列表项，提高性能。无限滚动通过 IntersectionObserver 来监听加载更多的 div 是否进入可视区域，触发加载更多的数据。
