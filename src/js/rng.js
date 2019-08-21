// https://stackoverflow.com/questions/424292/seedable-javascript-random-number-generator/424445#424445

class RNG {

  constructor (seed) {
    this.m = 0x80000000
    this.a = 1103515245
    this.c = 12345
    this.state = seed
  }

  nextInt () {
    return this.state = (this.a * this.state + this.c) % this.m
  }

  // returns in range [0,1]
  nextFloat () {
    return this.nextInt() / (this.m - 1)
  }

  // returns in range [start, end): including start, excluding end
  nextRange (start, end) {
    const size = end - start
    const randomUnder1 = this.nextInt() / this.m
    return start + Math.floor(randomUnder1 * size)
  }
}
