const KEY_E = 69
const KEY_W = 87
const KEY_A = 65
const KEY_S = 83
const KEY_D = 68
const KEY_M = 77
const KEY_LEFT = 37
const KEY_UP = 38
const KEY_RIGHT = 39
const KEY_DOWN = 40
const MOUSE_LEFT = 1
const MOUSE_RIGHT = 3

const downButtons = {}
const downKeys = {}

function handleKeydown (e) {
  const key = e.which
  // TODO better way to do single key strokes
  if (key === KEY_E && !downKeys[key]) {
    interact()
  }
  if (key === KEY_M && !downKeys[key]) {
    showMiniMap = !showMiniMap
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

function bindInput (target) {
  target.addEventListener('keydown', handleKeydown)
  target.addEventListener('keyup', handleKeyup)
  target.addEventListener('mousemove', handleMouseMove)
  target.addEventListener('mousedown', handleMouseDown)
  target.addEventListener('mouseup', handleMouseUp)
}

let mouseSensitivity = 0.001

const handleMouseMove = event => {

  if (!hasPointerLock()) return

  const { movementX } = event

  const rotation = movementX * mouseSensitivity

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
