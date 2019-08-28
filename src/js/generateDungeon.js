function generateDungeon (rng) {

  const width = 5
  const height = 5
  const size = 15

  const data = []
  for (let y = 0; y < height * size; y++) {
    data[y] = Array.from(new Array(width * size), () => null)
  }

  const maze = generateMaze(rng, width, height, 0, 0)

  const map = {
    width: width * size,
    height: height * size,
    data,
    floor: '#2e2827',
    ceiling: '#2e2827',
    fog: '#2e2827',
    fogDistance: 20,
    entities: [
      { x: 5, y: 5, z: 0, scale: 1, index: 0 },
      { x: 4, y: 4, z: zPos(0.5), scale: 0.5, index: 1, collectible: true, radius: 0.2 },
      { x: 7, y: 7, z: 0, scale: 1, index: 5 },
    ]
  }

  flat(maze.data).forEach(room => {

    const roomSize = rng.randomIntBetween(5, 11)
    let roomWidth = roomSize
    let roomHeight = roomSize

    if (room.top === false && room.bottom === false && rng.randomChance(33)) {
      roomWidth = 3
      roomHeight = 11
    }

    if (room.left === false && room.right === false && rng.randomChance(33)) {
      roomWidth = 11
      roomHeight = 3
    }

    const halfSize = Math.floor(size / 2)

    // TODO randomise offset slightly (without breaking doors)

    const originX = room.x * size
    const originY = room.y * size

    const centerX = originX + halfSize
    const centerY = originY + halfSize

    const offsetX = Math.floor((size - roomWidth) / 2)
    const offsetY = Math.floor((size - roomHeight) / 2)

    for (let y = 0; y < roomHeight; y++) {
      for (let x = 0; x < roomWidth; x++) {
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
  })

  // add walls
  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      if (shouldBeWall(map, x, y)) {
        data[y][x] = { x, y, type: '-' }
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
