let callback = []
let pending = false

function  flushCallbacks() {
  pending = false 
  for(let i = 0; i < callback.length; i++) {
    callback[i]()
  }
}

// 定义异步方法，采用优雅降级
let timerFn

if(typeof Promise !== 'undefined') {
  const p = Promise.resolve()
  timerFn = () => {
    p.then(flushCallbacks)
  }
} else if(typeof MutationObserver !== 'undefined') {
  // 不理解 MutationObserver 的使用原理
  let counter = 1
  const observer = new MutationObserver(flushCallbacks)
  const textNode = document.createTextNode(String(counter))
  observer.observe(textNode, {
    characterData: true
  })

  timerFn = () => {
    counter = (counter + 1) % 2
    textNode.data = String(counter)
  }
} else if(typeof setInmediate !== 'undefined') {
  timerFn = () => {
    setInmediate(flushCallbacks)
  }
} else {
  // 最后降级采用setTimeout
  timerFn = () => {
    setTimeout(flushCallbacks, 0)
  }
}

export function nextTick(cb) {
  // console.log('nextTick-cb', cb)
  callback.push(cb)
  // console.log('callback', callback)
  if(!pending) {
    // 若多次调用nextTick ,只会执行一次异步，待当前队列清空后，标志变回false
    pending = true
    timerFn()
  }
}