import { isObject } from '../util/index';
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
    this.lazy = options.lazy // 标识计算属性watcher
    this.dirty = this.lazy // dirty可变，标识计算watcher是否需要重新计算，默认是TRUE

    if(typeof exprOrFn === 'function') {
      this.getter = exprOrFn
    } else {
      this.getter = function() {
        // 传入的watcher，可能是一个字符串，如：a.a.a.a
        const path = exprOrFn.split('.')
        let obj = vm
        for(let i = 0, len = path.length; i < len; i++) {
          obj = obj[path[i]] // vm.a.a.a
        }
        return obj
      }
    }

    // 实例化默认调用get方法
    // this.get()
    // 实例化就进行一次取值操作，进行依赖收集过程
    // this.value = this.get()
    // 非计算属性 实例化会默认调用get方法取值， 保留结果。计算属性实例化，不用去调用get方法
    this.value = this.lazy ? undefined : this.get()
  }

  get() {
    pushTarget(this) // 调用前，将当前watcher实例推送到全局Dep.target
    const res = this.getter.call(this.vm) // 依赖收集
    popTarget() // 调用后, 将当前watcher实例从全局Dep.target 移除， 确保同一时间，只有一个watcher
    return res
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
    if(this.lazy) {
      // 计算属性依赖值发生变化，dirty设置为TRUE，下次访问到了，再重新计算
      this.dirty = true
    } else {
      // 每次watcher进行更新时，先缓存起来，之后一起更新
      // 异步队列机制
      queueWatcher(this)
    }
  }
  run() {
    // 真正触发更新
    // this.get()
    const newVal = this.get() // 新值
    const oldVal = this.value // 旧值

    this.value = newVal // 现在的新值，将成为下一次变化的旧值
    if(this.user) {
      // 如果两次的值，不相同，或者值是引用类型，因为引用类型的新旧值是相等的，它们是指向同一引用地址
      if(newVal !== oldVal || isObject(newVal)) {
        this.cb.call(this.vm, newVal, oldVal)
      } else {
        console.log('没有执行')
      }
    } else {
      // 渲染watcher
      this.cb.call(this.vm)
    }
  }
  // 计算属性重新计算，完成后，dirty设置为FALSE
  evaluate() {
    this.value = this.get()
    this.dirty = false
  }
  depend() {
    // 计算属性的watcher 存储了依赖项的dep
    let  i = this.deps.length
    while(i--) {
      // 调用依赖项的dep去收集渲染watcher
      this.deps[i].depend()
    }
  }
}