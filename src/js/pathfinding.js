function createInfluenceMap (map) {

  const { height, width } = map

  const influenceMap = {
    width, height,
    data: [],
  }

  for (let y = 0; y < height; y++) {
    influenceMap.data[y] = []
    for (let x = 0; x < width; x++) {
      const tile = map.data[y][x]
      // TODO door tiles
      if (tile && tile.type === FLOOR_TILE) {
        influenceMap.data[y][x] = { x, y, weight: Infinity, open: true }
      } else {
        influenceMap.data[y][x] = null
      }
    }
  }

  return influenceMap
}

function populateInfluenceMap (map, target) {

  const initialWeight = 0

  let queue = []

  const current = map.data[target.y][target.x]
  current.weight = initialWeight

  queue.push(current)

  while (queue.length) {
    // grab the first item from the queue
    const current = queue.shift()
    const neighbours = getNeighbours(map, current.x, current.y)
    neighbours.forEach(neighbour => {
      // if the neighbour is not solid, or not already done, add to queue
      if (neighbour !== null && neighbour.open) {
        queue.push(neighbour)
        neighbour.open = false
      }
    })
    // special case for target
    if (current.weight === initialWeight) continue
    const lowest = neighbours.filter(Boolean).sort(byWeight)[0]
    current.weight = lowest.weight + 1
  }
}
