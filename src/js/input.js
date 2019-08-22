const KEY_E = 69
const KEY_W = 87
const KEY_A = 65
const KEY_S = 83
const KEY_D = 68
const MOUSE_LEFT = 1

const mousePosition = { x: 0, y: 0 }
const mouseMove = { x: 0, y: 0 }
const downButtons = {}
const downKeys = {}

let mouseTimeout

function handleKeydown (e) {
  const key = e.which
  if (key === KEY_E && !downKeys[key]) {
    interact()
  }
  downKeys[key] = true
}

function handleKeyup (e) {
  downKeys[e.which] = false
}

function handleMouseDown (e) {
  downButtons[e.which] = true
}

function handleMouseUp (e) {
  downButtons[e.which] = false
}

function keyDown (key) {
  return !!downKeys[key]
}

function mouseDown (button) {
  return !!downButtons[button]
}

function bindKeyboard (target) {
  target.addEventListener('keydown', handleKeydown)
  target.addEventListener('keyup', handleKeyup)
  target.addEventListener('mousemove', handleMouseMove)
  target.addEventListener('mousedown', handleMouseDown)
  target.addEventListener('mouseup', handleMouseUp)
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
