on('collide_player_entity', collision => {
  handleDisplace(player, collision)
})

on('collide_player_collectible', entity => {
  soundCollect()
  entity.kill()
  player.mana = Math.min(player.mana + 100, 100)
})


on('collide_projectile_entity', (projectile, entity, collision) => {

  handleImpact(projectile)

  if (entity.health) {
    // TODO damage from projectile
    entity.damage(10)
  }
})

on('collide_projectile_wall', handleImpact)

on('collide_entity_wall', (entity, wall, collision) => {
  handleDisplace(entity, collision)
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


// misc handlers to save dupe code

function handleDisplace (entity, collision) {
  entity.x += collision.normal.x * collision.depth
  entity.y += collision.normal.y * collision.depth
  entity.velocity.x = 0
  entity.velocity.y = 0
}

function handleImpact (projectile) {

  soundImpact()
  projectile.kill()

  const x = projectile.x - (player.direction.x * 0.1)
  const y = projectile.y - (player.direction.y * 0.1)

  const impact = new ProjectileImpact(x, y)
  map.entities.push(impact)

  setTimeout(() => {
    impact.kill()
  }, 100)
}
