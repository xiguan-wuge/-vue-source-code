import {observe} from './observer/index.js'

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