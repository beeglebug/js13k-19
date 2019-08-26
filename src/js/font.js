function renderText (ctx, text) {
  const lines = text.toUpperCase().split('\n').map(str => str.trim())
  const max = [...lines].sort((a, b) => (b.length - a.length))[0].length

  const pad = 4
  const lineHeight = 8

  // background box
  let bw = (max * 4) + (pad * 2)
  if (bw %2 !== 0) bw += 1

  let bh = (lines.length * lineHeight) + (pad * 2) - 2
  if (bh %2 !== 0) bh += 1

  const bx = (width - bw) / 2
  const by = (height - bh) / 2
  ctx.fillStyle = '#000000'
  ctx.fillRect(bx, by, bw, bh)

  lines.forEach((line, y) => line.split('').forEach((c, x) => {
    const sx = getX(c)
    if (sx === null) return
    const dx = x * 4 + pad
    const dy = (y * lineHeight) + pad
    ctx.drawImage(
      imgFont,
      sx, 0,
      3, 5,
      dx + bx,
      dy + by,
      3, 5
    )
  }))
}

function getX (c) {
  const cc = c.charCodeAt(0)
  if (cc >= 44 && cc < 59) return (cc - 44) * 3
  if (cc === 39) return 126 // '
  if (cc === 63) return 123 // ?
  if (cc >= 65 && cc < 91) return ((cc - 65) * 3) + 45
  return null
}
