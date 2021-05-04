import { useEffect, useRef } from 'react'
import './App.css'
import Canvas from './Canvas'

const { innerWidth, innerHeight } = window

function App() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    new Canvas(ref.current)
  }, [])

  return (
    <div className="text-center">
      <header className="text-white bg-secondary">HandTrail</header>
      <div>
        <canvas ref={ref} width={innerWidth} height={innerHeight}></canvas>
      </div>
    </div>
  )
}

export default App
