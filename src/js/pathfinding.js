const MAX = 99999

function createInfluenceMap (map) {

  const { height, width } = map

  const influenceMap = {
    width, height,
    data: [],
  }

  for (let y = 0; y < height; y++) {
    influenceMap.data[y] = []
    for (let x = 0; x < width; x++) {
      const tile = getMap(map, x, y)
      if (tile !== null) {
        influenceMap.data[y][x] = null
      } else {
        influenceMap.data[y][x] = { x, y, value: MAX, open: true }
      }
    }
  }

  return influenceMap
}

function populateInfluenceMap (map, target) {

  const initialValue = 0

  let queue = []

  const current = map.data[target.y][target.x]
  current.value = initialValue

  queue.push(current)

  while (queue.length) {
    // grab the first item from the queue
    const current = queue.shift()
    const neighbours = getSurrounding(map, current.x, current.y).map(([x, y]) => map.data[y][x])
    neighbours.forEach(neighbour => {
      // if the neighbour is not solid, or not already done, add to queue
      if (neighbour !== null && neighbour.open) {
        queue.push(neighbour)
        neighbour.open = false
      }
    })
    // special case for target
    if (current.value === initialValue) continue
    const lowest = neighbours.filter(Boolean).sort(byValue)[0]
    current.value = lowest.value + 1
  }
}

const byValue = (a, b) => a.value - b.value
