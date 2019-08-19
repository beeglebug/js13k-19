const MAX = 99999

function createInfluenceMap (map) {

  const { height, width } = map

  const influenceMap = {
    width, height,
    data: []
  }

  for (let y = 0; y < height; y++) {
    influenceMap.data[y] = []
    for (let x = 0; x < width; x++) {
      const tile = getMap(map, x, y)
      if (tile !== null) {
        influenceMap.data[y][x] = null
      } else {
        influenceMap.data[y][x] = MAX
      }
    }
  }

  return influenceMap
}

function populateInfluenceMap (map, target) {

  map.data[target.y][target.x] = 0

  while (!isSolved(map)) {
    iterate(map, (x, y) => solve(x, y, map))
    iterateReverse(map, (x, y) => solve(x, y, map))
  }
}

function isSolved (map) {
  return !flat(map.data).includes(MAX)
}

function solve (x, y, map) {

  const lowest = getSurrounding(map, x, y, false)
      .map(([x, y]) => map.data[y][x])
      .filter(v => v !== null)
      .sort((a, b) => a - b)[0]

  const current = map.data[y][x]

  if (current - lowest > 1) {
    map.data[y][x] = lowest + 1
  }
}

