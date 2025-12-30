import React from 'react'

export default function AnimatedText({ text, as = 'span', step = 0.06, delay = 0.1, className = '' }) {
  const Tag = as
  const chars = Array.from(text)
  const nodes = []
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i]
    if (ch === '\n') {
      nodes.push(<br key={`br-${i}`} className="ani-br" />)
      continue
    }
    nodes.push(
      <span key={i} className="ani-ch" style={{ ['--d']: `${delay + i * step}s` }}>
        {ch}
      </span>
    )
  }
  return (
    <Tag className={`ani-text ${className}`} aria-label={text}>
      {nodes}
    </Tag>
  )
}