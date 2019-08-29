function generateDungeon (rng) {

  const map = generateFromMaze(rng)

  // add walls
  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      if (shouldBeWall(map, x, y)) {
        map.data[y][x] = { x, y, type: '-' }
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
    fog: '#2e2827',
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

    for (let y = 0; y < room.height; y++) {
      for (let x = 0; x < room.width; x++) {
        const rx = x + originX + offsetX
        const ry = y + originY + offsetY
        data[ry][rx] = { x: rx, y: ry, type: FLOOR_TILE }
      }
    }

    if (room.top === false) {
      const x = centerX
      for (let y = originY; y <= originY + halfSize; y++) {
        data[y][x] = { x, y, type: FLOOR_TILE }
      }
    }

    if (room.bottom === false) {
      const x = centerX
      for (let y = originY + halfSize; y <= originY + size; y++) {
        data[y][x] = { x, y, type: FLOOR_TILE }
      }
    }

    if (room.left === false) {
      const y = centerY
      for (let x = originX; x <= originX + halfSize; x++) {
        data[y][x] = { x, y, type: FLOOR_TILE }
      }
    }

    if (room.right === false) {
      const y = centerY
      for (let x = originX + halfSize; x <= originX + size; x++) {
        data[y][x] = { x, y, type: FLOOR_TILE }
      }
    }

    // seed entities etc
    if (room.entrance) {

      entities.push({
        x: originX + offsetX + 0.5,
        y: originY + offsetY + 0.5,
        z: 0, scale: 1, index: 7,
        tooltip: 'E: return to surface',
        onInteract: 'exit_tomb',
        seed: rng.seed,
      })

      entities.push({
        x: originX + offsetX + 4.5,
        y: originY + offsetY + 4.5,
        z: 0, scale: 1, index: 5,
        radius: 0.3,
        health: 50
      })

      entities.push({
        x: originX + offsetX + 3.5,
        y: originY + offsetY + 3.5,
        z: 0, scale: 1, index: 0,
        radius: 0.3,
        health: 50
      })

    }
  })

  return map
}
