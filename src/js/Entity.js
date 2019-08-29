class Entity {
  constructor (x, y, index, scale = 1) {
    this.x = x
    this.y = y
    this.index = index
    this.scale = scale
    this.z = scale === 1 ? 0 : zPos(scale)
  }

  project () {

    // translate entity player to relative to camera
    const x = this.x - player.x
    const y = this.y - player.y

    const invDet = 1 / (camera.x * player.direction.y - player.direction.x * camera.y)

    this.transformX = invDet * (player.direction.y * x - player.direction.x * y) * -1
    this.transformY = invDet * (-camera.y * x + camera.x * y)

    this.screenX = Math.round((width / 2) * (1 + this.transformX / this.transformY))

    // calculate size of entity on screen
    this.screenWidth = Math.abs(Math.round(height / this.transformY)) * this.scale
    this.screenHeight = Math.abs(Math.round(height / this.transformY)) * this.scale
  }

  update () {}

  kill () {
    map.entities = map.entities.filter(e => e !== this)
  }
}


class Mob extends Entity {
  constructor (x, y, index, scale = 1) {
    super(x, y, index, scale)
    this.velocity = { x: 0, y: 0 }
  }

  update (delta) {
    this.x += this.velocity.x * delta
    this.y += this.velocity.y * delta
    if (this.radius) {
      handleCollision(this)
    }
  }
}


class Player extends Mob {
  constructor () {
    super (0, 0, null)
    this.x = 1
    this.y = 1
    this.radius = 0.4
    this.velocity = {
      x: 0,
      y: 0,
    }
    this.speed = 4
    this.direction = {
      x: 0,
      y: 0,
    }
    this.mapX = 0
    this.mapY = 0
    this.health = 100
    this.mana = 100
  }
}


class ManaPotion extends Entity {
  constructor (x, y) {
    super(x, y, 1, 0.5)
    this.radius = 0.1
    this.collectible = true
  }
}


class Ladder extends Entity {
  constructor (x, y, seed) {
    super(x, y, 7)
    this.seed = seed
    this.tooltip = 'E: return to surface'
    this.onInteract = 'exit_tomb'
  }
}

class Ghost extends Mob {
  constructor (x, y) {
    super(x, y, 0, 0.8)
    this.radius = 0.3
    this.health = 50
  }
}

class Bat extends Mob {
  constructor (x, y) {
    super (x, y, 5)
    this.radius = 0.3
    this.health = 50
  }
}

// TODO enemy projectiles
class Bullet extends Mob {
  constructor (x, y, speed, direction) {
    super(x, y, 2, 0.3)
    this.z = 0
    this.source = player
    this.radius = 0.1
    this.speed = speed
    this.direction = direction
    this.velocity = {
      x: direction.x * speed,
      y: direction.y * speed,
    }
  }
}

class Grave extends Entity {
  constructor (x, y, seed) {
    super(x, y, 4, 0.8)
    this.radius = 0.1
    this.seed = seed
    this.onInteract = 'enter_tomb'
    this.tooltip = generateEpitaph(seed) + '\n\nE: Enter Tomb'
  }
}
