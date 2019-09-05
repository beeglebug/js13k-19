
function handleAI (entity, delta) {

  const nearPlayer = distanceTo(entity, player) < 10

  if (!nearPlayer) return idle(entity)

  if (entity.target) {

    entity.direction = normalize(sub(entity.target, entity))

    const canSeeTarget = hasLineOfSight(entity, entity.target)

    if (canSeeTarget) {

      moveTowards(entity, entity.target, delta)

      if (canAttack(entity)) {
        // attack(entity)
      }

      if (atTarget(entity)) {
        entity.x = entity.target.x
        entity.y = entity.target.y
        entity.target = null
      }

    } else {
      entity.target = pathfind(entity)
    }

    return
  }

  const canSeePlayer = hasLineOfSight(entity, player)

  if (canSeePlayer) {
    // stay a bit away from player
    const distance = 1
    const offset = multiply(normalize(sub(player, entity)), distance)
    entity.target = sub(player, offset)
  } else {
    entity.target = pathfind(entity)
  }
}

function canAttack (entity) {
  return entity.attackCooldown === 0
}

// always attacks player
function attack (entity) {
  spawnProjectile(entity, EnemyProjectile, 1000)
}

function idle (entity) {
  zero(entity.velocity)
}

function pathfind (entity) {
  const current = getMapWorld(influenceMap, entity)
  const near = getNeighbours(influenceMap, current.x, current.y).filter(Boolean)
  const lowest = near.sort(byWeight)[0]
  const others = near.filter(cell => cell.weight === lowest.weight)
  let cell
  if (others.length === 0) {
    cell = others[0]
  } else {
    cell = others.sort(byDistanceToPlayer)[0]
  }
  // center of target
  return {
    x: cell.x + 0.5,
    y: cell.y + 0.5
  }
}

function atTarget (entity) {

  const threshold = 0.01

  const dx = Math.abs(entity.target.x - entity.x)
  const dy = Math.abs(entity.target.y - entity.y)

  return (dx < threshold && dy < threshold)
}

function moveTowards (entity, target, delta) {
  const diff = normalize(sub(target, entity))
  const velocity = multiply(diff, entity.speed)
  entity.x += velocity.x * delta
  entity.y += velocity.y * delta
}

// Bresenham's
function hasLineOfSight (from, to) {

  let x0 = Math.floor(from.x)
  let y0 = Math.floor(from.y)
  let x1 = Math.floor(to.x)
  let y1 = Math.floor(to.y)

  let dx = Math.abs(x1 - x0)
  let dy = Math.abs(y1 - y0)

  let stepX = (x0 < x1) ? 1 : -1
  let stepY = (y0 < y1) ? 1 : -1

  let err = dx - dy
  let e2
  let cells = []

  while (true) {

    const tile = getMap(map, x0, y0)
    cells.push(tile)

    if ((x0 === x1) && (y0 === y1)) break

    e2 = 2 * err

    if (e2 > -dy) {
      err -= dy
      x0 += stepX
    }

    if (e2 < dx) {
      err += dx
      y0 += stepY
    }
  }

  return cells.every(isEmpty)
}
