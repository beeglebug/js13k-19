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

  // TODO handle point inside, normal is whack
  if (normal.x === 0 && normal.y === 0) {
    // debugger
  }

  return {
    ...point,
    normal,
    depth
  }
}

function collidePointCircle (point, circle) {

  const dx = Math.abs(circle.x - point.x)
  const dy = Math.abs(circle.y - point.y)

  return (dx * dx) + (dy * dy) < (circle.radius * circle.radius)
}

function rayLineSegmentIntersection(ray, start, end) {

  const v1 = sub(ray, start)
  const v2 = sub(end, start)
  const v3 = { x: -ray.direction.y, y: ray.direction.x }

  const d = dot(v2, v3)

  // check for parallel
  if (Math.abs(d) < 0.000001) return null

  const t1 = cross(v2, v1) / d
  const t2 = dot(v1, v3) / d

  if (t1 >= 0 && (t2 >= 0 && t2 <= 1)) return t1

  return null
}
