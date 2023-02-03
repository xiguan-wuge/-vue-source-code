
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

    return el
  } else {
    // 渲染更新, 使用diff算法(同级比较)
    console.log('渲染更新')
    if(oldVnode.tag !== vnode.tag) {
      // 新旧标签不一致，新标签替换旧标签
      oldVnode.el.parentNode.replaceChild(createElm(vnode), oldVnode.el)
    }

    if(!oldVnode.tag){
      // 文本节点
      if(oldVnode.text !== vnode.text) {
        oldVnode.el.textContent = vnode.text
      }
    }

    // 非上述两种，即：标签一致且非文本节点
    // 节点复用，旧虚拟DOM对应的真实节点，赋值给新虚拟DOM的el属性
    const el = (vnode.el = oldVnode.el)

    // 更新属性
    updateProperties(vnode, oldVnode.data)

    const oldCh = oldVnode.children || [] // 旧子节点
    const newCh = vnode.children || [] // 新子节点

    if(oldCh.length > 0 && newCh.length > 0) {
      // 都存在子节点
      updateChildren(el, oldCh, newCh)
    } else if(oldCh.length) {
      // 存在旧子节点，但新子节点没有，需要删除就子节点
      el.innerHTML = ''
    } else if(newCh.length) {
      // 有新增节点
      for(let i = 0, len = newCh.length; i < len; i++) {
        const child = newCh[i]
        el.appendChild(createElm(child))
      }
    }
  }
}

// 虚拟DOM转换成真实DOM，就是采用原生方法 生成DOM树
function createElm(vnode) {
  const {tag, data, key, children, text} = vnode

  // 判断节点类型（元素|文本）
  if(typeof tag === 'string') {
    // .el 指向真实dom
    vnode.el = document.createElement(tag, data, key)

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
function updateProperties(vnode, oldProps = {}) {
  const newProps = vnode.data || {} // 新属性
  const el = vnode.el

  // 如果新的节点没有，就需要把老的节点属性移除
  for(const key in oldProps) {
    if(!newProps[key]) {
      el.removeAttribute(key)
    }
  }
  
  // 对style样式做特殊处理，如果新的没有，则将老的style值置空
  const newStyle = newProps.style || {}
  const oldStyle = oldProps || {}
  for(const key in oldStyle) {
    if(!newStyle[key]) {
      el.style[key] = ''
    }
  }

  // 遍历新属性，进行增加操作
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

/**
 * 判断两个虚拟节点是否相同
 * @param {*} oldVnode 
 * @param {*} newVnode 
 * @returns 
 */
function isSameVnode(oldVnode, newVnode) {
  return oldVnode.tag === newVnode.tag && oldVnode.key === newVnode.key
}

/**
 * 对比新旧子节点， 双指针， diff算法核心
 * @param {Array} parent 父节点
 * @param {Array} oldCh 旧子节点数组 
 * @param {*} newCh 新子节点数组
 */
function updateChildren(parent, oldCh, newCh) {
  let oldStartIndex = 0 // 旧子节点起始下标
  let oldStartVnode = oldCh[0] // 旧第一个节点
  let oldEndIndex = oldCh.length - 1 // 旧子节点结束下标
  let oldEndVnode = oldCh[oldEndIndex] // 旧子节点结束节点

  // 同上，新子节点
  let newStartIndex = 0
  let newStartVnode = newCh[0]
  let newEndIndex = newCh.length - 1
  let newEndVnode = newCh[newEndIndex]

  // 根据key值来创建旧子节点的index映射表
  // 如 {'a': 0, 'b': 1} 代表key值为a的节点 在第一个位置
  function makeIndexByKey(children) {
    const map = {}
    children.forEach((item, index) => {
      map[item.key] = index
    })
    return map
  }

  // 生成映射表
  const map = makeIndexByKey(oldCh)

  // 比较新旧子节点
  // 循环条件：当新旧子节点的双指标的起始位置不大于结束位置。
  while(oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    // 暴力对比过程中，把移动的vnode 设置为 undefined， 若不存在vnode,则直接跳过
    if(!oldStartVnode) {
      oldStartVnode = oldCh[++oldStartIndex]
    } else if(!oldEndVnode) {
      oldEndVnode = oldCh[--oldEndIndex]
    } else if(isSameVnode(oldStartVnode, newStartVnode)) {
      // 头头对比，依次向后追加
      patch(oldStartVnode, newStartVnode)
      oldStartVnode = oldCh[++oldStartIndex]
      newStartVnode = newCh[++newStartIndex]
    } else if(isSameVnode(oldEndVnode, newEndVnode)) {
      // 尾尾对比，依次向前追加
      patch(oldEndVnode, newEndVnode)
      oldEndVnode = oldCh[--oldEndIndex]
      newEndVnode = newCh[--newEndIndex]
    } else if(isSameVnode(oldStartVnode, newEndVnode)) {
      // 旧头和新尾对比，旧头移动到尾部
      patch(oldStartVnode, newEndVnode)
      parent.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling)
      oldStartVnode = oldCh[++oldStartIndex]
      newEndVnode = newCh[--newEndIndex]
    } else if(isSameVnode(oldEndVnode, newStartVnode)) {
      // 旧尾和新头对比，把旧尾移动到头部
      patch(oldEndVnode, newStartVnode)
      parent.insertBefore(oldEndVnode, oldStartVnode.el)
      oldEndVnode = oldCh[--oldEndIndex]
      newStartVnode = newCh[++newStartIndex]
    } else {
      // 以上四种不满足，就需要暴力对比
      // 根据旧字节点的key和index的映射表，从新的开始子节点进行查找，若找到，就进行移动操作；若找不到，则进行插入
      const moveIndex = map[newStartVnode.key]
      if(!moveIndex) {
        // 旧节点中找不到，直接插入
        parent.insertBefore(createElm(newStartVnode), oldStartVnode.el)
      } else {
        // 找到，移动位置
        const moveVnode = oldCh[moveIndex]
        oldCh[moveIndex] = undefined // 占位，避免数组塌陷（防止旧节点移动之后，破坏了初始的映射表位置）
        parent.insertBefore(moveVnode.el, oldStartVnode.el) // 把找到的节点移动到最前面 ? 为什么要插入到最前面
        patch(moveVnode, oldStartVnode)
      }
    }
  }

  // 若旧节点循环完毕后，新节点还有，证明：有新节点需要被添加到头部或者尾部
  if(newStartIndex <= newEndIndex) {
    for(let i = newStartIndex; i < newEndIndex; i++) {
      // 优化写法，insertBefore的第一个参数是null, 等同于appendChild
      const ele = newCh[newEndIndex + 1] === null
        ? null
        : newCh[newEndIndex + 1].el
      parent.insertBefore(createElm(newCh[i]), ele)
    } 
  }

  // 若新节点循环完毕，但旧节点还有，说明： 有旧节点需要被删除
  if(oldStartIndex <= oldEndIndex) {
    for(let i = oldStartIndex; i < oldEndIndex; i++) {
      const child = oldCh[i]
      if(child !== undefined) {
        parent.removeChild(child.el)
      }
    }
  }
}