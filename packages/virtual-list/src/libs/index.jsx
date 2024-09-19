import React, { useEffect, useRef, useState } from 'react';

export const VirtualList = (props) => {

  const loadMoreRef = useRef(null);
  const containerRef = useRef(null);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(props.data.length);

  const { data = [], itemHeight, height, itemRender, loadMore } = props;
  useEffect(() => {
    let observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        loadMore();
      }
    }, {
      rootMargin: '0px',
      threshold: 0.2
    })
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    }
  }, [data]);

  const handleScroll = () => {
    if (containerRef.current) {
      const scrollTop = containerRef.current.scrollTop
      let start = Math.floor(scrollTop / itemHeight)
      let end = Math.ceil((scrollTop + height) / itemHeight) + 1
      setStart(start)
      setEnd(end)
      // setFilerData(() => data.slice(start, end))
    }
  }
  const filerData = data.slice(start, end)

  return (
    <div style={{ height: `${height}px`, width: '100vw', backgroundColor: 'white', position: 'relative', overflowY: 'scroll' }} ref={containerRef} onScroll={handleScroll} >
      <div style={{ transform: `translateY(${start * itemHeight}px)` }} >

        {
          filerData.map(itemRender)
        }


      </div>
      <div ref={loadMoreRef} style={{ width: '100%', height: '40px', backgroundColor: 'red', position: 'absolute', top: `${data.length * itemHeight}px` }}>
        LoadMore
      </div>
    </div>
  );
}
