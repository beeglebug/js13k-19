const KEY_E = 69
const KEY_W = 87
const KEY_A = 65
const KEY_S = 83
const KEY_D = 68
const KEY_M = 77
const MOUSE_LEFT = 1

const mousePosition = { x: 0, y: 0 }
const mouseMove = { x: 0, y: 0 }
const downButtons = {}
const downKeys = {}

let mouseTimeout

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


function handleInput (delta) {

  if (state !== STATE_PLAY) return

  const dirPerp = perp(player.direction)

  dirPerp.x *= -1
  dirPerp.y *= -1

  player.velocity.x = 0
  player.velocity.y = 0

  if (keyDown(KEY_W)) {
    player.velocity.x += player.direction.x
    player.velocity.y += player.direction.y
  }

  if (keyDown(KEY_S)) {
    player.velocity.x -= player.direction.x
    player.velocity.y -= player.direction.y
  }

  const mouseSensitivity = 0.5
  const rotation = mouseMove.x * delta * mouseSensitivity

  if (mouseMove.x !== 0) {
    rotate(player.direction, rotation)
  }

  // strafe to the left
  if (keyDown(KEY_A)) {
    player.velocity.x -= dirPerp.x
    player.velocity.y -= dirPerp.y
  }

  // strafe to the right
  if (keyDown(KEY_D)) {
    player.velocity.x += dirPerp.x
    player.velocity.y += dirPerp.y
  }

  normalize(player.velocity)
  multiply(player.velocity, player.speed)

  if (mouseDown(MOUSE_LEFT)) {
    shoot()
  }
}
