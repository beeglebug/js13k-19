const AI_IDLE = 1
const AI_SEEK = 2
const AI_PATHFIND = 3
const AI_MOVE = 4

function handleAI (entity) {

  switch (entity.state) {

    case AI_IDLE:
      const distanceFromPlayer = distanceTo(entity, player)
      if (distanceFromPlayer < 10) {
        entity.state = AI_SEEK
      }
      break

    case AI_SEEK:
      // TODO
      const hasLineOfSight = true
      if (hasLineOfSight) {
        entity.target = player
        entity.state = AI_MOVE
      } else {
        entity.state = AI_PATHFIND
      }
      break

    case AI_PATHFIND:
      const current = getMapWorld(influenceMap, entity)
      const near = getNeighbours(influenceMap, current.x, current.y).filter(Boolean)
      console.log(current, near)
      const target = near.sort(byWeight)[0]
      // TODO validate target?
      entity.target = target
      entity.state = AI_MOVE
      console.log(`pathfinding from ${vToStr(entity)} to ${vToStr(target)}`)
      break

    case AI_MOVE:
      const threshold = 0.01

      // check if at target
      const dx = Math.abs(entity.target.x - entity.x)
      const dy = Math.abs(entity.target.y - entity.y)

      if (dx < threshold && dy < threshold) {
        entity.x = entity.target.x
        entity.y = entity.target.y
        entity.velocity.x = 0
        entity.velocity.y = 0
        return entity.state = AI_PATHFIND
      }

      const delta = normalize(sub(entity.target, entity))
      entity.velocity = delta
  }
}
