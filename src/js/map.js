function generateOverworld () {

  const sky = ctx.createLinearGradient(0, 0, 0, height / 2)
  sky.addColorStop(0, '#7c9dbd')
  sky.addColorStop(1, '#a3b1bd')

  const map = {
    ...parseMap([
      '--~----~~~',
      '~........-',
      '~........~',
      '~........~',
      '~........~',
      '~........~',
      '~........~',
      '-........-',
      '---~-~~---',
    ]),
    fog: '#A3B1BD',
    sky,
    entities: []
  }

  const rng = new RNG(250581)

  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 3; x++) {
      let seed = rng.randomInt()
      rng.setSeed(seed)
      map.entities.push(new Grave(2.5 + 2 * x, 2.5 + 2 * y, seed))
    }
  }

  return map
}

const createTestMap = () => ({
  ...parseMap([
    '--~-----~~~',
    '~.........-',
    '~.........-',
    '~.........-',
    '~-~--D--~~-',
    '~.........-',
    '~.........-',
    '~..-...-..~',
    '~.........~',
    '~.........~',
    '~.........~',
    '~..-...-..~',
    '-.........-',
    '-.........-',
    '-.........-',
    '-.........-',
    '-.........-',
    '-.........-',
    '-.........-',
    '-.........-',
    '-.........-',
    '-.........-',
    '---~--~~---',
  ]),
  name: 'test map',
  spawn: [5.5, 17.5, 0, -1],
  fog: [46,40,39],
  fogDistance: 20,
  entities: [
    // new Bat(3.5, 8.5),
    new Key(5.5, 8.5),
    // new Bat(7.5, 8.5),
  ]
})

function loadMap (newMap) {
  map = newMap
  const [x, y, dx, dy] = map.spawn
  player.x = x
  player.y = y
  player.direction.x = dx
  player.direction.y = dy

  miniMapWidth = map.width * MINI_MAP_TILE_SIZE
  miniMapHeight = map.height * MINI_MAP_TILE_SIZE

  miniMapCanvas.width = miniMapWidth
  miniMapCanvas.height = miniMapHeight
  mapCanvas.width = miniMapWidth
  mapCanvas.height = miniMapHeight
  fowCanvas.width = miniMapWidth
  fowCanvas.height = miniMapHeight

  fowCtx.clearRect(0, 0, miniMapWidth, miniMapHeight)
  mapCtx.clearRect(0, 0, miniMapWidth, miniMapHeight)
  renderMap(mapCtx)
  influenceMap = createInfluenceMap(map)
  populateInfluenceMap(influenceMap, { x: Math.floor(player.x), y: Math.floor(player.y) })
}

function parseMap (arr) {
  const height = arr.length
  const width = arr[0].length
  const data = arr.map((row, y) => row.split('').map((type, x) => {
    const tile = { x, y, type, offset: 0 }
    if (type === 'D') {
      tile.tooltip = 'E: open'
      tile.onInteract = 'open_door'
    }
    return tile
  }))
  return {
    height,
    width,
    data
  }
}

// TODO refactor into parse map
const textureIndexByTileType = {
  '-': 0,
  '=': 1,
  '#': 2,
  '~': 4,
  'D': 3,
  'd': 3,
  '/': 3,
}

function getMap (map, x, y) {
  return map.data[y] && map.data[y][x]
}

const getMapWorld = (map, { x, y }) => getMap(map, Math.floor(x), Math.floor(y))

// TODO needs improving
function isEmpty (tile) {
  if (!tile) return true
  return (tile.type === FLOOR_TILE || tile.type === EMPTY_TILE)
}

// TODO don't return null?
function getNeighbours (map, x, y, diagonal = false) {

  const neighbours = []

  // left
  if (x > 0) neighbours.push(map.data[y][x - 1])

  // right
  if (x < map.width - 1) neighbours.push(map.data[y][x + 1])

  // above
  if (y > 0) {
    neighbours.push(map.data[y - 1][x])
    if (diagonal) {
      if (x > 0) neighbours.push(map.data[y - 1][x - 1])
      if (x < map.width - 1) neighbours.push(map.data[y - 1][x + 1])
    }
  }

  // below
  if (y < map.height - 1) {
    neighbours.push(map.data[y + 1][x])
    if (diagonal) {
      if (x > 0) neighbours.push(map.data[y + 1][x - 1])
      if (x < map.width - 1) neighbours.push(map.data[y + 1][x + 1])
    }
  }

  return neighbours
}

function warpToBoss () {
  const exit = flat(map.maze.data).find(room => room.exit)
  player.x = exit.mapX + 1
  player.y = exit.mapY + 1
}
