import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'

function AudioPlayerImpl({ src = '/music.mp3', onSetSrc }, ref) {
  const audioRef = useRef(null)
  const ytRef = useRef(null)
  const ytPlayerRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [ready, setReady] = useState(false)
  const [inputUrl, setInputUrl] = useState(src)

  const isYouTube = /youtu\.be|youtube\.com/i.test(src)

  function getYouTubeId(url) {
    try {
      if (!url) return null
      const u = new URL(url, window.location.origin)
      if (u.hostname.includes('youtu.be')) {
        return u.pathname.replace('/', '')
      }
      if (u.hostname.includes('youtube.com')) {
        const v = u.searchParams.get('v')
        if (v) return v
        // handle share links like /shorts/<id>
        const parts = u.pathname.split('/')
        const idx = parts.findIndex(p => p === 'shorts')
        if (idx !== -1 && parts[idx + 1]) return parts[idx + 1]
      }
    } catch {}
    return null
  }

  // HTML audio readiness
  useEffect(() => {
    if (isYouTube) return
    const a = audioRef.current
    if (!a) return
    function onCanPlay() { setReady(true) }
    a.addEventListener('canplay', onCanPlay)
    return () => a.removeEventListener('canplay', onCanPlay)
  }, [isYouTube])

  // YouTube IFrame API loader and player setup
  useEffect(() => {
    if (!isYouTube) return
    const vid = getYouTubeId(src)
    if (!vid) return
    function createPlayer() {
      if (!window.YT || !window.YT.Player) return
      if (ytPlayerRef.current) {
        try { ytPlayerRef.current.destroy() } catch {}
        ytPlayerRef.current = null
      }
      ytPlayerRef.current = new window.YT.Player(ytRef.current, {
        height: '0', width: '0',
        videoId: vid,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: () => setReady(true),
          onStateChange: (e) => {
            // 1: playing, 2: paused, 0: ended
            if (e?.data === 1) setPlaying(true)
            else if (e?.data === 2) setPlaying(false)
          }
        }
      })
    }
    if (!window.YT || !window.YT.Player) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.body.appendChild(tag)
      window.onYouTubeIframeAPIReady = () => createPlayer()
    } else {
      createPlayer()
    }
    return () => {
      if (ytPlayerRef.current) {
        try { ytPlayerRef.current.destroy() } catch {}
        ytPlayerRef.current = null
      }
    }
  }, [isYouTube, src])

  const toggle = async () => {
    if (isYouTube) {
      const p = ytPlayerRef.current
      if (!p) return
      try {
        if (!playing) { p.playVideo(); setPlaying(true) } else { p.pauseVideo(); setPlaying(false) }
      } catch (e) { console.warn('YouTube play failed:', e) }
    } else {
      const a = audioRef.current
      if (!a) return
      try {
        if (!playing) {
          await a.play()
          setPlaying(true)
        } else {
          a.pause()
          setPlaying(false)
        }
      } catch (e) {
        console.warn('Audio play failed (user gesture required?):', e)
      }
    }
  }

  useImperativeHandle(ref, () => ({
    async play() {
      if (isYouTube) {
        const p = ytPlayerRef.current
        if (!p) return
        try { p.playVideo(); setPlaying(true) } catch (e) { console.warn('YouTube play failed:', e) }
      } else {
        const a = audioRef.current
        if (!a) return
        try {
          await a.play()
          setPlaying(true)
        } catch (e) {
          console.warn('Audio play failed:', e)
        }
      }
    },
    pause() {
      if (isYouTube) {
        const p = ytPlayerRef.current
        if (!p) return
        try { p.pauseVideo(); setPlaying(false) } catch {}
      } else {
        const a = audioRef.current
        if (!a) return
        a.pause()
        setPlaying(false)
      }
    }
  }), [])

  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 480 : false)
  useEffect(() => {
    function onResize() { setIsMobile(window.innerWidth <= 480) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const containerStyle = {
    position: 'fixed',
    bottom: 12,
    left: isMobile ? 12 : 16,
    right: isMobile ? 12 : 'auto',
    zIndex: 120,
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    flexWrap: isMobile ? 'wrap' : 'nowrap',
    background: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: '8px 10px'
  }

  const inputStyle = {
    width: isMobile ? '100%' : 220,
    minWidth: isMobile ? '100%' : 0,
    padding: '6px 8px',
    borderRadius: 8,
    border: '1px solid #374151',
    color: '#fff',
    background: 'rgba(0,0,0,0.35)'
  }

  return (
    <div style={containerStyle}>
      <button onClick={toggle} style={{ background: '#1f2937', color: '#fff', border: '1px solid #374151', borderRadius: 10, padding: '6px 10px' }}>
        {playing ? 'หยุดเพลง' : 'เล่นเพลง'}
      </button>
      <span style={{ color: '#fff', opacity: 0.8, fontSize: 12 }}>{ready ? 'พร้อมเล่น' : 'กำลังโหลด...'}</span>
      {!isYouTube && <audio ref={audioRef} src={src} loop preload="auto" />}
      {isYouTube && <div ref={ytRef} style={{ width: 0, height: 0, overflow: 'hidden' }} />}
      <input value={inputUrl} onChange={(e)=>setInputUrl(e.target.value)} placeholder="วางลิงก์ YouTube หรือ MP3" style={inputStyle} />
      <button onClick={()=>{ onSetSrc && onSetSrc(inputUrl); }} style={{ background: '#374151', color: '#fff', border: '1px solid #4b5563', borderRadius: 10, padding: '6px 10px' }}>ตั้งเพลง</button>
      {/* ปุ่มแชร์เพลงถูกนำออกตามคำขอ */}
    </div>
  )
}

export default forwardRef(AudioPlayerImpl)
