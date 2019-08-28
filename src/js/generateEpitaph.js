const titles = [
  'lord',
  'earl',
  'duke',
  'baron',
  'count',
  'marquis',
  'bishop',
  'archbishop'
]

const forenames = [
  'arthur',
  'richard',
  'edward',
  'james',
  'thomas',
  'william',
  'henry',
  'john',
  'albert',
  'alexander',
  'gregory'
]

const surnames = [
  'covington',
  'garret',
  'rothston',
  'beaufort',
  'woodville',
  'fairchild',
  'lawson',
  'bennet',
  'sheridan',
  'weston',
  'campbell',
  'stanton'
]

const placeDirections = [
  'north',
  'south',
  'east',
  'west'
]

const placeDescriptors = [
  'holy',
  'high',
  'upper',
  'lower'
]

const placePrefixes = [
  'ox',
  'guild',
  'birch',
  'oak',
  'thorn',
  'ash',
  'black',
  'red',
  'black',
  'mill',
]

const placeSuffixes = [
  'shire',
  'ton',
  'bury',
  'dale',
  'chester',
  'wich',
  'hampton',
  'haven',
  'mouth',
]

// will work for names too
const placeNameSuffixes = [
  'brook',
  'field',
  'worth',
  'ford',
  'leigh',
  'wood',
]

// first never makes sense
const cardinals = [
  'second',
  'third',
  'fourth',
  'fifth',
  'sixth',
  'seventh',
  'eighth',
  'ninth',
  'tenth'
]

function generateEpitaph (rng) {

  // generate a name

  const forename = rng.randomItem(forenames)
  let surname
  if (rng.randomChance(50)) {
    // simple surname
    surname = rng.randomItem(surnames)
  } else {
    // make another place for the surname
    surname = rng.randomItem(placePrefixes) + rng.randomItem(placeNameSuffixes)
  }

  const nameCardinal = rng.randomChance(20) ? ' the ' + rng.randomItem(cardinals) : ''

  // generate a title

  const title = rng.randomItem(titles)
  const titleCardinal = rng.randomChance(60) ? rng.randomItem(cardinals) + ' ' : ''

  // generate a place

  let placePrefix = ''
  let placeDescriptor = ''
  let placeSuffix = rng.randomItem([...placeSuffixes, ...placeNameSuffixes])

  if (rng.randomChance(70)) {
    // simple name (directions work as prefixes)
    placePrefix = rng.randomItem([...placeDirections, ...placePrefixes])
  } else {
    const pool = rng.randomChance(50) ? placeDescriptors : placeDirections
    placeDescriptor = rng.randomItem(pool) + ' '
    placePrefix = rng.randomItem(placePrefixes)
  }

  const age = rng.randomIntBetween(30, 50)
  const born = rng.randomIntBetween(1100, 1300)
  const died = born + age

  return `Here lies ${forename} ${surname}${nameCardinal}
${titleCardinal}${title} of ${placeDescriptor}${placePrefix}${placeSuffix}
${born} - ${died}`
}
