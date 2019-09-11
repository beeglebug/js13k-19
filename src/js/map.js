function generateOverworld () {
  const sky = ctx.createLinearGradient(0, 0, 0, height / 2)
  sky.addColorStop(0, '#7c9dbd')
  sky.addColorStop(1, '#a3b1bd')
  const entities = []
  for (let y = 0; y < 15; y+=2) {
    for (let x = 0; x < 15; x+=2) {
      entities.push(new Grave(x + 0.5, y + 0.5))
    }
  }
  return {
    ...parseMap([
      '================',
      '=~............~=',
      '=..............=',
      '=..............=',
      '=..............=',
      '=..............=',
      '=..............=',
      '=..............=',
      '=..............=',
      '=..............=',
      '=..............=',
      '=..............=',
      '=..............=',
      '=..............=',
      '=..............=',
      '=~............~=',
      '================',
    ]),
    name: 'surface',
    spawn: [8.5, 8.5, 0, 0.9999],
    fog: [156, 174, 189],
    fogDistance: 30,
    entities,
    sky,
    floor: 7,
    graph: { data: [] },
  }
}

const generateTitleMap = () => ({
  ...parseMap([
    '--~-~L--~--',
    '~.........-',
    '-.........-',
    '~..-...-..~',
    '-.........-',
    'd.........d',
    '~.........~',
    '-..-...-..-',
    '-.........~',
    '-.........-',
    '---~-D-----',
  ]),
  name: 'test map',
  spawn: [5.5, 5.5, 0, -0.9999],
  fog: [100,100,100],
  fogDistance: 10,
  floor: 5,
  entities: [],
  graph: { data: [] },
})

function loadMap (newMap) {
  map = newMap
  const [x, y, dx, dy] = map.spawn
  player.x = x
  player.y = y
  player.direction.x = dx
  player.direction.y = dy
  fowCtx.clearRect(0, 0, width, height)
  mapCtx.clearRect(0, 0, width, height)
  renderMap(mapCtx)
  influenceMap = createInfluenceMap(map)
  populateInfluenceMap(influenceMap, { x: Math.floor(player.x), y: Math.floor(player.y) })
}

function parseMap (arr) {
  return {
    height: arr.length,
    width: arr[0].length,
    data: arr.map((row, y) => row.split('').map((type, x) => ({ x, y, type, offset: 0 })))
  }
}

const textureIndexByTileType = {
  '-': 0,
  '=': 1,
  '~': 4,
  'D': 3,
  'd': 3,
  'L': 2,
  'l': 2,
  'X': 6,
}

function getMap (map, x, y) {
  return map.data[y] && map.data[y][x]
}

const getMapWorld = (map, { x, y }) => getMap(map, Math.floor(x), Math.floor(y))

function isEmpty (tile) {
  if (!tile) return true
  return (tile.type === FLOOR_TILE || tile.type === EMPTY_TILE)
}

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

const isHorizontalDoor = tile => (tile.type === 'D' || tile.type === 'L')
const isVerticalDoor = tile => (tile.type === 'd' || tile.type === 'l')
const isDoor = tile => isHorizontalDoor(tile) || isVerticalDoor(tile)
const isLockedDoor = tile => (tile.type === 'L' || tile.type === 'l')

function warpToRoom (room) {
  player.x = room.centerX
  player.y = room.centerY
}

function warpToRoomAt (x, y) {
  warpToRoom(map.graph.data[y][x])
}

function warpToBoss () {
  warpToRoom(flat(map.graph.data).find(room => room.key))
}

function warpToPreSecret () {
  warpToRoom(flat(map.graph.data).find(room => room.preSecret))
}

function warpToExit () {
  warpToRoom(flat(map.graph.data).find(room => room.exit))
}
