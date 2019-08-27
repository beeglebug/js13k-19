function generateDungeon (rng) {

  const width = 5
  const height = 5
  const size = 13

  const data = []
  for (let y = 0; y < height * size; y++) {
    data[y] = []
  }

  const maze = generateMaze(rng, width, height, 0, 0)

  flat(maze.data).forEach(room => {
    for (let ry = 0; ry < size; ry++) {
      for (let rx = 0; rx < size; rx++) {
        const y = room.y * size + ry
        const x = room.x * size + rx
        const type = rx === 0 || rx === size - 1 || ry === 0 || ry === size - 1 ? '-' : EMPTY_TILE
        data[y][x] = { x, y, type }
      }
    }

    // TODO sometimes do double rooms
    // punch out doors
    if (room.top === false) {
      const x = room.x * size + Math.floor(size / 2)
      const y = room.y * size
      data[y][x].type = EMPTY_TILE
    }

    if (room.left === false) {
      const x = room.x * size
      const y = room.y * size + Math.floor(size / 2)
      data[y][x].type = EMPTY_TILE
    }

    if (room.right === false) {
      const x = room.x * size + size - 1
      const y = room.y * size + Math.floor(size / 2)
      data[y][x].type = EMPTY_TILE
    }

    if (room.bottom === false) {
      const x = room.x * size + Math.floor(size / 2)
      const y = room.y * size + size - 1
      data[y][x].type = EMPTY_TILE
    }
  })

  return {
    width: width * size,
    height: height * size,
    data,
    floor: '#2e2827',
    ceiling: '#2e2827',
    fog: '#2e2827',
    fogDistance: 20,
    sprites: []
  }
}
