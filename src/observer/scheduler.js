import {nextTick} from '../util/next-tick'
let queue = []
let has = {}

// 刷新队列
function flushSchedulerQueue() {
  // console.log('flushSchedulerQueue-queue', queue);
  for(let i = 0; i < queue.length; i++) {
    // console.log('queue[i]', queue[i]);
    // 执行watcher更新
    queue[i].run()
  }

  // 执行完后，清空队列
  queue = []
  has = {}
}

// 实现异步队列机制
export function queueWatcher(watcher) {
  const id = watcher.id

  // watcher 去重
  if(has[id] === undefined) {
    queue.push(watcher)
    has[id] = true

    // 异步调用

    // 问题：打包后，下行代码变为：nextTick(); 不执行队列函数
    // 解决方式：通过一步步添加console日志，
    // 确定是由于 flushCallbacks函数（next-tick.js）中callback[i] 没有执行，所以相关代码被tree-shaking掉了，添加执行即解决
    // console.log('queue', queue)
    nextTick(flushSchedulerQueue)
  }
}