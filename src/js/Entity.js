// TODO entity class
class Entity {
  constructor (x, y) {
    this.x = x
    this.y = y
    // { x: 1.5, y: 1.5, z: zPos(0.5), scale: 0.5, index: 1, collectible: true, radius: 0.2 },
  }
}


function projectEntity (entity) {

  // translate entity player to relative to camera
  const x = entity.x - player.x
  const y = entity.y - player.y

  const invDet = 1 / (camera.x * player.direction.y - player.direction.x * camera.y)

  entity.transformX = invDet * (player.direction.y * x - player.direction.x * y) * -1
  entity.transformY = invDet * (-camera.y * x + camera.x * y)

  entity.screenX = Math.round((width / 2) * (1 + entity.transformX / entity.transformY))

  // calculate size of entity on screen
  entity.screenWidth = Math.abs(Math.round(height / entity.transformY)) * entity.scale
  entity.screenHeight = Math.abs(Math.round(height / entity.transformY)) * entity.scale
}

function killEntity (entity) {
  map.entities = map.entities.filter(e => e !== entity)
}

function updateEntity (entity, delta) {
  if (!entity.velocity) return
  entity.x += entity.velocity.x * delta
  entity.y += entity.velocity.y * delta
  if (entity.radius) {
    handleCollision(entity)
  }
}
