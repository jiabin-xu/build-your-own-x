

export function createStore(reducer, initState) {
  let state = initState || {}
  let listeners = {}, index = 0

  function getState() {
    return state
  }

  function dispatch(action) {
    state = reducer(state, action)
    Object.values(listeners).forEach(cb => cb(state))
  }

  function subscribe(cb) {
    const id = index
    listeners[id] = cb
    index++
    return function unSubscribe() {
      delete listeners[id]
    }
  }


  return {
    getState, dispatch, subscribe
  }
}


