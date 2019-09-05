let weapon = {
  x: 170,
  y: 70,
  originX: 170,
  originY: 70,
  offsetX: 0,
  offsetY: 0,
}

// start it high so initial click doesn't fire
let shootCoolDown = 500
const SHOOT_DELAY = 200
const SHOOT_COST = 2

function handleWeaponSway (time) {

  // "breathing"
  let verticalSwayAmount = 1
  let horizontalSwayAmount = 0
  let swaySpeed = 2

  // "running"
  if (!isZero(player.velocity)) {
    verticalSwayAmount = 4
    horizontalSwayAmount = 4
    swaySpeed = 4
  }

  let y = verticalSwayAmount * Math.sin((swaySpeed * 2) * time)
  let x = horizontalSwayAmount * Math.sin(swaySpeed * time)

  weapon.offsetX = lerp(0, weapon.offsetX, 0.1)
  weapon.offsetY = lerp(0, weapon.offsetY, 0.1)

  weapon.x = weapon.originX + x + weapon.offsetX
  weapon.y = weapon.originY + y + weapon.offsetY
}

function shoot () {
  weapon.offsetX = -50
  weapon.offsetY = -50
  if (shootCoolDown !== 0) return
  if (player.mana < SHOOT_COST) return
  const offset = 0.25
  const x = player.x + player.direction.x * offset
  const y = player.y + player.direction.y * offset
  const direction = copy(player.direction)
  const speed = 10
  const bullet = new PlayerProjectile(x, y, speed, direction)
  map.entities.push(bullet)

  player.mana -= SHOOT_COST
  soundShoot()
  shootCoolDown += SHOOT_DELAY

}
