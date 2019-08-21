const sky = ctx.createLinearGradient(0, 0, 0, height / 2)
sky.addColorStop(0, '#7c9dbd')
sky.addColorStop(1, '#a3b1bd')

const map1 = {
  ...parseMap([
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
  ...parseMap([
    '=====',
    '=   =',
    '=   =',
    '==#==',
  ]),
  floor: '#2e2827',
  ceiling: '#2e2827',
}

const rng = new RNG()

const map3 = generateDungeon(rng)

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
  const height = arr.length
  const width = arr[0].length
  const data = arr.map((row, y) => row.split('').map((type, x) => ({ x, y, type })))
  return {
    height,
    width,
    data
  }
}

const textureIndexByTileType = {
  '-': 0,
  '=': 1,
  '#': 2,
}

function getMap (map, x, y) {
  return map.data[y] && map.data[y][x]
}

function isEmpty (tile) {
  return tile.type === EMPTY_TILE
}

function getNeighbours (map, x, y) {

  const neighbours = []

  // left
  if (x > 0) neighbours.push(map.data[y][x - 1])

  // right
  if (x < map.width - 1) neighbours.push(map.data[y][x + 1])

  // above
  if (y > 0) {
    neighbours.push(map.data[y - 1][x])
  }

  // below
  if (y < map.height - 1) {
    neighbours.push(map.data[y + 1][x])
  }

  return neighbours
}
