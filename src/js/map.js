const map = {
  width: 32,
  height: 32,
  data: parseMap([
    '--------------------------------',
    '-                              -',
    '- ===                          -',
    '- =#=                          -',
    '-                              -',
    '-                              -',
    '-                              -',
    '-                              -',
    '-                              -',
    '-                              -',
    '-                              -',
    '-                              -',
    '-                              -',
    '-                              -',
    '-                              -',
    '-                              -',
    '-                              -',
    '-                              -',
    '-                              -',
    '-                              -',
    '-                              -',
    '-                              -',
    '-                        ==    -',
    '-                        #=    -',
    '-                        ==    -',
    '-                              -',
    '-                              -',
    '-                              -',
    '-     =#==                     -',
    '-     ====                     -',
    '-                              -',
    '--------------------------------'
  ])
}

function parseMap (arr) {
  return arr.map(row => row.split('').map(tile => tile === ' ' ? null : tile))
}

const textureIndexByTileId = {
  '-': 0,
  '=': 1,
  '#': 2,
}

function getMap (map, x, y) {
  return map.data[y] && map.data[y][x]
}

function getSurrounding (map, x, y) {

  const neighbours = []

  // above
  if (y > 0) {
    if (x > 0) neighbours.push([x - 1, y - 1])
    neighbours.push([x, y - 1])
    if (x < map.width - 1) neighbours.push([x + 1, y - 1])
  }

  // left
  if (x > 0) neighbours.push([x - 1, y])

  // right
  if (x < map.width - 1) neighbours.push([x + 1, y])

  // below
  if (y < map.height - 1) {
    if (x > 0) neighbours.push([x - 1, y + 1])
    neighbours.push([x, y + 1])
    if (x < map.width - 1) neighbours.push([x + 1, y + 1])
  }

  return neighbours
}
