on('collide_player_entity', (entity, collision) => {
  if (entity.static) {
    handleDisplace(player, collision)
  }
})

on('collide_player_collectible', entity => {
  entity.collect(player)
})

on('player_dead', () => {
  setState(STATE_DEAD)
  setTimeout(() => {
    setState(STATE_TITLE)
  }, 2000)
})

on('collide_projectile_entity', (projectile, entity, collision) => {

  handleImpact(projectile)

  // TODO damage from projectile
  entity.damage(10)
})

on('collide_projectile_wall', (projectile, tile) => {
  handleImpact(projectile)
  if (tile.type === 'X') {
    tile.damage += 1
    if (tile.damage >= 3) {
      // open secret room!
      map.hasOpenedSecret = true
      tile.type = FLOOR_TILE
      renderMap(mapCtx)
    } else {
      tile.flashing = true
      setTimeout(() => {
        tile.flashing = false
      }, 50)
    }
  }
})

on('collide_entity_wall', (entity, wall, collision) => {
  handleDisplace(entity, collision)
})

on('exit_level', () => {
  level++
  if (level === 2) {
    // TODO you win text
    loadMap(overworld)
  } else {
    loadMap(generateDungeon(map.rng))
  }
})

on('open_door', door => {
  if (door.locked && !player.hasKey) {
    // TODO no no sound?
    return
  }
  soundDoor()
  TweenManager.create(door, 'offset', 1, 2000, () => {
    door.type = '.'
    // redraw mini map minus the door
    renderMap(mapCtx)
  })
})



// misc handlers to save dupe code

function handleDisplace (entity, collision) {
  entity.x += collision.normal.x * collision.depth
  entity.y += collision.normal.y * collision.depth
  entity.velocity.x = 0
  entity.velocity.y = 0
}

function handleImpact (projectile) {

  projectile.kill()

  const x = projectile.x - (player.direction.x * 0.1)
  const y = projectile.y - (player.direction.y * 0.1)

  const impact = new ProjectileImpact(x, y)

  soundImpact(impact)

  map.entities.push(impact)

  setTimeout(() => {
    impact.kill()
  }, 100)
}
