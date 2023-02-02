// render 函数转换成虚拟DOM的核心方法 _render

import {createElement, createTextNode} from './vdom/index'

export function renderMixin(Vue) {
  Vue.prototype._render = function() {
    const vm = this
    const {render} = vm.$options
    // 生成 vnode
    const vnode = render.call(vm)
    return vnode
  }

  // render 函数中有 _c, _v, _s 方法需要定义
  Vue.prototype._c = function(...args) {
    // 创建虚拟DOM元素
    return createElement(...args)
  }

  Vue.prototype._v = function(...args) {
    // 创建虚拟文本
    return createTextNode(...args)
  }

  Vue.prototype._s = function (val) {
    // 若模板是对象，则转成字符串
    return val === null
      ? ''
      :typeof val === 'object'
      ? JSON.stringify(val)
      : val
  }
}