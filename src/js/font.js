// TODO center text
// TODO text color (via second canvas)
function renderText (ctx, text, background = '#000000') {
  const lines = text.toUpperCase().split('\n').map(str => str.trim())
  const max = [...lines].sort((a, b) => (b.length - a.length))[0].length

  const padding = 4
  const lineHeight = 8

  // background box
  let bw = (max * 4) + (padding * 2)
  if (bw %2 !== 0) bw += 1

  let bh = (lines.length * lineHeight) + (padding * 2) - 2
  if (bh %2 !== 0) bh += 1

  const bx = (width - bw) / 2
  const by = (height - bh) / 2
  ctx.fillStyle = background
  ctx.fillRect(bx, by, bw, bh)

  lines.forEach((line, y) => line.split('').forEach((c, x) => {
    const sx = getX(c)
    if (sx === null) return
    const dx = x * 4 + padding
    const dy = (y * lineHeight) + padding
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

// font currently handles chars 0-9 A-Z -,.:?
function getX (c) {
  const cc = c.charCodeAt(0)
  if (cc >= 44 && cc < 59) return (cc - 44) * 3
  if (cc === 39) return 126 // '
  if (cc === 63) return 123 // ?
  if (cc >= 65 && cc < 91) return ((cc - 65) * 3) + 45
  return null
}
