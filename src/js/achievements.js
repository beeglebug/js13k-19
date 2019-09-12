const resetAchievements = () => ({
  genocide: false,
  pacifist: true,
  pugilist: false,
  explorer: false,
  untouchable: true,
  almost: false
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
  genocide: 'killed everything',
  pacifist: 'killed nothing',
  pugilist: 'only used melee',
  explorer: 'found the secret room',
  untouchable: 'never got hit',
  almost: 'died with the key'
}

let achievements = resetAchievements()
let stats = resetStats()
