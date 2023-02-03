import {pushTarget, popTarget} from './dep'
import {queueWatcher} from './scheduler'
// 全局变量ID，每次new Watcher 都会自增
let id = 0;

export default class Watcher {
  constructor(vm, exprOrFn, cb, options) {
    this.vm = vm
    this.exprOrFn = exprOrFn
    this.cb = cb
    this.options = options
    this.id = id++
    this.deps = [] // 存放dep容器
    this.depsId = new Set() // 去重dep

    this.user = options.user

    if(typeof exprOrFn === 'function') {
      this.getter = exprOrFn
    }

    // 实例化默认调用get方法
    this.get()
  }

  get() {
    pushTarget(this) // 调用前，将当前watcher实例推送到全局Dep.target
    this.getter() // 依赖收集
    popTarget() // 调用后, 将当前watcher实例从全局Dep.target 移除， 确保同一时间，只有一个watcher
  }
  // 把dep添加到deps中，同时保证同一个dep只能被保存到watcher中一次，同一个watcher只会保存在dep中一次
  addDep(dep) {
    const id = dep.id
    if(!this.depsId.has(id)) {
      this.depsId.add(id)
      this.deps.push(dep)
      // 调用dep的方法，将watcher实例添加到dep的subs容器中
      dep.addSub(this)
    }
  }
  // watcher更新
  update() {
    // this.get()

    // 每次watcher进行更新时，先缓存起来，之后一起更新
    // 异步队列机制
    queueWatcher(this)
  }
  run() {
    // 真正触发更新
    this.get()

    if(this.user) {

    } else {
      // 渲染watcher
      this.cb.call(this.vm)
    }
  }
}