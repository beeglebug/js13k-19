let _tweens = []

const TweenManager = {

  update: delta => {
    _tweens.forEach(tween => {
      const { obj, prop, to, increment, callback } = tween
      const step = (increment * delta * 1000)
      const value = obj[prop] + step
      const dist = Math.abs(value - to)
      if (dist < Math.abs(step)) {
        obj[prop] = to
        tween.dead = true
        return callback && callback()
      }
      obj[prop] = value
    })
    _tweens = _tweens.filter(tween => !tween.dead)
  },

  create: (obj, prop, to, time, callback) => {
    const from = obj[prop]
    const increment = (to - from) / time
    _tweens.push({
      obj,
      prop,
      to,
      increment,
      callback
    })
  }
}
