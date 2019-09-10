function generateMaze (rng, width, height, x, y) {

  const graph = createGraph(width, height)

  const start = graph.data[y][x]
  start.open = false
  start.entrance = true
  graph.entrance = start
  graph.width = width
  graph.height = height

  const frontier = getNeighbours(graph, start.x, start.y)

  while (frontier.length > 0) {

    const index = rng.randomIntBetween(0, frontier.length - 1)
    const nextNode = frontier.splice(index, 1)[0]

    // nearby nodes already in maze
    const closedNeighbours = getNeighbours(graph, nextNode.x, nextNode.y).filter(node => node.open === false)

    const alreadyIn = rng.randomItem(closedNeighbours)

    // join them on the shared edge
    if (nextNode.x === alreadyIn.x) {
      if (nextNode.y > alreadyIn.y) {
        // below
        nextNode.top = false
        alreadyIn.bottom = false
      } else {
        // above
        nextNode.bottom = false
        alreadyIn.top = false
      }
    } else {
      if (nextNode.x > alreadyIn.x) {
        // right
        nextNode.left = false
        alreadyIn.right = false
      } else {
        // left
        nextNode.right = false
        alreadyIn.left = false
      }
    }

    nextNode.open = false
    nextNode.weight = alreadyIn.weight + 1
    const frontierNeighbours = getNeighbours(graph, nextNode.x, nextNode.y).filter(node => node.open === true)
    frontierNeighbours.forEach(node => {
      if (frontier.includes(node)) return
      frontier.push(node)
    })
  }

  // pick exit
  const all = flat(graph.data)
  const ends = all.filter(isEnd)

  rng.shuffle(ends)
  ends.sort(byWeight)

  let exitNode = ends[ends.length - 1]
  let keyNode = ends[ends.length - 2]
  let secretNode = ends[Math.floor(ends.length / 2)]

  // pre rooms
  const preSecret = getConnected(secretNode, graph)
  preSecret.preSecret = true

  const preExit = getConnected(exitNode, graph)
  preExit.preExit = true

  exitNode.exit = true
  keyNode.key = true
  secretNode.secret = true

  graph.exit = exitNode

  return graph
}

// get the room connected to this single exit room
const getConnected = (node, graph) => {
  if (node.top === false) return getMap(graph, node.x, node.y - 1)
  if (node.bottom === false) return getMap(graph, node.x, node.y + 1)
  if (node.left === false) return getMap(graph, node.x - 1, node.y)
  if (node.right === false) return getMap(graph, node.x + 1, node.y)
}

// has exactly 3 walls
const isEnd = node => [node.top, node.left, node.bottom, node.right].filter(n => n).length === 3

const byWeight = (a,b) => a.weight - b.weight

function createGraph (width, height) {

  const data = []

  for (let y = 0; y < height; y++) {
    data[y] = []
    for (let x = 0; x < width; x++) {
      data[y][x] = {
        x: x,
        y: y,
        top: true, // walls all initially solid
        left: true,
        bottom: true,
        right: true,
        open: true, // open if not in maze yet
        weight: 0, // distance from start
        exit: false,
      }
    }
  }

  return {
    width,
    height,
    data
  }
}
