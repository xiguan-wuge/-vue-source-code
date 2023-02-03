
// patch 比较新旧vnde,
export function patch(oldVnode, vnode) {
  // 判断传入的oldVnode 是否是真实节点（初次渲染时，传入的是真实节点；后续因为生成了vnode,所有渲染更新都是vnode）
  const isRealElement = oldVnode.nodeType
  if(isRealElement) {
    // 初次渲染

    
    const oldElm = oldVnode

    
    const parentElm = oldVnode.parentNode

    // 将vnode转化成真实的DOM节点
    const el = createElm(vnode)

    // 问题：
    // （1）首次渲染后，oldVnode 中 parentNode和nextSibling 为null？？？ 待解决
    // （2） 参照现有Vue项目，实际内容应该是包含在div#app内，不是替换div#app
    oldVnode.innerHTML = ''
    oldVnode.appendChild(el)
    

    // 插入到老节点的前面，并删除老节点，以保证替换位置不变
    // parentElm.insertBefore(el, oldElm.nextSibling || document.querySelector('#app'))
    // parentElm.removeChild(oldVnode)

    
    // parentElm.appendChild(el)

    return el
  } else {
    // 渲染更新
    console.log('渲染更新')
  }
}

// 虚拟DOM转换成真实DOM，就是采用原生方法 生成DOM树
function createElm(vnode) {
  const {tag, data, key, children, text} = vnode

  // 判断节点类型（元素|文本）
  if(typeof tag === 'string') {
    // .el 指向真实dom
    vnode.el = document.createElement(tag)

    // 解析虚拟dom属性
    updateProperties(vnode)

    // 子节点 递归插入到父节点
    children.forEach(child => {
      return vnode.el.appendChild(createElm(child))
    })
  } else {
    // 文本节点（文本节点的tag = undefined）
    vnode.el = document.createTextNode(text)
  }

  return vnode.el
}

// 解析虚拟DOM上的data属性，映射到真实DOM上
function updateProperties(vnode) {
  const newProps = vnode.data || {}
  const el = vnode.el
  
  for(let key in newProps) {
    const prop = newProps[key]
    if(key === 'style') {
      for(let styleName in prop) {
        el.style[styleName] = prop[styleName]
      }
    } else if(key === 'class') {
      el.className = prop
    } else {
      // 添加属性
      el.setAttribute(key, prop)
    }
  }
}