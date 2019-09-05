function generateDungeon (rng) {

  const map = generateFromMaze(rng)

  // add walls
  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      if (shouldBeWall(map, x, y)) {
        map.data[y][x] = { x, y, type: rng.randomChance(70) ? '-' : '~' }
      }
    }
  }

  // TODO type = FLOOR_TILE needs a better system (type = FLOOR/WALL, and texture index?)

  return map
}

function shouldBeWall (map, x, y) {
  if (map.data[y][x] !== null) return
  const near = getNeighbours(map, x, y, true)
  return near.filter(tile => tile && tile.type === FLOOR_TILE).length > 0
}


function generateFromMaze (rng) {

  const width = 5
  const height = 5
  const size = 15

  const data = []
  for (let y = 0; y < height * size; y++) {
    data[y] = Array.from(new Array(width * size), () => null)
  }

  const maze = generateMaze(rng, width, height, 0, 0)

  const entities = []

  const map = {
    width: width * size,
    height: height * size,
    data,
    floor: '#2e2827',
    ceiling: '#2e2827',
    fog: [46,40,39],
    fogDistance: 20,
    entities
  }

  flat(maze.data).forEach(room => {

    const roomSize = rng.randomItem([5, 7, 7, 9, 9, 9, 11, 11])

    room.width = roomSize
    room.height = roomSize

    if (room.top === false && room.bottom === false && rng.randomChance(33)) {
      room.width = 3
      room.height = 11
    }

    if (room.left === false && room.right === false && rng.randomChance(33)) {
      room.width = 11
      room.height = 3
    }

    const halfSize = Math.floor(size / 2)

    // TODO randomise offset slightly (without breaking doors)

    const originX = room.x * size
    const originY = room.y * size

    const centerX = originX + halfSize
    const centerY = originY + halfSize

    const offsetX = Math.floor((size - room.width) / 2)
    const offsetY = Math.floor((size - room.height) / 2)

    room.mapX = originX + offsetX
    room.mapY = originY + offsetY

    for (let y = 0; y < room.height; y++) {
      for (let x = 0; x < room.width; x++) {
        const rx = x + room.mapX
        const ry = y + room.mapY
        data[ry][rx] = createTile(rx, ry, FLOOR_TILE)
      }
    }

    if (room.top === false) {
      const x = centerX
      for (let y = originY; y <= originY + halfSize; y++) {
        data[y][x] = createTile(x, y, FLOOR_TILE)
      }
    }

    if (room.bottom === false) {
      const x = centerX
      for (let y = centerY; y <= originY + size; y++) {
        data[y][x] = createTile(x, y, FLOOR_TILE)
      }
      // TODO random doors
      const tile = data[originY + offsetY + room.height][x]
      tile.type = 'D'
      tile.tooltip = 'E: Open'
      tile.onInteract = 'open_door'
    }

    if (room.left === false) {
      const y = centerY
      for (let x = originX; x <= originX + halfSize; x++) {
        data[y][x] = createTile(x, y, FLOOR_TILE)
      }
    }

    if (room.right === false) {
      const y = centerY
      for (let x = centerX; x <= originX + size; x++) {
        data[y][x] = createTile(x, y, FLOOR_TILE)
      }
      // TODO random doors
      const tile = data[y][room.mapX + room.width]
      tile.type = 'd'
      tile.tooltip = 'E: Open'
      tile.onInteract = 'open_door'
    }

    // add features

    // center pillar
    if (rng.randomChance(20)) {
      data[centerY][centerX].type = '-'
    }

    // seed entities etc
    if (room.entrance) {
      entities.push(new Ladder(room.mapX + 0.5, room.mapY + 0.5, rng.seed))
    } else if (room.exit) {
      entities.push(new Ghost(centerX + 0.5, centerY + 0.5))
    } else {

      // TODO which rooms get enemies?
      const hasEnemies = rng.randomChance(80)

      if (hasEnemies) {
        const enemyCount = rng.randomIntBetween(1, 3)
        const open = getOpenRoomTiles(room, data)
        times(enemyCount, () => {
          const spot = rng.randomItem(open)
          entities.push(new Bat(spot.x + 0.5, spot.y + 0.5))
        })
      }
    }


      entities.push(new Cobweb(room.mapX + .2, room.mapY + room.height - .2))
      entities.push(new Cobweb(room.mapX + room.width - .2, room.mapY + .2))

  })

  return map
}

function getOpenRoomTiles (room, data) {
  const open = []
  for (let y = 0; y < room.height; y++) {
    for (let x = 0; x < room.width; x++) {
      const rx = x + room.mapX
      const ry = y + room.mapY
      const tile = data[ry][rx]
      if (!tile) continue
      if (isEmpty(tile)) open.push(tile)
    }
  }
  return open
}

function createTile (x, y, type) { return { x, y, type, offset: 0 } }
