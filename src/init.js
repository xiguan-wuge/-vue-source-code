import {initState} from './state'
import { callHook, mountComponent } from './lifecycle'
import {compilerToFunction} from './compiler/index'
import { mergeOptions } from './util/index'

export function initMixins(Vue){
  Vue.prototype._init = function(options) {
    const vm = this // this代表实例对象， 后续调用_init
    // vm.$options = options
    vm.$options = mergeOptions(vm.constructor.options, options)
    
    callHook(vm, 'beforeCreate') // 初始化钩子
    // 初始化数据状态
    initState(vm)
    callHook(vm, 'created')

    if(vm.$options.el) {
      // 模板渲染
      vm.$mount(vm.$options.el)
    }
    // // 模拟模板挂载
    // mountComponent(vm)
  }

  Vue.prototype.$mount = function(el) {
    const vm = this
    const options = vm.$options
    el = document.querySelector(el)

    if(!options.render) {
      let template = options.template

      if(!template && el) {
        // 若不存在render和template, 但存在el属性，直接将模板赋值到el所在的外层html结构（就是el本身，不是父元素）
        template = el.outerHTML
      }

      // 最终将template模板转换成render函数
      if(template) {
        const render = compilerToFunction(template)
        options.render = render
      }
    }

    // 将当前组件实例挂在到真实的el节点上
    return mountComponent(vm, el)
  }
}