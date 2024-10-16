import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
// import './App.css'
import { VirtualList } from './libs'
import { FixedList as List } from './libs/FixedList';
import { InfiniteList } from './libs/InfiniteList';

const Row = ({ index, style }) => (
  <div key={index} style={style}>Row {index}</div>
);

function App() {

  const [count, setCount] = useState(20)
  return (
    <div>
      <List
        height={150}
        itemCount={1000}
        itemSize={35}
        width={300}
      >
        {Row}
      </List>
      <p>Infinite List </p>
      <InfiniteList
        height={150}
        itemCount={count}
        itemSize={35}
        width={300}
        loadMore={() => {
          setTimeout(() => {
            setCount(prev => prev + 20)
          }, 500);
        }}>
        {Row}
      </InfiniteList>
    </div>
  )
}

export default App
