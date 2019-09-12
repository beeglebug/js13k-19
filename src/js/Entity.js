class Entity {
  constructor (x, y, index, scale = 1) {
    this.x = x
    this.y = y
    this.velocity = { x: 0, y: 0 }
    this.direction = { x: 0, y: 0 }

    if (index !== null) {
      this.sprite = sprites[index]
      this.flashSprite = whiteSprites[index]
    }

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
  dropLoot () {}

  damage (value) {
    if (!this.health) return
    this.health -= value
    this.flash(50, () => {
      if (this.health <= 0) {
        this.kill()
        this.dropLoot()
      }
    })
  }

  kill () {
    this.alive = false
  }

  flash (time, callback) {
    const sprite = this.sprite
    this.sprite = this.flashSprite
    setTimeout(() => {
      this.sprite = sprite
      callback()
    }, time)
  }
}

class Mob extends Entity {
  constructor (x, y, index, scale = 1) {
    super(x, y, index, scale)
    this.health = 50
    this.static = false
    this.attackCooldown = 1000
  }

  update (delta) {
    handleCooldown(this, delta)
    handleAI(this, delta)
    collideWorld(this)
  }

  kill () {
    this.alive = false
    stats.mobsKilled++
    achievements.pacifist = false
  }

  collide (other, collision) {
    if (other instanceof Projectile) return
    handleDisplace(this, collision)
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
    this.hasKey = false
  }

  update (delta) {
    super.update(delta)
    handleCooldown(this, delta)
  }

  damage (value) {
    achievements.untouchable = false
    stats.damageTaken += value
    this.health -= value
    if (this.health <= 0) {
      player_dead()
    }
  }

  collide (other, collision) {
    if (other.collectible) return collide_player_collectible(other)
    return collide_player_entity(other, collision)
  }
}

class ManaPotion extends Entity {
  constructor (x, y) {
    super(x, y, 1, 0.5)
    this.radius = 0.1
    this.collectible = true
  }
  collect (entity) {
    if (entity.mana === entity.maxMana) return
    soundCollect(this)
    this.kill()
    entity.mana = Math.min(entity.mana + 50, entity.maxMana)
  }
}

class HealthPotion extends Entity {
  constructor (x, y) {
    super(x, y, 9, 0.5)
    this.radius = 0.1
    this.collectible = true
  }
  collect (entity) {
    if (entity.health === entity.maxHealth) return
    soundCollect(this)
    this.kill()
    entity.health = Math.min(entity.health + 30, entity.maxHealth)
  }
}

class Key extends Entity {
  constructor (x, y) {
    super(x, y, 11, 0.3)
    this.radius = 0.1
    this.collectible = true
  }
  collect () {
    soundCollect(this)
    this.kill()
    player.hasKey = true
    // hack to swap locked door tooltip
    flat(map.data).filter(Boolean).filter(tile => tile.locked).forEach(tile => tile.tooltip = 'E: Open')
  }
}

class Ladder extends Entity {
  constructor (x, y) {
    super(x, y, 7)
    this.tooltip = 'E: climb'
    this.onInteract = exit_level
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
    this.speed = 1
    this.radius = 0.3
    this.health = 120
    this.flashSprite = redSprites[0]
    this.attackDistance = 4
  }

  // always attacks player
  attack () {
    soundGhostAttack(this)
    const center = normalize(sub(player, this))
    const left = rotate(copy(center), -0.2)
    const right = rotate(copy(center), 0.2)
    spawnProjectile(this, left, GhostProjectile, 3, 500)
    spawnProjectile(this, center, GhostProjectile, 3, 500)
    spawnProjectile(this, right, GhostProjectile, 3, 500)
  }

  dropLoot () {
    dropItem(new Key(this.x, this.y))
  }
}

class Bat extends Mob {

  constructor (x, y) {
    super (x, y, 5, 0.5)
    this.speed = 2
    this.radius = 0.3
    this.health = 30
    this.z = 0
    this.attackDistance = 1.5
  }

  // always attacks player
  attack () {
    const direction = normalize(sub(player, this))
    soundBatAttack(this)
    spawnProjectile(this, direction, BatProjectile, 5, 1000)
  }

  dropLoot () {
    dropItem(biasedDrop(this))
  }
}

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
    return collide_projectile_entity(this, other, collision)
  }
}

class PlayerProjectile extends Projectile {
  constructor (x, y, speed, direction) {
    super(x, y, 2, speed, direction)
    this.strength = 10
  }
}

class MeleeProjectile extends Projectile {
  constructor (x, y, speed, direction) {
    super(x, y, null, speed, direction)
    this.strength = 10
    // TODO maybe better way to do this?
    setTimeout(() => this.kill(), 50)
  }
}

class BatProjectile extends Projectile {
  constructor (x, y, speed, direction) {
    super(x, y, 10, speed, direction)
    this.strength = 5
  }
}

class GhostProjectile extends Projectile {
  constructor (x, y, speed, direction) {
    super(x, y, 12, speed, direction)
    this.strength = 10
  }
}

class ProjectileImpact extends Entity {
  constructor (x, y) {
    super(x, y, 3, 0.4)
    this.z = 0
  }
}

class Grave extends Entity {
  constructor (x, y) {
    super(x, y, 4, 0.7)
    this.radius = 0
  }
}

class Urn extends Entity {
  constructor (x, y) {
    super(x, y, 13, 0.7)
    this.radius = 0.3
    this.health = 10
  }
  kill () {
    super.kill()
    stats.urnsSmashed++
  }
  dropLoot () {
    dropItem(biasedDrop(this))
  }
}

function handleCooldown (entity, delta) {
  if (entity.attackCooldown > 0) {
    entity.attackCooldown -= delta * 1000
    if (entity.attackCooldown < 0) entity.attackCooldown = 0
  }
}

function biasedDrop (entity) {
  // base 50 / 50 chance
  const pool = [null, null, null, null, ManaPotion, ManaPotion, HealthPotion]
  if (player.health <= 20) pool.push(HealthPotion)
  const dropType = sharedRng.randomItem(pool)
  return dropType ? new dropType(entity.x, entity.y) : null
}

function dropItem (drop) {
  if (!drop) return
  const targetZ = drop.z
  drop.z = 0.2
  TweenManager.create(drop, 'z', targetZ, 200)
  map.entities.push(drop)
}
