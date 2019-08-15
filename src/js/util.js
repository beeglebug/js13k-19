function outQuad (t) {
  return t * (2 - t)
}

// non sqrt distance for quick sorting
const distance = (v1, v2) => {
  return (v1.x - v2.x) * (v1.x - v2.x) + (v1.y - v2.y) * (v1.y - v2.y)
}
