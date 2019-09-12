const collide_player_entity = (entity, collision) => {
  if (entity.static) {
    handleDisplace(player, collision)
  }
}

const collide_player_collectible = entity => {
  entity.collect(player)
}

const player_dead = () => {
  calculateAchievements()
  setState(STATE_DEAD)
  pauseMouse()
}

const collide_projectile_entity = (projectile, entity) => {
  handleImpact(projectile)
  entity.damage(projectile.strength)
}

const collide_projectile_wall = (projectile, tile) => {
  handleImpact(projectile)
  if (tile.type === 'X') {
    tile.damage += 1
    if (tile.damage >= 3) {
      // open secret room!
      map.hasOpenedSecret = true
      achievements.explorer = true
      tile.type = FLOOR_TILE
      renderMap(mapCtx)
    } else {
      tile.flashing = true
      setTimeout(() => {
        tile.flashing = false
      }, 50)
    }
  }
}

const collide_entity_wall = (entity, wall, collision) => {
  handleDisplace(entity, collision)
}

const calculateAchievements  = () => {
  const seconds = ((+new Date - startTime) / 1000).toFixed(0)
  stats.timeTaken = seconds + ' sec'
  achievements.killer = map.entities.every(e => !(e instanceof Bat || e instanceof Ghost))
}

const exit_level = () => {
  calculateAchievements()
  loadMap(generateOverworld())
  pauseMouse()
  setState(STATE_WIN)
}

const open_door = door => {
  if (door.locked && !player.hasKey) {
    // TODO no no sound?
    return
  }
  soundDoor()
  TweenManager.create(door, 'offset', 1, 2000, () => {
    player.hasKey = false
    door.type = '.'
    // redraw mini map minus the door
    renderMap(mapCtx)
  })
}

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
  if (projectile instanceof MeleeProjectile) return
  soundImpact(impact)
  map.entities.push(impact)
  setTimeout(() => {
    impact.kill()
  }, 100)
}

function pauseMouse () {
  mouseEnabled = false
  setTimeout(() => {
    mouseEnabled = true
  }, 1000)
}
