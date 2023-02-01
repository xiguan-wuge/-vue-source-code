
// dep  和 watcher 是多对多的关系

let id = 0; // dep 实例的唯一标识

export default class Dep {
  constructor() {
    this.id = id++
    this.subs = [] // 存放watcher的容器
  }

  depend() {
    if(Dep.target) {
      Dep.target.addDep(this) // 调用watcher方法，将自身dep实例存放到watcher中
    }
  }

  notify() {
    // 依次执行watcher更新函数
    this.subs.forEach( watcher => watcher.update())
  }

  addSub(watcher) {
    this.subs.push(watcher)
  }
}

// Dep.target 全局Watcher的指向，默认为null
Dep.target = null

const targetStack = [] // 用栈来保存watcher

export function pushTarget(watcher) {
  targetStack.push(watcher)
  Dep.target = watcher
}

export function popTarget() {
  targetStack.pop() // 当前watcher出栈
  Dep.target = targetStack[targetStack.length - 1] // 拿到上一个watcher
}