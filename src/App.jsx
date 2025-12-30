import Snow from './Snow'
import SantaSleigh from './SantaSleigh'
import Tree3D from './Tree3D'
import ConfettiBurst from './ConfettiBurst'
import AnimatedText from './AnimatedText'
import SnowAccumulation from './SnowAccumulation'
import SantaCard from './SantaCard'
import AudioPlayer from './AudioPlayer'
import { useEffect, useRef, useState } from 'react'
import { Fireworks } from 'fireworks-js'
import './App.css'

function App() {
  const [isOpen, setIsOpen] = useState(false)
  const [opening, setOpening] = useState(false)
  const fwContainerRef = useRef(null)
  const [treeSize, setTreeSize] = useState({ w: 420, h: 380 })
  const [message, setMessage] = useState(() => {
    try {
      const saved = localStorage.getItem('ny-message')
      return saved || 'ขอให้สุขภาพเเข็งเเรง และมีความสุขตลอดปีใหม่'
    } catch {
      return 'ขอให้สุขภาพเเข็งเเรง และมีความสุขตลอดปีใหม่'
    }
  })
  const [cardOpen, setCardOpen] = useState(false)
  const audioRef = useRef(null)
  const [trackSrc, setTrackSrc] = useState(() => {
    const sp = new URLSearchParams(window.location.search)
    return sp.get('track') || '/music.mp3'
  })

  useEffect(() => {
    if (!isOpen || !fwContainerRef.current) return

    const options = {
      hue: { min: 0, max: 360 },
      acceleration: 1.02,
      friction: 0.98,
      gravity: 1.5,
      particles: 120,
      traceLength: 3,
      explosion: 6,
      brightness: { min: 50, max: 80 },
    }

    const fireworks = new Fireworks(fwContainerRef.current, options)
    fireworks.start()

    const stopId = setTimeout(() => {
      fireworks.stop()
    }, 6000)

    return () => {
      clearTimeout(stopId)
      fireworks.stop()
    }
  }, [isOpen])

  // Responsive tree size for mobile
  useEffect(() => {
    function updateSize() {
      const vw = Math.max(320, Math.min(window.innerWidth, 1024))
      const w = Math.min(420, Math.floor(vw - 64))
      const h = Math.round(w * 0.9)
      setTreeSize({ w, h })
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  const openLetter = () => setIsOpen(true)
  const handleOpen = () => {
    if (opening || isOpen) return
    setOpening(true)
    // Start music immediately within user gesture
    try { audioRef.current && audioRef.current.play && audioRef.current.play() } catch {}
    setTimeout(() => {
      setIsOpen(true)
      setOpening(false)
    }, 900)
  }

  const onSantaClick = () => {
    try {
      const u = new SpeechSynthesisUtterance('Ho ho ho!')
      u.lang = 'en-US'
      u.rate = 0.9
      u.pitch = 0.8
      window.speechSynthesis && window.speechSynthesis.speak(u)
    } catch {}
    setCardOpen(true)
  }

  const saveMessage = (txt) => {
    setMessage(txt)
    try { localStorage.setItem('ny-message', txt) } catch {}
  }

  return (
    <div className="app">
      <div ref={fwContainerRef} className="fireworks-container" />

      <div className="scene">
        {!isOpen ? (
          <div className={`envelope${opening ? ' opening' : ''}`} onClick={handleOpen}>
            <div className="flap" />
            <div className="paper">
              <p>กดเพื่อเปิดจดหมาย</p>
            </div>
          </div>
        ) : (
          <div className="content">
            <AnimatedText as="h1" text="Happy New Year!" className="glow" />
            <AnimatedText as="p" text={message} step={0.05} />
            <Snow />
            <SantaSleigh onClick={onSantaClick} />
            <div className="tree-wrap">
              <Tree3D width={treeSize.w} height={treeSize.h} interactive={true} />
            </div>
            {isOpen && <SnowAccumulation />}
            <SantaCard open={cardOpen} initial={message} onClose={() => setCardOpen(false)} onSave={saveMessage} />
          </div>
        )}
        {/* Render AudioPlayer always so it's mounted before the envelope click */}
        <AudioPlayer ref={audioRef} src={trackSrc} onSetSrc={(url)=>{
          setTrackSrc(url)
          const U = new URL(window.location.href)
          U.searchParams.set('track', url)
          window.history.replaceState({}, '', U)
        }} />
        {opening && <ConfettiBurst />}
      </div>
    </div>
  )
}

export default App
