// TODO combine these two functions
on('collide_entity_entity', (entity, entity2, collision) => {

  if (entity === player && entity2.collectible) {
    // TODO handle different types of collectible
    soundCollect()
    entity2.kill()
    player.mana = Math.min(player.mana + 100, 100)
    return
  }

  entity.x += collision.normal.x * collision.depth
  entity.y += collision.normal.y * collision.depth

  // TODO handle different projectiles
  if (entity instanceof Bullet) {
    entity.velocity.x = 0
    entity.velocity.y = 0

    // stop further collision
    entity.radius = 0

    // change sprite
    entity.index += 1

    if (entity2.health) {
      entity2.health -= 10
      if (entity2.health <= 0) {
        entity2.kill()
        // TODO spawn random drop
        // TODO spawn in mid air and gravity down
        const drop = new ManaPotion(entity2.x, entity2.y)
        map.entities.push(drop)
      } else {
        entity2.flash(50)
      }
    }

    soundImpact()
    setTimeout(() => entity.kill(), 200)
  }
})

on('collide_entity_wall', (entity, wall, collision) => {

  // handle mtd
  entity.x += collision.normal.x * collision.depth
  entity.y += collision.normal.y * collision.depth

  // TODO handle different projectiles
  if (entity instanceof Bullet) {
    entity.velocity.x = 0
    entity.velocity.y = 0

    // stop further collision
    entity.radius = 0

    // change sprite
    entity.index += 1

    soundImpact()
    setTimeout(() => entity.kill(), 200)
  }
})

on('enter_tomb', gravestone => {
  const rng = new RNG(gravestone.seed)
  const tomb = generateDungeon(rng)
  loadMap(tomb, 6, 6, 1, 0)
})

on('exit_tomb', ladder => {
  const seed = ladder.seed
  const grave = overworld.entities.find(e => e.seed === seed)
  const x = grave.x + 0.5
  const y = grave.x + 0.5
  loadMap(overworld, x, y, 1, 1)
})
