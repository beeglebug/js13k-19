// https://stackoverflow.com/questions/424292/seedable-javascript-random-number-generator/424445#424445

class RNG {

  constructor (seed) {
    this.setSeed(seed)
  }

  setSeed (seed) {
    this.seed = seed
    this.m = 0x80000000
    this.a = 1103515245
    this.c = 12345
    this.state = seed ? seed : Math.floor(Math.random() * (this.m - 1))
  }

  randomInt () {
    return this.state = (this.a * this.state + this.c) % this.m
  }

  // returns in range [0,1]
  random () {
    return this.randomInt() / (this.m - 1)
  }

  // returns in range [start, end): including start, excluding end
  randomIntBetween (start, end) {
    const size = end - start
    const randomUnder1 = this.randomInt() / this.m
    return start + Math.floor(randomUnder1 * size)
  }

  randomItem (array) {
    return array[this.randomIntBetween(0, array.length)]
  }

  randomChance (percent) {
    return this.random() < percent / 100
  }

  // Fisher–Yates Shuffle
  // https://bost.ocks.org/mike/shuffle/
  shuffle (array) {
    let len = array.length
    while (len) {
      let i = Math.floor(this.random() * len--)
      let swap = array[len]
      array[len] = array[i]
      array[i] = swap
    }

    return array
  }
}
