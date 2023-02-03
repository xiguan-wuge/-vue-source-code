let initKey = 0
export default class Vnode {
  constructor(tag, data, key, children, text) {
    this.tag = tag
    this.data = data
    this.key = key
    this.children = children
    this.text = text
  }
}

// 创建元素vnode, 等价于 render函数中的 h=> h(App)
export function createElement(tag, data = {}, ...children) {
  const key = data.key || `${tag}__${initKey++}` // 目前代码中，添加key值作暂时没有场景验证，待办
  return new Vnode(tag, data, key, children)
}

// 创建文本vnode
export function createTextNode(text) {
  return new Vnode(undefined, undefined, undefined, undefined, text)
}