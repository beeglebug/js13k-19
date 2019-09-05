let onScreenWeapon = {
  x: 170,
  y: 70,
  originX: 170,
  originY: 70,
  offsetX: 0,
  offsetY: 0,
}

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

  onScreenWeapon.offsetX = lerp(0, onScreenWeapon.offsetX, 0.1)
  onScreenWeapon.offsetY = lerp(0, onScreenWeapon.offsetY, 0.1)

  onScreenWeapon.x = onScreenWeapon.originX + x + onScreenWeapon.offsetX
  onScreenWeapon.y = onScreenWeapon.originY + y + onScreenWeapon.offsetY
}

// player shooting
function shoot () {
  onScreenWeapon.offsetX = -50
  onScreenWeapon.offsetY = -50
  if (player.attackCooldown > 0) return
  if (player.mana < SHOOT_COST) return
  player.mana -= SHOOT_COST
  spawnProjectile(player, PlayerProjectile, 10, SHOOT_DELAY)
  soundShoot()
}

function spawnProjectile (entity, ProjectileClass, speed, delay) {
  const offset = 0.2
  const x = entity.x + entity.direction.x * offset
  const y = entity.y + entity.direction.y * offset
  const bullet = new ProjectileClass(x, y, speed, copy(entity.direction))
  bullet.source = entity
  map.entities.push(bullet)
  entity.attackCooldown += delay
}
