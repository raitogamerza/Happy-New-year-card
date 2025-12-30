import React, { useEffect, useRef, useState, useCallback } from 'react'

// A canvas overlay that accumulates snow flakes over time.
// On touch or drag, the snow is cleared with a swipe gesture.
export default function SnowAccumulation() {
  const canvasRef = useRef(null)
  const [ctx, setCtx] = useState(null)
  const flakesRef = useRef([])
  const rafRef = useRef(0)
  const lastTimeRef = useRef(0)
  const audioCtxRef = useRef(null)
  const levelRef = useRef(0) // 0..1 approximate accumulation level
  const [isFull, setIsFull] = useState(false)
  const [hintVisible, setHintVisible] = useState(false)
  const uiTimeRef = useRef(0)

  // Fill screen with snow immediately
  const fillNow = useCallback(() => {
    if (!ctx) return
    const { innerWidth: w, innerHeight: h } = window
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = 'rgba(255,255,255,1)'
    ctx.fillRect(0, 0, w, h)
    levelRef.current = 1
    setIsFull(true)
  }, [ctx])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    function resize() {
      const { innerWidth: w, innerHeight: h } = window
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
    }
    resize()
    window.addEventListener('resize', resize)
    const c = canvas.getContext('2d')
    c.scale(dpr, dpr)
    setCtx(c)

    flakesRef.current = []
    lastTimeRef.current = performance.now()

    function loop(now) {
      const dt = Math.min(0.05, (now - lastTimeRef.current) / 1000)
      lastTimeRef.current = now
      update(dt)
      draw()
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  function spawnFlake() {
    const { innerWidth: w, innerHeight: h } = window
    const size = 2 + Math.random() * 3
    const speed = 30 + Math.random() * 50
    flakesRef.current.push({ x: Math.random() * w, y: -10, r: size, vy: speed })
  }

  function update(dt) {
    // spawn flakes each frame (denser accumulation)
    for (let i = 0; i < 10; i++) spawnFlake()
    const { innerWidth: w, innerHeight: h } = window
    // settle flakes onto bottom accumulation buffer
    for (const f of flakesRef.current) {
      f.y += f.vy * dt
      if (f.y > h - 2) {
        f.y = h - 2
        f.vy = 0
      }
    }
    // limit memory
    if (flakesRef.current.length > 2000) flakesRef.current.splice(0, flakesRef.current.length - 2000)
  }

  function draw() {
    if (!ctx) return
    const { innerWidth: w, innerHeight: h } = window
    // fade frame slightly to create accumulation effect
    const baseAlpha = 0.10
    ctx.fillStyle = `rgba(255,255,255,${baseAlpha})`
    ctx.fillRect(0, 0, w, h)
    // estimate accumulation level exponentially
    const L = levelRef.current
    levelRef.current = 1 - (1 - L) * (1 - baseAlpha)
    // UI throttle
    const now = performance.now()
    if (now - uiTimeRef.current > 150) {
      const full = levelRef.current >= 0.85
      if (full !== isFull) setIsFull(full)
      if (full) setHintVisible(true)
      if (levelRef.current <= 0.05) {
        if (hintVisible) setHintVisible(false)
        // ping server when cleared fully (optional)
        if (navigator.sendBeacon) {
          try { navigator.sendBeacon('/snow-cleared') } catch {}
        }
      }
      uiTimeRef.current = now
    }
    // slightly stronger accumulation near bottom
    const grad = ctx.createLinearGradient(0, h * 0.6, 0, h)
    grad.addColorStop(0, 'rgba(255,255,255,0.02)')
    grad.addColorStop(1, 'rgba(255,255,255,0.08)')
    ctx.fillStyle = grad
    ctx.fillRect(0, h * 0.6, w, h * 0.4)
    // draw falling flakes
    ctx.fillStyle = '#ffffff'
    for (const f of flakesRef.current) {
      ctx.beginPath()
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  function ensureAudio() {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (AudioContext) audioCtxRef.current = new AudioContext()
    }
    return audioCtxRef.current
  }
  function playSwipeNoise() {
    const ctxA = ensureAudio()
    if (!ctxA) return
    const duration = 0.25
    const sampleRate = ctxA.sampleRate
    const buffer = ctxA.createBuffer(1, sampleRate * duration, sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5
    }
    const source = ctxA.createBufferSource()
    source.buffer = buffer
    const gain = ctxA.createGain()
    gain.gain.setValueAtTime(0, ctxA.currentTime)
    gain.gain.linearRampToValueAtTime(0.35, ctxA.currentTime + 0.03)
    gain.gain.linearRampToValueAtTime(0.0, ctxA.currentTime + duration)
    const filter = ctxA.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(1600, ctxA.currentTime)
    source.connect(filter)
    filter.connect(gain)
    gain.connect(ctxA.destination)
    source.start()
  }

  // swipe-to-clear (listen on window so canvas can be pointer-events:none)
  useEffect(() => {
    if (!ctx) return
    let swiping = false
    function isSwipeGesture(evt) {
      if (evt.touches && evt.touches.length >= 2) return true // two-finger on mobile
      if (!evt.touches && (evt.shiftKey || (evt.buttons === 2))) return true // desktop: hold Shift or right mouse
      return false
    }
    function start(e) {
      if (!isSwipeGesture(e)) return
      swiping = true
      setHintVisible(false)
      playSwipeNoise()
      handle(e)
      levelRef.current = Math.max(0, levelRef.current - 0.2)
      setIsFull(false)
    }
    function end() { swiping = false }
    function handle(e) {
      const touches = e.touches ? e.touches : [e]
      for (const t of touches) {
        const x = t.clientX
        const y = t.clientY
        ctx.globalCompositeOperation = 'destination-out'
        ctx.beginPath()
        ctx.arc(x, y, 36, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalCompositeOperation = 'source-over'
      }
    }
    window.addEventListener('touchstart', start, { passive: true })
    window.addEventListener('touchmove', handle, { passive: true })
    window.addEventListener('touchend', end)
    window.addEventListener('mousedown', start)
    const moveHandler = (e) => { if (swiping) handle(e) }
    window.addEventListener('mousemove', moveHandler)
    window.addEventListener('mouseup', end)
    return () => {
      window.removeEventListener('touchstart', start)
      window.removeEventListener('touchmove', handle)
      window.removeEventListener('touchend', end)
      window.removeEventListener('mousedown', start)
      window.removeEventListener('mousemove', moveHandler)
      window.removeEventListener('mouseup', end)
    }
  }, [ctx])

  // Auto fill every 5 minutes
  useEffect(() => {
    if (!ctx) return
    const id = setInterval(() => fillNow(), 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [ctx, fillNow])

  return (
    <div className="snow-accum-wrap" aria-hidden>
      <canvas ref={canvasRef} className="snow-accum" />
      {hintVisible && (
        <div className={`snow-hint ${isFull ? 'show' : ''}`}>
          <div className="snow-hint-text">หิมะเต็มแล้ว ใช้สองนิ้วปัดเพื่อลบ</div>
          <div className="snow-hint-bar"><span style={{ width: `${Math.round(levelRef.current * 100)}%` }} /></div>
        </div>
      )}
    </div>
  )
}
