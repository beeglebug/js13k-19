// https://github.com/foumart/JS.13kGames/blob/master/lib/SoundFX.js

let audioContext

const oscTypes = ["square", "sawtooth", "triangle", "sine"]

// start frequency HZ, frequency change, delay between changes, number of changes, volume, type
function playSound (frequency, increment, delay, times, volume, type = 0) {

  if (!audioContext) return

  const oscillator = audioContext.createOscillator()
  oscillator.frequency.value = frequency
  oscillator.type = oscTypes[type]

  // modulation for sound volume control
  const modulationGain = audioContext.createGain()
  modulationGain.gain.value = 0;

  oscillator.connect(modulationGain);
  modulationGain.connect(audioContext.destination)
  oscillator.start();

  let i = 0
  const interval = setInterval(playTune, delay)

  function playTune () {
    oscillator.frequency.value = frequency + increment * i
    modulationGain.gain.value = (1 - (i / times)) * volume
    i++
    if (i > times) {
      clearInterval(interval)
      setTimeout(stopTune, delay + times) // prevents the click when stopping the oscillator
    }
  }

  function stopTune () {
    oscillator.stop()
  }
}

function soundShoot () {
  playSound(620, -80, 20, 15, 0.2)
  playSound(520, -70, 15, 10, 0.1)
}

function soundImpact () {
  playSound(220, -10, 10, 35, 0.3)
  playSound(225, -5, 10, 40, 0.3, 1)
}
