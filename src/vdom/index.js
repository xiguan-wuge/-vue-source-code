import {isObject, isReservedTag} from '../util/index'

export default class Vnode {
  constructor(tag, data, key, children, text, componentOptions) {
    this.tag = tag
    this.data = data
    this.key = key
    this.children = children
    this.text = text
    this.componentOptions = componentOptions
  }
}

// 创建元素vnode, 等价于 render函数中的 h=> h(App)
export function createElement(vm, tag, data = {}, ...children) {
  const key = data.key // 目前代码中，添加key值作暂时没有场景验证，待办

  if(isReservedTag(tag)) {
    // 普通标签
    return new Vnode(tag, data, key, children)
  } else {
    // 组件
    const Ctor = vm.$options.components[tag] // 获取组件的构造函数
    return createComponent(vm, tag, data, key, children, Ctor)
  }
}

// 创建组件
function createComponent(vm, tag, data, key, children, Ctor) {
  if(isObject(Ctor)) {
    // 若没有改造成构造函数
    Ctor = vm.$options._base.extend(Ctor)
  }

  // 声明组件内部生命周期
  data.hook = {
    // 组件创建过程的自身初始化方法
    init(vnode) {
      const child = (vnode.componentInstance = new Ctor({_isComponent: true})) // 实例化组件
      // 因为没有传入el属性，需要手动挂载。
      // 初始化渲染中有描述，$mount =》 mountComponent()，可以生成真实的dom并挂载到自身的$el
      child.$mount()
    }
  }

  // 组件vnode(占位符) vnde ==> $vnode
  return new Vnode(
    `vue-component-${Ctor.cid}-${tag}`,
    data,
    key,
    undefined,
    undefined,
    {
      Ctor,
      children
    }
  )
}

// 创建文本vnode
export function createTextNode(text) {
  return new Vnode(undefined, undefined, undefined, undefined, text)
}