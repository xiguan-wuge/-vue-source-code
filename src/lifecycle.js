import Watcher from "./observer/watcher"
import {patch} from './vdom/patch'

export function mountComponent(vm, el) {
  // const updateComponent = () =>{
  //   console.log('刷新页面')
  //   // vm._update(vm._render())
  // }
  // new Watcher(vm, updateComponent, null, true)

  vm.$el = el
  vm._update(vm._render())
}

export function lifecycleMixin(Vue) {
  // 虚拟dom转化成真实dom的核心 =》 _update
  Vue.prototype._update = function(vnode) {
    const vm = this 
    patch(vm.$el, vnode)
  }
}