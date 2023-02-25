import {arrayMethods} from './array'
import Dep from './dep'

// 在某些情况下，我们可能希望禁用组件内部的观察
// 更新计算。

export let shouldObserve = true
export function toggleObserving(value) {
  shouldObserve = value
}

class Observer {
  
  constructor(value) {
    this.value = value
    this.dep = new Dep()
    // 观测值
    if(Array.isArray(value)) {
      // 优化数组监测
      // 因为对数组下标拦截 太浪费性能，故增加对数组的判断
      Object.defineProperty(value, '__ob__', {
        value: this,
        enumerable: false, // 不可枚举
        writable: true,
        configurable: true
      })
      // 通过重写数据原型方法来对数组的其中方法进行拦截
      value.__proto__ = arrayMethods
      this.observeArray(value)
    } else {
      this.walk(value)
    }
  }
  // 执行观测逻辑入口函数
  walk(data) {
    // 对象上的所有属性 依次 进行观测
    const keys = Object.keys(data)
    for(let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const val = data[key]
      defineReactive(data, key, val)
    }
  }
  observeArray(arr) {
    for(let i = 0; i < arr.length; i++) {
      observe(arr[i])
    }
  }
}

// Object.defineProperty 进行数据劫持的核心逻辑
export function defineReactive(data, key, val) {
  const childObj = observe(val) // 递归 监测数据
  // 问题： 若data数据层级过深， 影响性能


  const dep = new Dep() // 每个属性 实例化一个dep

  Object.defineProperty(data, key, {
    get() {
      // 页面取值时，可以把watcher收集到dep里面 -- 依赖收集
      if(Dep.target) {
        // 收集数据
        dep.depend()
        // 若子元素仍然是个对象，进一步收集依赖
        if(childObj) {
          // 比如{a: [1, 2, 3]}, 

          // ? childObj.dep, dep什么时候绑定到childObj。 
          // 答：后面查看完整代码时，发现在初始化Observer实例时挂载dep
          childObj.dep.depend() 

          // 处理数组多层嵌套的情况
          if(Array.isArray(val)) {
            dependArray(val)
          }
        }
      }
      console.log(`获取值 ${key}:${val}`)
      return val
    },
    set(newVal) {
      if(newVal !== val) {
        console.log(`设置值 ${key}:${newVal}`)
        val = newVal

        // 通知渲染watcher更新 -- 派发更新
        dep.notify()
      }
    }
  })
}

export function observe(data) {
  // 若data是数据或者对象，进行属性劫持
  // 递归进行属性劫持
  if (typeof data !== "object" || data == null) {
    return;
  }
  return new Observer(data);
}
// 递归收集数组依赖
function dependArray(value) {
  for(let i = 0; i < value.length; i++) {
    const e = value[i]
    // __ob__ : observer 实例
    e && e.__ob__ && e.__ob__.dep.depend()
    // 是数组，进一步递归收集
    if(Array.isArray(e)) {
      dependArray(e)
    }
  }
}