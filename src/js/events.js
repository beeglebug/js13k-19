// TODO combine these two functions
on('collide_entity_entity', (entity, entity2, collision) => {

  if (entity.type === TYPE_PLAYER && entity2.collectible) {
    // TODO handle different types of collectible
    soundCollect()
    killEntity(entity2)
    player.mana = Math.min(player.mana + 100, 100)
    return
  }

  entity.x += collision.normal.x * collision.depth
  entity.y += collision.normal.y * collision.depth

  // TODO handle different projectiles
  if (entity.type === TYPE_PROJECTILE) {
    entity.velocity.x = 0
    entity.velocity.y = 0

    // stop further collision
    entity.radius = 0

    // change sprite
    entity.index += 1

    if (entity2.health) {
      entity2.health -= 10
      if (entity2.health <= 0) {
        killEntity(entity2)
        // TODO spawn loot
        map.entities.push({
          x: entity2.x,
          y: entity2.y,
          z: zPos(0.5),
          scale: 0.5,
          index: 1,
          radius: 0.1,
          collectible: true
        })
      } else {
        // flash effect
        entity2.opacity = 0.5
        setTimeout(() => {
          entity2.opacity = 1
        }, 100)
      }
    }

    soundImpact()
    setTimeout(() => killEntity(entity), 200)
  }
})

on('collide_entity_wall', (entity, wall, collision) => {

  // handle mtd
  entity.x += collision.normal.x * collision.depth
  entity.y += collision.normal.y * collision.depth

  // TODO handle different projectiles
  if (entity.type === TYPE_PROJECTILE) {
    entity.velocity.x = 0
    entity.velocity.y = 0

    // stop further collision
    entity.radius = 0

    // change sprite
    entity.index += 1

    soundImpact()
    setTimeout(() => killEntity(entity), 200)
  }
})

on('enter_tomb', gravestone => {
  console.log('making tomb with seed', gravestone.seed)
  const rng = new RNG(gravestone.seed)
  const tomb = generateDungeon(rng)
  loadMap(tomb, 6, 6, 1, 0)
})

on('exit_tomb', ladder => {
  const seed = ladder.seed
  const grave = overworld.entities.find(e => e.seed === seed)
  console.log('finding grave for seed', seed, grave)
  const x = grave.x + 0.5
  const y = grave.x + 0.5
  loadMap(overworld, x, y, 1, 1)
})
