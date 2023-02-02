const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g // 匹配花括号 {{}}， 捕获花括号里的内容

function gen(node) {
  // 判断节点类型 主要包含处理文本的核心
  // 源码中包含了复杂的处理，如v-once v-for v-if 自定义指令 slot 等；此处暂时考虑普通文本和表达式变量的处理

  if(node.type === 1) {
    // 递归构建
    return generate(node)
  } else {
    const text = node.text
    // 若不存在花括号变量表达式
    if(!defaultTagRE.test(text)) {
      return `_v(${JSON.stringify(text)})`
    }

    // 正则是全局模式， 每次需要重置正则的lastIndex属性，以免引发匹配问题
    let lastIndex = (defaultTagRE.lastIndex = 0)
    let tokens = []
    let match, index

    while((match = defaultTagRE.exec(text))) {
      // index =》 匹配到花括号的位置
      index = match.index
      if(index > lastIndex) {
        tokens.push(JSON.stringify(text.slice(lastIndex, index)))
      }
      // 放入捕获到的变量内容
      tokens.push(`_s(${match[1].trim()})`)
      // 当前轮匹配结束指针后移，即下一轮的起始位置 
      lastIndex = index + match[0].length
    }

    // 若匹配完了花括号，text中海油剩余的普通文本，则继续push
    if(lastIndex < text.length) {
      tokens.push(JSON.stringify(text.slice(lastIndex)))
    }

    // _v: 创建文本
    return `_v(${tokens.join('+')})`
  }
}

// 处理attrs属性
function genProps(attrs) {
  let str = ''
  for(let i = 0; i < attrs.length; i++) {
    let attr = attrs[i]
    // 处理style
    if(attr.name === 'style') {
      const obj = {}
      attr.value.split(';').forEach(item => {
        const [key, value] = item.split(':')
        obj[key] = value
      })
      attr.value = obj
    }
    str += `${attr.name}:${JSON.stringify(attr.value)},`
  }
  return `{${str.slice(0, -1)}}`
}

// 生成子节点，调用gen函数递归创建
function getChildren(el) {
  const children = el.children
  if(children) {
    // let arr = children.map(c => {
    //   console.log('c', c);
    //   const node = gen(c)
    //   console.log('node', node);
    //   return node
    // })
    // console.log('arr', arr);
    // return `${arr.join(',')}`
    return `${children.map(c => gen(c)).join(',')}`
  }
}


export function generate(el) {
  const children = getChildren(el)
  const code = `_c('${el.tag}',${
    el.attrs.length ? `${genProps(el.attrs)}` : 'undefined'
  }${children ? `,${children}` : ''})`
  
  return code
}