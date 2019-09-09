// calculate ray player and direction
function rayFromPlayer (x) {

  // -1 is left edge, 1 is right edge
  let nx = (2 * x) / width - 1

  return {
    x: player.x,
    y: player.y,
    direction: {
      x: player.direction.x + camera.x * -nx,
      y: player.direction.y + camera.y * -nx
    }
  }
}

function raycast (ray) {

  let rayLength
  let side
  let collision = false

  // which map cell are we in
  let mapX = Math.floor(ray.x)
  let mapY = Math.floor(ray.y)

  let deltaX = Math.abs(1 / ray.direction.x)
  let deltaY = Math.abs(1 / ray.direction.y)

  // calculate increments for DDA
  let stepX
  let stepY

  let distanceX
  let distanceY

  // id of the tile we last touched
  let tile

  if (ray.direction.x < 0) {
    stepX = -1
    distanceX = (ray.x - mapX) * deltaX
  } else {
    stepX = 1
    distanceX = (mapX + 1 - ray.x) * deltaX
  }

  if (ray.direction.y < 0) {
    stepY = -1
    distanceY = (ray.y - mapY) * deltaY
  } else {
    stepY = 1
    distanceY = (mapY + 1 - ray.y) * deltaY
  }

  // DDA
  while (true) {
    if (distanceX < distanceY) {
      distanceX += deltaX
      mapX += stepX
      side = 0
    } else {
      distanceY += deltaY
      mapY += stepY
      side = 1
    }

    // handle out of bounds to avoid infinite loop
    if (mapX < 0 || mapX >= map.width || mapY < 0 || mapY >= map.height) break

    // Check if ray has hit a wall
    tile = getMap(map, mapX, mapY)

    // thin walls
    if (isHorizontalDoor(tile)) {
      // half way down the block
      const start = {
        x: mapX + tile.offset,
        y: mapY + 0.5
      }
      const end = {
        x: mapX + 1,
        y: mapY + 0.5
      }
      const intersects = rayLineSegmentIntersection(ray, start, end)
      if (!intersects) continue
      // the ray length is where we intersected
      rayLength = intersects
      side = 1
      collision = true
      break
    } else if (isVerticalDoor(tile)) {
      // half way down the block
      const start = {
        x: mapX + 0.5,
        y: mapY
      }
      const end = {
        x: mapX + 0.5,
        y: mapY + 1 - tile.offset
      }
      const intersects = rayLineSegmentIntersection(ray, start, end)
      if (!intersects) continue
      // the ray length is where we intersected
      rayLength = intersects
      side = 0
      collision = true
      break
    } else if (!isEmpty(tile)) {
      collision = true
      break
    }
  }

  if (!collision) return []

  if (rayLength === undefined) {
    // Calculate distance projected on camera direction (Euclidean distance will give fisheye effect!)
    if (side === 0) {
      rayLength = (mapX - ray.x + (1 - stepX) / 2) / ray.direction.x
    } else {
      rayLength = (mapY - ray.y + (1 - stepY) / 2) / ray.direction.y
    }
  }

  // where exactly the wall was hit
  let wallX
  if (side === 0) {
    wallX = ray.y + rayLength * ray.direction.y
  } else {
    wallX = ray.x + rayLength * ray.direction.x
  }

  let euclideanRayLength
  let normalisedRayDirection = normalize(copy(ray.direction))

  if (side === 0) {
    euclideanRayLength = (rayLength * ray.direction.x) / normalisedRayDirection.x
  } else {
    euclideanRayLength = (rayLength * ray.direction.y) / normalisedRayDirection.y
  }

  // we only need to know the 0-1 range
  wallX -= Math.floor(wallX)

  // flip texture on opposite walls
  if (side === 0 && ray.direction.x < 0) wallX = 1 - wallX
  if (side === 1 && ray.direction.y > 0) wallX = 1 - wallX

  return [tile, rayLength, euclideanRayLength, side, wallX]
}
