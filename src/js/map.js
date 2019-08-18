const oldMap = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 1, 0, 1],
  [0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
  [0, 0, 0, 0, 3, 1, 3, 1, 0, 0, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1],
]

const mapWidth = 32
const mapHeight = 32

const map = [
  '--------------------------------',
  '-                              -',
  '-  ---                         -',
  '-  -#-                         -',
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
  '-                        --    -',
  '-                        #-    -',
  '-                        --    -',
  '-                              -',
  '-                              -',
  '-     -#--                     -',
  '-     ----                     -',
  '-                              -',
  '-                              -',
  '--------------------------------'
].map(row => row.split('').map(t => t === ' ' ? null : t))


console.log(map)

const textureIndexByTileId = {
  ' ': null,
  '-': 0,
  '#': 1
}

function getMap (x, y) {
  return map[y] && map[y][x]
}

function getSurrounding (x, y) {

  const neighbours = []

  // above
  if (y > 0) {
    if (x > 0) neighbours.push([x - 1, y - 1])
    neighbours.push([x, y - 1])
    if (x < mapWidth - 1) neighbours.push([x + 1, y - 1])
  }

  // left
  if (x > 0) neighbours.push([x - 1, y])

  // right
  if (x < mapWidth - 1) neighbours.push([x + 1, y])

  // below
  if (y < mapHeight - 1) {
    if (x > 0) neighbours.push([x - 1, y + 1])
    neighbours.push([x, y + 1])
    if (x < mapWidth - 1) neighbours.push([x + 1, y + 1])
  }

  return neighbours
}
