
function renderTextBox (ctx, text, background = '#000000') {

  // background box
  let boxWidth = (text.length * 4) + 8
  let boxHeight = 14

  const boxX = (width - boxWidth) / 2
  const boxY = (height - boxHeight) / 2

  ctx.fillStyle = background
  ctx.fillRect(boxX, boxY, boxWidth, boxHeight)

  renderCenteredText(ctx, whiteFont, text, boxY + 4)
}

function renderMultiLineText (ctx, lines, x, y) {
  lines.forEach((line, ix) => {
    renderText(ctx, whiteFont, line, x, y + ix * 10)
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
  if (cc >= 43 && cc < 59) return (cc - 43) * 3
  if (cc === 39) return 126 // '
  if (cc === 63) return 123 // ?
  if (cc >= 65 && cc < 91) return ((cc - 64) * 3) + 45
  return null
}
