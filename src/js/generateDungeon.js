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
  const cellSize = 11

  const data = []
  for (let y = 0; y < height * cellSize; y++) {
    data[y] = Array.from(new Array(width * cellSize), () => null)
  }

  const maze = generateMaze(rng, width, height, 0, 0)

  const entities = []

  const map = {
    name: 'floor 3',
    maze,
    width: width * cellSize,
    height: height * cellSize,
    cellSize,
    data,
    floor: '#2e2827',
    ceiling: '#2e2827',
    fog: [46,40,39],
    fogDistance: 20,
    entities
  }

  flat(maze.data).forEach(room => {

    let roomSize = rng.randomItem([5, 7, 7, 9, 9, 9])

    // fixed room sizes
    if (room.entrance) roomSize = 5
    if (room.exit) roomSize = 9

    room.width = roomSize
    room.height = roomSize

    // turn some rooms with opposite doors into corridors
    if (room.top === false && room.bottom === false && rng.randomChance(30)) {
      room.width = 3
      room.height = 9
      room.corridoor = true
    }

    if (room.left === false && room.right === false && rng.randomChance(30)) {
      room.width = 9
      room.height = 3
      room.corridoor = true
    }

    const halfSize = Math.floor(cellSize / 2)

    const originX = room.x * cellSize
    const originY = room.y * cellSize

    const centerX = originX + halfSize
    const centerY = originY + halfSize

    let offsetX = Math.floor((cellSize - room.width) / 2)
    let offsetY = Math.floor((cellSize - room.height) / 2)

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
      for (let y = centerY; y <= originY + cellSize; y++) {
        data[y][x] = createTile(x, y, FLOOR_TILE)
      }
      if (rng.randomChance(50)) {
        const tile = data[originY + cellSize - 1][x]
        tile.type = 'D'
        tile.tooltip = 'E: Open'
        tile.onInteract = 'open_door'
      }
    }

    if (room.left === false) {
      const y = centerY
      for (let x = originX; x <= originX + halfSize; x++) {
        data[y][x] = createTile(x, y, FLOOR_TILE)
      }
    }

    if (room.right === false) {
      const y = centerY
      for (let x = centerX; x <= originX + cellSize; x++) {
        data[y][x] = createTile(x, y, FLOOR_TILE)
      }
      if (rng.randomChance(50)) {
        const tile = data[y][originX + cellSize - 1]
        tile.type = 'd'
        tile.tooltip = 'E: Open'
        tile.onInteract = 'open_door'
      }
    }

    // seed entities etc
    if (room.entrance) {
      map.spawn = [
        room.mapX + 0.5,
        room.mapY + 0.5,
        0.7071067811865475,
        0.7071067811865475
      ]
    } else if (room.exit) {

      let oppositeX = centerX
      let oppositeY = centerY
      if (room.top === false) oppositeY += 4
      if (room.bottom === false) oppositeY -= 4
      if (room.left === false) oppositeX += 4
      if (room.right === false) oppositeX -= 4

      entities.push(new Ladder(oppositeX + 0.5, oppositeY + 0.5, rng.seed))
      entities.push(new Ghost(centerX + 0.5, centerY + 0.5))

      data[centerY - 2][centerX - 2].type = '-'
      data[centerY + 2][centerX + 2].type = '-'
      data[centerY - 2][centerX + 2].type = '-'
      data[centerY + 2][centerX - 2].type = '-'

    } else {

      // add features

      // center pillar
      if (!room.corridoor && (roomSize === 5 || roomSize === 7) && rng.randomChance(20)) {
        data[centerY][centerX].type = '-'
      }

      // 4 corner pillars
      if (!room.corridoor && roomSize === 9 && rng.randomChance(50)) {
        data[centerY - 2][centerX - 2].type = '-'
        data[centerY + 2][centerX + 2].type = '-'
        data[centerY - 2][centerX + 2].type = '-'
        data[centerY + 2][centerX - 2].type = '-'
      }

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
