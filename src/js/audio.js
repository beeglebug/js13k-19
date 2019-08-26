let audioContext

const oscTypes = ["square", "sawtooth", "triangle", "sine"]

// start frequency HZ, frequency change, delay between changes, number of changes, volume, type
function playSound (frequency, increment, delay, times, volume, type = 0) {

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
  playSound(520, -70, 25, 20, 0.2)
}

function soundImpact () {
  playSound(220, -10, 10, 35, 0.3)
  playSound(225, -5, 10, 40, 0.3, 1)
}

function soundpew () {
  playSound(920, -80, 20, 15, 0.5)
}

function soundzap () {
  playSound(500, -200, 40, 10, 0.25, 1)
}

function soundbounce () {
  playSound(260, -60, 15, 15, 0.5, 2)
}

function soundstuck () {
  playSound(100, -10, 15, 15, 1, 2)
}

function soundexplosion () {
  playSound(100, -10, 10, 25, 0.5)
  playSound(125, -5, 20, 45, 0.1, 1)
  playSound(40, 2, 20, 20, 1, 2)
  playSound(200, -4, 10, 100, 0.25, 2)
}

function soundblow () {
  playSound(120, -6, 20, 15, 0.1, 1)
  playSound(40, -2, 20, 25, 1, 2)
  playSound(60, 10, 15, 15, 0.1, 1)
  playSound(160, -5, 20, 30, 0.1, 3)
}

function soundshot () {
  playSound(160, 10, 15, 10, 0.1)
  playSound(250, -20, 30, 10, 0.1, 1)
  playSound(1500, -150, 30, 10, 0.1, 1)
}

function soundjump () {
  playSound(150, 30, 15, 20, 0.5)
}
