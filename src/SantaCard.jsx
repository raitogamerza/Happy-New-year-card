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
    // Ask for sender's name; include both name and message in shared URL (message will be removed from URL after load)
    const name = window.prompt('กรอกชื่อของคุณสำหรับการ์ด', '')
    if (name === null) return // cancel
    const url = new URL(window.location.href)
    const nameTrim = (name || '').trim()
    if (nameTrim) url.searchParams.set('name', nameTrim)
    else url.searchParams.delete('name')
    const msgTrim = (text || '').trim()
    if (msgTrim) url.searchParams.set('msg', msgTrim)
    else url.searchParams.delete('msg')
    const shareUrl = url.toString()
    const shareText = [
      nameTrim ? `จาก: ${nameTrim}` : null,
      msgTrim || null,
    ].filter(Boolean).join('\n')
    if (navigator.share) {
      try { await navigator.share({ title: 'New Year Greeting', text: shareText, url: shareUrl }) } catch (e) {}
    } else if (navigator.clipboard) {
      const composite = shareText ? `${shareText}\n${shareUrl}` : shareUrl
      await navigator.clipboard.writeText(composite)
      alert('คัดลอกข้อความและลิงก์แล้ว!')
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
        <p className="card-hint">แชร์ลิงก์รวมชื่อและข้อความ; ข้อความจะถูกซ่อนจาก URL หลังเปิดหน้า</p>
      </div>
    </div>
  )
}
