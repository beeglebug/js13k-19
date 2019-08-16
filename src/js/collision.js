function closestPointRect (point, rect, output = { x: 0, y: 0 }) {

  if (point.x < rect.x) {
    output.x = rect.x
  } else if (point.x > rect.x + rect.width) {
    output.x = rect.x + rect.width
  } else {
    output.x = point.x
  }

  if (point.y < rect.y) {
    output.y = rect.y
  } else if (point.y > rect.y + rect.height) {
    output.y = rect.y + rect.height
  } else {
    output.y = point.y
  }

  return output
}

function collideCircleRect (circle, rect) {

  const point = closestPointRect(circle, rect)

  if (!collidePointCircle(point, circle)) return false

  const distance = distanceBetween(point, circle)
  const depth = circle.radius - distance

  const normal = normalize({
    x: circle.x - point.x,
    y: circle.y - point.y,
  })

  // mtd
  return {
    x: normal.x * depth,
    y: normal.y * depth
  }
}

function collidePointCircle (point, circle) {

  const dx = Math.abs(circle.x - point.x)
  const dy = Math.abs(circle.y - point.y)

  return (dx * dx) + (dy * dy) < (circle.radius * circle.radius)
}

function distanceBetween (v1, v2) {

  const dx = Math.abs(v1.x - v2.x)
  const dy = Math.abs(v1.y - v2.y)

  return Math.sqrt((dx * dx) + (dy * dy))
}

function isZero (v) {
  return v.x === 0 && v.y === 0
}

function magnitude (v) {
  return Math.sqrt((v.x * v.x) + (v.y * v.y))
}

function normalize (v) {

  // shortcuts to avoid magnitude sqrt
  if (isZero(v)) return v

  if (v.x === 0) {
    v.y = v.y > 0 ? 1 : -1
    return v
  }

  if (v.y === 0) {
    v.x = v.x > 0 ? 1 : -1
    return v
  }

  const m = magnitude(v)

  v.x /= m
  v.y /= m

  return v
}
