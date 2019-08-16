function getMap (x, y) {
  return map[y] && map[y][x]
}

function getSurrounding (x, y) {

  const height = map.length
  const width = map[0].length

  const neighbours = []

  // above
  if (y > 0) {
    if (x > 0) neighbours.push([x - 1, y - 1])
    neighbours.push([x, y - 1])
    if (x < width - 1) neighbours.push([x + 1, y - 1])
  }

  // left
  if (x > 0) neighbours.push([x - 1, y])

  // right
  if (x < width - 1) neighbours.push([x + 1, y])

  // below
  if (y < height - 1) {
    if (x > 0) neighbours.push([x - 1, y + 1])
    neighbours.push([x, y + 1])
    if (x < width - 1) neighbours.push([x + 1, y + 1])
  }

  return neighbours
}
