const resetAchievements = () => ({
  almost: false,
  explorer: false,
  pacifist: true,
  pugilist: false,
  rampage: false,
  unscathed: true,
})

const resetStats = () => ({
  mobsKilled: 0,
  urnsSmashed: 0,
  shotsFired: 0,
  punchesThrown: 0,
  damageTaken: 0,
  timeTaken: 0,
})

const achievementDescriptions = {
  rampage: 'killed everything',
  pacifist: 'killed nothing',
  pugilist: 'only used melee',
  explorer: 'found the secret room',
  unscathed: 'took no damage',
  almost: 'died with the key'
}

let achievements = resetAchievements()
let stats = resetStats()
