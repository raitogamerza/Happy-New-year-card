import React, { useEffect, useMemo, useRef, useState } from 'react'

export default function SantaCard({ open, initial, onClose, onSave }) {
  const [text, setText] = useState(initial || '')
  const dialogRef = useRef(null)

  useEffect(() => {
    if (open) setText(initial || '')
  }, [open, initial])

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose && onClose() }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const share = async () => {
    // Build a share URL that preserves current page params and includes the card message
    const url = new URL(window.location.href)
    url.searchParams.set('msg', text || '')
    const shareUrl = url.toString()
    if (navigator.share) {
      try { await navigator.share({ title: 'New Year Greeting', text, url: shareUrl }) } catch (e) {}
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl)
      alert('คัดลอกลิงก์การ์ดแล้ว!')
    } else {
      prompt('Copy this link', shareUrl)
    }
  }

  const save = () => { onSave && onSave(text); onClose && onClose() }

  if (!open) return null
  return (
    <div className="card-overlay" role="dialog" aria-modal="true" ref={dialogRef}>
      <div className="card">
        <h3>เขียนการ์ดอวยพร</h3>
        <textarea value={text} onChange={(e)=>setText(e.target.value)} placeholder="พิมพ์ข้อความของคุณที่นี่..." rows={5} />
        <div className="card-actions">
          <button onClick={save}>บันทึก</button>
          <button onClick={share}>แชร์ลิงก์</button>
          <button onClick={onClose}>ปิด</button>
        </div>
        <p className="card-hint">การแชร์ลิงก์นี้จะบันทึกข้อความไว้ใน URL</p>
      </div>
    </div>
  )
}
