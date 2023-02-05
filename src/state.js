import Watcher from './observer/watcher.js'
import {observe} from './observer/index.js'
import Dep from './observer/dep.js'

export function initState(vm) {
  // 获取传入的数据对象
  const opt = vm.$options

  // 注意函数执行的先后顺序： 
  // props => methods => data => computed => watch

  if(opt.props){
    // initProps(vm)
  }

  if(opt.methods){
    // initMethods(vm)
  }

  if(opt.data){
    initData(vm)
  }

  if(opt.computed){
    initComputed(vm)
  }

  if(opt.watch){
    initWatch(vm)
  }
}

// 初始化data数据
function initData(vm) {
  let data = vm.$options.data
  data = vm._data = typeof data === 'function' ? data.call(vm) : data

  // data内部数据代理到vm(Vue实例)， this.a => this.data.a
  for(let key in data){
    proxy(vm, '_data', key)
  }

  // 对数据进行观测，响应式核心逻辑
  observe(data)
}

// 数据代理
function proxy(object, sourceKey, key) {
  Object.defineProperty(object, key, {
    get() {
      return object[sourceKey][key]
    },
    set(newVal) {
      object[sourceKey][key] = newVal
    }
  })
}

// 初始化watch
function initWatch(vm) {
  const watch = vm.$options.watch
  for(const k in watch) {
    // 用户自定义watch的写法，可能是数组、对象、函数、字符串
    const handler = watch[k] 
    if(Array.isArray(handler)) {
      handler.forEach(handle => {
        createWatcher(vm, k, handle)
      })
    } else {
      createWatcher(vm, k, handler)
    }
  }
}

// 创建watcher的核心
function createWatcher(vm, exprOrFn, handler, options = {}) {
  if(typeof handler === 'object') {
    options = handler
    handler = handler.handler // 用户传入的函数
  } else if(typeof handler === 'string') {
    // 代表传入的是 用户定义好的methods方法
    handler = vm[handler]
  } else {
    console.log('createWatcher-else')
    // 普通函数，类似于依赖被收集到dep中，在数据更新时，触发函数执行，所以，没有额外处理
  }
  // 。。。
  // 调用vm.$watch 创建用户 watcher 
  return vm.$watch(exprOrFn, handler, options)
}

// computed 初始化
function initComputed(vm) {
  const computed = vm.$options.computed

  // 存放计算watcher,添加到vm中
  const watcher = (vm._computedWatchrs = {})

  for(let k in computed) {
    const userDef = computed[k]
    const getter = typeof userDef === 'function' ? userDef : userDef.get

    // 创建计算watcher lazy=true
    watcher[k] = new Watcher(vm, getter, ()=>{}, {lazy: true} )
    defineComputed(vm, k, userDef)
  }
}

// 重新定义计算属性，对get和set做劫持
function defineComputed(target, key, userDef) {
  if(typeof userDef === 'function') {
    // 手动赋值到get上
    sharedPropertyDefinition.get = createComputedGetter(key)
  } else {
    sharedPropertyDefinition.get = createComputedGetter(key)
    sharedPropertyDefinition.set = userDef.set
  }

  // 劫持
  Object.defineProperty(target, key, sharedPropertyDefinition)
}

// 定义普通对象，用来劫持计算属性
const sharedPropertyDefinition = {
  enumerable: true,
  configrable: true,
  get: () => {},
  set: () => {}
}

// 重写计算属性的get方法，判断是否需要进行重新计算
function createComputedGetter(key) {
  return function() {
    const watcher = this._computedWatchrs[key]
    if(watcher) {
      // 计算属性取值时，若是脏值，需要重新求值
      if(watcher.dirty) watcher.evaluate()

      if(Dep.target) {
        // 如果Dep还存在targe, 此时一般为渲染watcher，计算属性依赖的数据也要收集
        watcher.depend()
      }
    }
    return watcher.value
  }
}