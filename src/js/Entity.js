class Entity {
  constructor (x, y, index, scale = 1) {
    this.x = x
    this.y = y

    this.sprite = sprites[index]
    this.flashSprite = whiteSprites[index]

    this.scale = scale
    this.z = zPos(scale)

    this.static = true
    this.collision = true

    this.alive = true
    this.radius = 0.3
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

  update (delta) {
    if (!this.velocity) return
    this.x += this.velocity.x * delta
    this.y += this.velocity.y * delta
    collideWorld(this)
  }

  collide () {}

  kill () {
    this.alive = false
  }

  flash (time) {
    const sprite = this.sprite
    this.sprite = this.flashSprite
    setTimeout(() => {
      this.sprite = sprite
    }, time)
  }
}

class Mob extends Entity {
  constructor (x, y, index, scale = 1) {
    super(x, y, index, scale)
    this.velocity = { x: 0, y: 0 }
    this.direction = { x: 0, y: 0 }
    this.health = 50
    this.static = false
    this.speed = 2
    this.attackCooldown = 1000
  }

  update (delta) {
    handleCooldown(this, delta)
    handleAI(this, delta)
    collideWorld(this)
  }

  collide (other, collision) {
    if (other instanceof Projectile) return
    handleDisplace(this, collision)
  }

  damage (value) {
    this.health -= value
    if (this.health <= 0) {
      this.kill()
      dropLoot(this)
    } else {
      this.flash(50)
    }
  }
}

class Player extends Entity {
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
    this.maxHealth = 100
    this.mana = 100
    this.maxMana = 100
    this.static = false
    this.attackCooldown = 200
  }

  update (delta) {
    super.update(delta)
    handleCooldown(this, delta)
  }

  damage (value) {
    this.health -= value
    if (this.health <= 0) {
      state = STATE_DEAD
    }
  }

  collide (other, collision) {
    if (other.collectible) return emit('collide_player_collectible', other)
    return emit('collide_player_entity', other, collision)
  }
}

class ManaPotion extends Entity {
  constructor (x, y) {
    super(x, y, 1, 0.5)
    this.radius = 0.1
    this.collectible = true
  }
  collect (entity) {
    entity.mana = Math.min(entity.mana + 20, entity.maxMana)
  }
}

class HealthPotion extends Entity {
  constructor (x, y) {
    super(x, y, 9, 0.5)
    this.radius = 0.1
    this.collectible = true
  }
  collect (entity) {
    entity.health = Math.min(entity.health + 20, entity.maxHealth)
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

class Cobweb extends Entity {
  constructor (x, y) {
    super(x, y, 8, 0.5)
    this.z = 0.25
    this.collision = false
  }
}

class Ghost extends Mob {
  constructor (x, y) {
    super(x, y, 0, 0.8)
    this.radius = 0.3
    this.health = 100
    this.flashSprite = redSprites[0]
  }
}

class Bat extends Mob {
  constructor (x, y) {
    super (x, y, 5, 0.5)
    this.radius = 0.3
    this.health = 50
    this.z = 0
  }
}

// TODO enemy projectiles
class Projectile extends Entity {
  constructor (x, y, index, speed, direction) {
    super(x, y, index, 0.3)
    this.z = 0
    this.radius = 0.1
    this.speed = speed
    this.direction = direction
    this.static = false
    this.velocity = {
      x: direction.x * speed,
      y: direction.y * speed,
    }
  }
  collide (other, collision) {
    return emit('collide_projectile_entity', this, other, collision)
  }
}

class PlayerProjectile extends Projectile {
  constructor (x, y, speed, direction) {
    super(x, y, 2, speed, direction)
  }
}

class EnemyProjectile extends Projectile {
  constructor (x, y, speed, direction) {
    super(x, y, 10, speed, direction)
  }
}

class ProjectileImpact extends Entity {
  constructor (x, y) {
    super(x, y, 3, 0.4)
    this.z = 0
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

function dropLoot (entity) {
  if (!sharedRng.randomChance(50)) return
  const dropType = sharedRng.randomItem([ManaPotion, HealthPotion])
  const drop = new dropType(entity.x, entity.y)
  const targetZ = drop.z
  drop.z = 0.2
  TweenManager.create(drop, 'z', targetZ, 200)
  map.entities.push(drop)
}

function handleCooldown (entity, delta) {
  if (entity.attackCooldown > 0) {
    entity.attackCooldown -= delta * 1000
    if (entity.attackCooldown < 0) entity.attackCooldown = 0
  }
}
