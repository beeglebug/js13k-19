const AI_IDLE = 1
const AI_PATHFIND = 3
const AI_MOVE = 4
const AI_MELEE = 5
const AI_MOVE_TOWARDS = 6

function handleAI (entity) {

  switch (entity.state) {

    case AI_IDLE:
      const distanceFromPlayer = distanceTo(entity, player)
      if (distanceFromPlayer < 10) {
        // TODO
        const hasLineOfSight = true
        if (hasLineOfSight) {
          entity.target = player
          entity.state = AI_MOVE_TOWARDS
        } else {
          entity.state = AI_PATHFIND
        }
      }
      return

    case AI_PATHFIND:
      const current = getMapWorld(influenceMap, entity)
      const near = getNeighbours(influenceMap, current.x, current.y).filter(Boolean)
      console.log(current, near)
      const target = near.sort(byWeight)[0]
      // TODO validate target?
      entity.target = target
      entity.state = AI_MOVE
      console.log(`pathfinding from ${vToStr(entity)} to ${vToStr(target)}`)
      return

    case AI_MOVE_TOWARDS:
      const threshold = 0.01

      // check if at target
      const dx = Math.abs(entity.target.x - entity.x)
      const dy = Math.abs(entity.target.y - entity.y)

      if (dx < threshold && dy < threshold) {
        entity.x = entity.target.x
        entity.y = entity.target.y
        entity.velocity.x = 0
        entity.velocity.y = 0
        return entity.state = AI_IDLE
      }

      const delta = normalize(sub(entity.target, entity))
      entity.velocity = delta
      return

    case AI_MELEE:
      console.log('attack!')
      zero(entity.velocity)
      entity.state = 0
      return
  }
}
