import Watcher from "./observer/watcher"
import {patch} from './vdom/patch'

/**
 * 组件实例花在到真实的el节点上
 * @param {} vm 组件实例 
 * @param {*} el 真实dom节点
 */

 export let isUpdatingChildComponent = false

export function mountComponent(vm, el) {
  // 真实的el赋值给$el
  vm.$el = el

  const updateComponent = () =>{
    console.log('刷新页面')
    vm._update(vm._render())
  }
  callHook(vm, 'beforeMount')
  new Watcher(
    vm, 
    updateComponent, 
    () => {
      callHook(vm, 'beforeUpdate')
    }, 
    true)
  callHook(vm, 'mounted')
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


export function callHook(vm, hook) {
  // 依次执行生命周期对应的方法
  const handlers = vm.$options[hook]
  if(handlers) {
    for(let i = 0, len = handlers.length; i < len; i++) {
      // 声明周期里的 this 指向当前实例
      handlers[i].call(vm) 
    }
  }
}