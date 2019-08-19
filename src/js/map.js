const sky = ctx.createLinearGradient(0, 0, 0, height / 2)
sky.addColorStop(0, '#7c9dbd')
sky.addColorStop(1, '#a3b1bd')

const map1 = {
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
    '-     ==#=                     -',
    '-     ====                     -',
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
    '-                              -',
    '-                              -',
    '-                              -',
    '--------------------------------'
  ]),
  fog: '#A3B1BD',
  floor: '#373433',
  ceiling: sky,
}

const map2 = {
  width: 5,
  height: 4,
  data: parseMap([
    '=====',
    '=   =',
    '=   =',
    '==#==',
  ]),
  floor: '#2e2827',
  ceiling: '#2e2827',
}

let influenceMap

function loadMap (newMap, x, y, dx, dy) {
  map = newMap
  player.x = x
  player.y = y
  player.direction.x = dx
  player.direction.y = dy
  influenceMap = createInfluenceMap(map)
  populateInfluenceMap(influenceMap, { x: Math.floor(player.x), y: Math.floor(player.y) })
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

function getSurrounding (map, x, y, diagonal = true) {

  const neighbours = []

  // above
  if (y > 0) {
    neighbours.push([x, y - 1])
    if (diagonal) {
      if (x > 0) neighbours.push([x - 1, y - 1])
      if (x < map.width - 1) neighbours.push([x + 1, y - 1])
    }
  }

  // left
  if (x > 0) neighbours.push([x - 1, y])

  // right
  if (x < map.width - 1) neighbours.push([x + 1, y])

  // below
  if (y < map.height - 1) {
    neighbours.push([x, y + 1])
    if (diagonal) {
      if (x > 0) neighbours.push([x - 1, y + 1])
      if (x < map.width - 1) neighbours.push([x + 1, y + 1])
    }
  }

  return neighbours
}

function iterate (map, callback) {
  const { height, width } = map
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      callback(x, y)
    }
  }
}

function iterateReverse (map, callback) {
  const { height, width } = map
  for (let y = height - 1; y >= 0; y--) {
    for (let x = width - 1; x >= 0; x--) {
      callback(x,y)
    }
  }
}
