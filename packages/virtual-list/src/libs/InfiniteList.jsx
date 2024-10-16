import { useEffect } from 'react';
import { useRef, useState } from 'react';


const overScan = 6

export const InfiniteList = (props) => {
  const containerRef = useRef(null)
  const loadMoreRef = useRef(null)

  const { width, height, itemCount, itemSize, children, loadMore } = props
  const [range, setRange] = useState([0, itemCount])

  useEffect(() => {
    let observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        console.log('loadMore :>> ');
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
  }, [itemCount, loadMore])

  const handleScroll = () => {
    if (containerRef.current) {
      const scrollTop = containerRef.current.scrollTop
      const start = Math.max(Math.floor(scrollTop / itemSize) - overScan, 0)
      const end = Math.min(Math.ceil((scrollTop + height) / itemSize) + overScan, itemCount)
      setRange([start, end])
    }
  }
  return (
    <div style={{ width, height, position: 'relative', overflow: 'auto', willChange: 'transform' }} ref={containerRef} onScroll={handleScroll} >
      <div style={{ height: `${itemCount * itemSize + 40}px` }}>
        {
          Array.from({ length: itemCount }).map((_, index) => index).slice(range[0], range[1] + 1).map(index => {
            return children({ index, style: { position: 'absolute', top: `${(index) * itemSize}px` } })
          })
        }
        <div ref={loadMoreRef} style={{ height: '40px', backgroundColor: 'red', position: 'absolute', top: `${(itemCount) * itemSize}px`, width: '100%' }}> LoadMore</div>
      </div>
    </div>
  );
}