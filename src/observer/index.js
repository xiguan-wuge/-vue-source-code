import {arrayMethods} from './array'

class Observer {
  
  constructor(value) {
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
function defineReactive(data, key, val) {
  observe(val) // 递归 监测数据
  // 问题： 若data数据层级过深， 影响性能

  Object.defineProperty(data, key, {
    get() {
      console.log(`获取值 ${key}:${val}`)
      return val
    },
    set(newVal) {
      if(newVal !== val) {
        console.log(`设置值 ${key}:${newVal}`)
        val = newVal
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