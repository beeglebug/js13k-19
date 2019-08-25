let weapon = {
  x: 170,
  y: 70,
  originX: 170,
  originY: 70,
  offsetX: 0,
  offsetY: 0,
}

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
