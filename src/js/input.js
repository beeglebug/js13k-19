const KEY_Q = 81
const KEY_E = 69
const KEY_W = 87
const KEY_A = 65
const KEY_S = 83
const KEY_D = 68

const mousePosition = { x: 0, y: 0 }
const mouseMove = { x: 0, y: 0 }
const downKeys = {}

let mouseTimeout

function handleKeydown (e) {
  downKeys[e.which] = true
}

function handleKeyup (e) {
  downKeys[e.which] = false
}

function keyDown (key) {
  return !!downKeys[key]
}

function bindKeyboard (target) {
  target.addEventListener('keydown', handleKeydown)
  target.addEventListener('keyup', handleKeyup)
  target.addEventListener('mousemove', handleMouseMove)
}

const handleMouseMove = event => {
  clearTimeout(mouseTimeout)
  const { movementX, movementY, clientX, clientY } = event
  mousePosition.x = clientX
  mousePosition.y = clientY
  mouseMove.x = movementX || 0
  mouseMove.y = movementY || 0
  mouseTimeout = setTimeout(clearMouseMove, 50)
}

const clearMouseMove = () => {
  mouseMove.x = 0
  mouseMove.y = 0
}
