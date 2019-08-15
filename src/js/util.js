function outQuad (t) {
  return t * (2 - t)
}

// non sqrt distance for quick sorting
const distance = (v1, v2) => {
  return (v1.x - v2.x) * (v1.x - v2.x) + (v1.y - v2.y) * (v1.y - v2.y)
}

function rotate (v, delta) {
  let x = v.x
  v.x = v.x * Math.cos(delta) - v.y * Math.sin(delta)
  v.y = x * Math.sin(delta) + v.y * Math.cos(delta)
}

function perp (v) {
  return {
    x: v.y,
    y: -v.x
  }
}
