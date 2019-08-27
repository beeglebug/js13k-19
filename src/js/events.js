// TODO combine these two functions
on('collide_entity_entity', (entity, entity2, collision) => {

  if (entity.type === TYPE_PLAYER && entity2.collectible) {

    // TODO handle different types of collectible
    soundCollect()
    kill(entity2)
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

    soundImpact()
    setTimeout(() => kill(entity), 200)
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
    setTimeout(() => kill(entity), 200)
  }
})
