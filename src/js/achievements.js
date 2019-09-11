const resetAchievements = () => ({
  murderer: false,
  pacifist: true,
  pugilist: true,
  explorer: false,
  untouchable: true,
})

const resetStats = () => ({
  mobsKilled: 0,
  urnsSmashed: 0,
  shotsFired: 0,
  damageTaken: 0,
  timeTaken: 0,
})

const achievementDescriptions = {
  murderer: 'killed everything',
  pacifist: 'killed nothing',
  pugilist: 'only used melee',
  explorer: 'found the secret room',
  untouchable: 'never got hit',
}

let achievements = resetAchievements()
let stats = resetStats()
