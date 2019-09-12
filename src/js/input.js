const KEY_E = 'KeyE'
const KEY_W = 'KeyW'
const KEY_A = 'KeyA'
const KEY_S = 'KeyS'
const KEY_D = 'KeyD'
const KEY_M = 'KeyM'
const KEY_LEFT = 'ArrowLeft'
const KEY_UP = 'ArrowUp'
const KEY_RIGHT = 'ArrowRight'
const KEY_DOWN = 'ArrowDown'
const KEY_MINUS = 'Minus'
const KEY_PLUS = 'Equal'
const MOUSE_LEFT = 1
const MOUSE_RIGHT = 3

const downButtons = {}
const downKeys = {}

let mouseSensitivity = 5
let mouseSensitivityMax = 10
let mouseSensitivityAdjusted = false
let mouseSensitivityTimer

function adjustMouseSensitivity (value) {
  mouseSensitivity = clamp(mouseSensitivity + value, 1, mouseSensitivityMax)
  mouseSensitivityAdjusted = true
  clearTimeout(mouseSensitivityTimer)
  mouseSensitivityTimer = setTimeout(() => (mouseSensitivityAdjusted = false), 800)
}

function handleKeydown ({ code }) {
  if (!downKeys[code]) {
    if (code === KEY_E) interact()
    if (code === KEY_M) showMiniMap = !showMiniMap
    if (code === KEY_MINUS) adjustMouseSensitivity(-1)
    if (code === KEY_PLUS) adjustMouseSensitivity(+1)
  }
  downKeys[code] = true
}

function handleKeyup ({ code }) {
  downKeys[code] = false
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

function bindInput (target) {
  target.addEventListener('keydown', handleKeydown)
  target.addEventListener('keyup', handleKeyup)
  target.addEventListener('mousemove', handleMouseMove)
  target.addEventListener('mousedown', handleMouseDown)
  target.addEventListener('mouseup', handleMouseUp)
}

const handleMouseMove = event => {

  if (!hasPointerLock()) return
  if (state !== STATE_PLAY) return

  const { movementX } = event

  // some major magic numbers here
  const rotation = movementX / (1000 / remap(mouseSensitivity, 1, 10, 0.1, 5))

  if (movementX !== 0) {
    rotate(player.direction, rotation)
  }
}

function handleInput () {

  if (state !== STATE_PLAY) return

  const dirPerp = perp(player.direction)

  dirPerp.x *= -1
  dirPerp.y *= -1

  player.velocity.x = 0
  player.velocity.y = 0

  if (keyDown(KEY_W) || keyDown(KEY_UP)) {
    player.velocity.x += player.direction.x
    player.velocity.y += player.direction.y
  }

  if (keyDown(KEY_S) || keyDown(KEY_DOWN)) {
    player.velocity.x -= player.direction.x
    player.velocity.y -= player.direction.y
  }

  // strafe to the left
  if (keyDown(KEY_A) || keyDown(KEY_LEFT)) {
    player.velocity.x -= dirPerp.x
    player.velocity.y -= dirPerp.y
  }

  // strafe to the right
  if (keyDown(KEY_D) || keyDown(KEY_RIGHT)) {
    player.velocity.x += dirPerp.x
    player.velocity.y += dirPerp.y
  }

  normalize(player.velocity)
  multiply(player.velocity, player.speed)

  if (mouseDown(MOUSE_LEFT)) {
    shoot()
  }

  if (mouseDown(MOUSE_RIGHT)) {
    melee()
  }
}
