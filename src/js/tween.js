let _tweens = []

const TweenManager = {

  update: delta => {
    _tweens.forEach(tween => {
      const { obj, prop, to, inc } = tween
      const value = obj[prop] + (inc * delta * 1000)
      if (value >= to) {
        obj[prop] = to
        tween.dead = true
        return
      }
      obj[prop] = value
    })
    _tweens = _tweens.filter(tween => !tween.dead)
  },

  create: (obj, prop, to, time) => {
    const from = obj[prop]
    const inc = (to - from) / time
    _tweens.push({ obj, prop, to, inc, started: +new Date })
  }
}
