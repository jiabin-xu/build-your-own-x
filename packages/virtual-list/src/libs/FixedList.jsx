import { useRef, useState } from 'react';


const overScan = 3

export const FixedList = (props) => {
  const containerRef = useRef(null)
  const [range, setRange] = useState([0, 15])
  const { width, height, itemCount, itemSize, children } = props

  const handleScroll = () => {
    if (containerRef.current) {
      const scrollTop = containerRef.current.scrollTop
      const start = Math.max(Math.floor(scrollTop / itemSize) - overScan, 0)
      const end = Math.min(Math.ceil((scrollTop + height) / itemSize) + overScan, itemCount - 1)
      setRange([start, end])
    }
  }

  return (
    <div style={{ width, height, position: 'relative', overflow: 'auto', willChange: 'transform' }} ref={containerRef} onScroll={handleScroll} >
      <div style={{ height: `${itemCount * itemSize}px` }}>
        {
          Array.from({ length: itemCount }).map((_, index) => index).slice(range[0], range[1]).map(index => {
            return children({ index, style: { position: 'absolute', top: `${index * itemSize}px` } })
          })
        }
      </div>
    </div>
  );
}