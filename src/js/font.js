const padding = 4
const lineHeight = 8

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
    renderCenteredText(ctx, whiteFont, line, boxY + lineY)
  })
}

function renderCenteredText (ctx, font, text, y) {
  const textWidth = text.length * 4
  const x = width / 2 - textWidth / 2
  return renderText(ctx, font, text, x, y)
}

function renderText (ctx, font, text, x, y) {
  text.toUpperCase().split('').forEach((char, i) => {
    const sourceX = getX(char)
    if (sourceX === null) return
    const offsetX = i * 4
    ctx.drawImage(
      font,
      sourceX, 0,
      3, 5,
      x + offsetX,
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
