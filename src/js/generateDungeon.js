function generateDungeon (rng) {

  const map = generateFromMaze(rng, 5, 5, 11)

  // add walls
  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      if (shouldBeWall(map, x, y)) {
        map.data[y][x] = { x, y, type: rng.randomChance(70) ? '-' : '~' }
      }
    }
  }

  // TODO type = FLOOR_TILE needs a better system (type = FLOOR/WALL, and texture index?)

  map.rng = rng

  return map
}

function shouldBeWall (map, x, y) {
  if (map.data[y][x] !== null) return
  const near = getNeighbours(map, x, y, true)
  return near.filter(tile => tile && tile.type === FLOOR_TILE).length > 0
}

function generateFromMaze (rng, width, height, cellSize) {

  const halfSize = Math.floor(cellSize / 2)

  const data = []
  for (let y = 0; y < height * cellSize; y++) {
    data[y] = Array.from(new Array(width * cellSize), () => null)
  }

  const maze = generateMaze(rng, width, height, 0, 0)

  const entities = []

  const map = {
    name: `Floor ${levelCount - level}`,
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

  const flatData = flat(maze.data)

  flatData.forEach(room => {

    room.size = rng.randomItem([5, 7, 7, 9, 9, 9])

    // fixed room sizes
    if (room.entrance) room.size = 5
    if (room.exit) room.size = 7
    if (room.key) room.size = 9
    if (room.secret) room.size = 7

    room.width = room.size
    room.height = room.size

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

    // add some doors

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
      if (!room.preSecret && rng.randomChance(50)) {
        const tile = data[originY + cellSize - 1][x]
        if (room.secret) {
          tile.type = FLOOR_TILE
        } else {
          tile.type = 'D'
          tile.tooltip = 'E: Open'
          tile.onInteract = 'open_door'
          room.bottomDoor = tile
        }
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
      if (!room.preSecret && rng.randomChance(50)) {
        const tile = data[y][originX + cellSize - 1]
        if (room.secret) {
          tile.type = FLOOR_TILE
        } else {
          tile.type = 'd'
          tile.tooltip = 'E: Open'
          tile.onInteract = 'open_door'
          room.rightDoor = tile
        }
      }
    }
  })

  const secretRoom = flatData.find(room => room.secret)

  // loop again so the structure is all done
  flatData.forEach(room => {

    const originX = room.x * cellSize
    const originY = room.y * cellSize

    const centerX = originX + halfSize
    const centerY = originY + halfSize

    let enemyCount

    // seed entities etc
    if (room.entrance) {

      map.spawn = [
        room.mapX + 0.5,
        room.mapY + 0.5,
        0.705691154353887,
        0.708519579593018
      ]

      enemyCount = 0

    } else if (room.key) {

      enemyCount = rng.randomIntBetween(2, 3)

      entities.push(new Ghost(centerX + 0.5, centerY + 0.5))

    } else if (room.exit) {

      let oppositeX = centerX
      let oppositeY = centerY
      if (room.top === false) oppositeY += 2
      if (room.bottom === false) oppositeY -= 2
      if (room.left === false) oppositeX += 2
      if (room.right === false) oppositeX -= 2

      entities.push(new Ladder(oppositeX + 0.5, oppositeY + 0.5))

      enemyCount = rng.randomIntBetween(2, 3)

      data[centerY - 2][centerX - 2].type = '-'
      data[centerY + 2][centerX + 2].type = '-'
      data[centerY - 2][centerX + 2].type = '-'
      data[centerY + 2][centerX - 2].type = '-'

    } else if (room.secret) {

      enemyCount = 0

    } else if (room.preSecret) {

      enemyCount = rng.randomIntBetween(2, 3)

      if (secretRoom.top === false) {
        let tile = data[room.mapY + room.height][centerX]
        tile.type = 'X'
        tile.damage = 0
      } else if (secretRoom.bottom === false) {
        let tile = data[room.mapY - 1][centerX]
        tile.type = 'X'
        tile.damage = 0
      } else if (secretRoom.left === false) {
        let tile = data[centerY][room.mapX + room.width]
        tile.type = 'X'
        tile.damage = 0
      } else if (secretRoom.right === false) {
        let tile = data[centerY][room.mapX - 1]
        tile.type = 'X'
        tile.damage = 0
      }

    } else {

      decorateRoom(room, data, rng, centerX, centerY)

      if (room.corridoor) {
        enemyCount = rng.randomIntBetween(0, 2)
      } else {
        enemyCount = rng.randomIntBetween(0, 3)
      }
    }

    if (enemyCount) {
      const open = getOpenRoomTiles(room, data)
      times(enemyCount, () => {
        const spot = rng.randomItem(open)
        entities.push(new Bat(spot.x + 0.5, spot.y + 0.5))
      })
    }

    rng.randomChance(30) && entities.push(new Cobweb(room.mapX + .2, room.mapY + room.height - .2))
    rng.randomChance(30) && entities.push(new Cobweb(room.mapX + .2, room.mapY + .2))
    rng.randomChance(30) && entities.push(new Cobweb(room.mapX + room.width - .2, room.mapY + .2))
    rng.randomChance(30) && entities.push(new Cobweb(room.mapX + room.width - .2, room.mapY + room.height - .2))

  })

  return map
}

function decorateRoom(room, data, rng, centerX, centerY) {

  if (room.corridoor) return

  // center pillar
  if ((room.size === 5 || room.size === 7) && rng.randomChance(20)) {
    data[centerY][centerX].type = '-'
    return
  }

  if (room.size === 7 || room.size === 9) {

    switch (rng.randomIntBetween(0, 5)) {
      case 0:
        // 4 corner pillars
        data[centerY - 2][centerX - 2].type = '-'
        data[centerY + 2][centerX + 2].type = '-'
        data[centerY - 2][centerX + 2].type = '-'
        data[centerY + 2][centerX - 2].type = '-'
        break
      case 1:
        // center cross
        data[centerY][centerX].type = '-'
        data[centerY - 1][centerX].type = '-'
        data[centerY + 1][centerX].type = '-'
        data[centerY][centerX + 1].type = '-'
        data[centerY][centerX - 1].type = '-'
        break
      case 2:
        // horizontal center line
        data[centerY][centerX - 1].type = '-'
        data[centerY][centerX].type = '-'
        data[centerY][centerX + 1].type = '-'
        break
      case 3:
        // vertical center line
        data[centerY - 1][centerX].type = '-'
        data[centerY][centerX].type = '-'
        data[centerY + 1][centerX].type = '-'
        break
    }
  }
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
