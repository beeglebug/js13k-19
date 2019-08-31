const padding = 4
const lineHeight = 8

// TODO center text
// TODO text color (via second canvas)
function renderTextBox (ctx, text, background = '#000000') {
  const lines = text.split('\n').map(str => str.trim())
  const max = [...lines].sort((a, b) => (b.length - a.length))[0].length

  // background box
  let boxWidth = (max * 4) + (padding * 2)
  if (boxWidth %2 !== 0) boxWidth += 1

  let boxHeight = (lines.length * lineHeight) + (padding * 2) - 2
  if (boxHeight %2 !== 0) boxHeight += 1

  const boxX = (width - boxWidth) / 2
  const boxY = (height - boxHeight) / 2
  ctx.fillStyle = background
  ctx.fillRect(boxX, boxY, boxWidth, boxHeight)

  lines.forEach((line, i) => {
    const lineY = (i * lineHeight) + padding
    renderText(ctx, line, boxX + padding, boxY + lineY)
  })
}

function renderText (ctx, text, x, y) {
  text.toUpperCase().split('').forEach((char, i) => {
    const sx = getX(char)
    if (sx === null) return
    const ox = i * 4
    ctx.drawImage(
      imgFont,
      sx, 0,
      3, 5,
      x + ox,
      y,
      3, 5
    )
  })
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
