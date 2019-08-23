const _events = {}

function emit (event, ...args) {
  const callbacks = _events[event] || []
  callbacks.forEach(cb => cb(...args))
}

function on (event, cb) {
  (_events[event] = _events[event] || []).push(cb)
  return () => {
    _events[event] = _events[event].filter(i => i !== cb)
  }
}
