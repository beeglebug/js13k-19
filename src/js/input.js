const KEY_W = 87
const KEY_A = 65
const KEY_S = 83
const KEY_D = 68

const downKeys = {}

function onKeydown (e) {
  downKeys[e.which] = true
}

function onKeyup (e) {
  downKeys[e.which] = false
}

function keyDown (key) {
  return !!downKeys[key]
}

function bindKeyboard (target) {
  target.addEventListener('keydown', onKeydown)
  target.addEventListener('keyup', onKeyup)
}
