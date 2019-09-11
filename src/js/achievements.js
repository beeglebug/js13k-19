const resetAchievements = () => ({
  pugilist: true,
  untouchable: true,
  discovery: false
})

const resetStats = () => ({
  mobsKilled: 0,
  urnsSmashed: 0,
  shotsFired: 0,
  damageTaken: 0,
  timeTaken: 0,
})

const achievementDescriptions = {
  pugilist: 'only use melee',
  untouchable: 'never get hit',
  discovery: 'found the secret room'
}

let achievements = resetAchievements()
let stats = resetStats()
