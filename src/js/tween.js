let _tweens = []

const TweenManager = {

  update: delta => {
    _tweens.forEach(tween => {
      const { obj, prop, to, increment, callback } = tween
      const value = obj[prop] + (increment * delta * 1000)
      if (value >= to) {
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
