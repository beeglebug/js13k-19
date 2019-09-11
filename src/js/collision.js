function collideWorld (entity) {

  const x = Math.floor(entity.x)
  const y = Math.floor(entity.y)

  // level bounds
  if (entity.x - entity.radius < 0) entity.x = entity.radius
  if (entity.x + entity.radius > map.width) entity.x = map.width - entity.radius

  if (entity.y - entity.radius < 0) entity.y = entity.radius
  if (entity.y + entity.radius > map.height) entity.y = map.height - entity.radius

  // map tiles
  const tiles = [{ x, y }, ...getNeighbours(map, x, y, true)]

  tiles.filter(Boolean).forEach(({ x, y }) => {
    const tile = getMap(map, x, y)
    if (isEmpty(tile)) return
    const collision = collideCircleRect(entity, getRect(tile))
    if (collision) {
      if (entity instanceof Projectile) return collide_projectile_wall(entity, tile, collision)
      collide_entity_wall(entity, tile, collision)
    }
  })
}

function getRect (tile) {
  let { x, y } = tile
  let width = 1
  let height = 1
  if (isVerticalDoor(tile)) {
    x += 0.35
    y += tile.offset
    width = 0.3
  }
  if (isHorizontalDoor(tile)) {
    x += tile.offset
    y += 0.35
    height = 0.3
  }
  return { x, y, width, height }
}

function collideEntities (entities) {

  // TODO split entities into projectiles / mobs / statics etc
  // filter out things which cannot have collision
  const entitiesToConsider = entities.filter(entity => {
    return !(entity instanceof ProjectileImpact)
  })

  entitiesToConsider.push(player)

  for (let i = 0; i < entitiesToConsider.length; i++) {
    for (let j = i + 1; j < entitiesToConsider.length; j++) {
      collideEntityPair(entitiesToConsider[i], entitiesToConsider[j])
      collideEntityPair(entitiesToConsider[j], entitiesToConsider[i])
    }
  }
}

function collideEntityPair (primary, secondary) {

  // "broadphase" checks
  if (primary.static) return
  if (!primary.collision || !secondary.collision) return
  if (primary instanceof Projectile && secondary instanceof Projectile) return // bullets cant hit each other
  if (primary instanceof Projectile && secondary.collectible) return // bullets cant hit collectibles
  if (primary.source === secondary) return // projectiles ignore origin

  const collision = collideCircleCircle(primary, secondary)

  collision && primary.collide(secondary, collision)
}



function closestPointRect (point, rect, output = { x: 0, y: 0 }) {

  if (point.x < rect.x) {
    output.x = rect.x
  } else if (point.x > rect.x + rect.width) {
    output.x = rect.x + rect.width
  } else {
    output.x = point.x
  }

  if (point.y < rect.y) {
    output.y = rect.y
  } else if (point.y > rect.y + rect.height) {
    output.y = rect.y + rect.height
  } else {
    output.y = point.y
  }

  return output
}

function closestPointCircle (point, circle, output = { x: 0, y: 0 }) {

  output.x = point.x
  output.y = point.y

  if (!pointInCircle(point, circle)) {

    output.x -= circle.x
    output.y -= circle.y

    setMagnitude(output, circle.radius)

    output.x += circle.x
    output.y += circle.y
  }

  return output
}

function collideCircleRect (circle, rect) {

  const point = closestPointRect(circle, rect)

  if (!pointInCircle(point, circle)) return false

  const distance = distanceTo(point, circle)
  const depth = circle.radius - distance

  const normal = normalize({
    x: circle.x - point.x,
    y: circle.y - point.y,
  })

  // TODO handle point inside, normal is whack
  if (normal.x === 0 && normal.y === 0) {
    // debugger
  }

  return {
    ...point,
    normal,
    depth
  }
}

function collideCircleCircle (circle1, circle2) {

  const dx = circle1.x - circle2.x
  const dy = circle1.y - circle2.y
  const dr = circle1.radius + circle2.radius

  // no need for sqrt
  const distance = (dx * dx) + (dy * dy)
  const r2 = (dr * dr)

  if (distance.toFixed(5) >= r2.toFixed(5)) return false

  const point = closestPointCircle(circle1, circle2)

  const normal = normalize({
    x: dx,
    y: dy,
  })

  const depth = circle1.radius - distanceTo(circle1, point)

  return {
    ...point,
    normal,
    depth
  }
}

function pointInCircle (point, circle) {

  const dx = Math.abs(circle.x - point.x)
  const dy = Math.abs(circle.y - point.y)

  return (dx * dx) + (dy * dy) < (circle.radius * circle.radius)
}

function rayLineSegmentIntersection(ray, start, end) {

  const v1 = sub(ray, start)
  const v2 = sub(end, start)
  const v3 = { x: -ray.direction.y, y: ray.direction.x }

  const d = dot(v2, v3)

  // check for parallel
  if (Math.abs(d) < 0.000001) return null

  const t1 = cross(v2, v1) / d
  const t2 = dot(v1, v3) / d

  if (t1 >= 0 && (t2 >= 0 && t2 <= 1)) return t1

  return null
}
