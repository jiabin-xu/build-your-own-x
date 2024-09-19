import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
// import './App.css'
import { VirtualList } from './libs'

function App() {
  const [data, setData] = useState(Array(20).fill().map((_, index) => ({ id: index })))
  return (
    <VirtualList
      data={data}
      itemRender={({ id }) => {
        return <p style={{ height: '40px', color: 'black', textAlign: 'center' }} key={id}>{id}</p>
      }}
      itemHeight={40}
      height={600}
      loadMore={() => {
        console.log('loadMore')
        let len = data.length
        let tempData = []
        for (let i = len; i < len + 10; i++) {
          tempData.push({ id: i })
        }
        setTimeout(() => {
          setData(() => [...data, ...tempData])
        }, 500);

      }}
    />
  )
}

export default App
