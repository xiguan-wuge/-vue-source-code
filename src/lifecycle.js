import Watcher from "./observer/watcher"
import {patch} from './vdom/patch'

/**
 * 组件实例花在到真实的el节点上
 * @param {} vm 组件实例 
 * @param {*} el 真实dom节点
 */
export function mountComponent(vm, el) {
  // 真实的el赋值给$el
  vm.$el = el

  const updateComponent = () =>{
    console.log('刷新页面')
    vm._update(vm._render())
  }
  new Watcher(vm, updateComponent, null, true)
}

export function lifecycleMixin(Vue) {
  // 虚拟dom转化成真实dom的核心 =》 _update
  Vue.prototype._update = function(vnode) {
    const vm = this 
    // patch(vm.$el, vnode)
    const prevNode = vm._vnode // 保留上一次的vnode
    vm._vnode = vnode

    if(!prevNode) {
      // 初次渲染
      patch(vm.$el, vnode)
    } else {
      // 更新渲染
      // 上一次的vnode和这次的vnode 进行diff算法
      patch(prevNode, vnode)
    }
    
  }
}