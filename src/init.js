import {initState} from './state'
import { mountComponent } from './lifecycle'

export function initMixins(Vue){
  Vue.prototype._init = function(options) {
    const vm = this // this代表实例对象， 后续调用_init
    vm.$options = options
    
    // 初始化数据状态
    initState(vm)

    // 模拟模板挂载
    mountComponent(vm)
  }
}