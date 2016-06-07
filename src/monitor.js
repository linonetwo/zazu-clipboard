const electron = require('electron')
const readableFormat = require('./lib/readableFormat')
const CappedCollection = require('./lib/cappedCollection')

const clipCollection = new CappedCollection('clipCollection', 50)
const { clipboard } = electron
const INTERVAL = 150

/**
 * Checks to see if the current item in your clipboard should be added to the
 * capped collection or not. If so, adds it.
 */
tick = () => {
  const clip = getClip()
  clipCollection.last().then((lastClip) => {
    if (!lastClip || lastClip.type !== clip.type || lastClip.raw !== clip.raw) {
      return clipCollection.upsert(clip)
    }
  }).then(() => {
    setTimeout(tick, INTERVAL)
  }).catch((err) => {
    console.log(err, err.stack)
    setTimeout(tick, INTERVAL)
  })
}

getClip = () => {
  const clip = {}
  clip.type = clipboard.readImage().isEmpty() ? 'text' : 'image'

  if (clip.type === 'image') {
    const image = clipboard.readImage()
    const dimensions = image.getSize()
    const size = readableFormat(image.toDataURL().length * 0.75)
    clip.title = `Image: ${dimensions.width}x${dimensions.height} (${size.value}${size.unit})`
    clip.raw = image.toDataURL()
  } else {
    clip.raw = clipboard.readText()
  }
  return clip
}

electron.app.dock.hide()
tick()
