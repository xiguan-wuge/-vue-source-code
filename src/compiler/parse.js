
// 匹配正则（源码）
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; //匹配标签名 形如 abc-123
const qnameCapture = `((?:${ncname}\\:)?${ncname})`; //匹配特殊标签 形如 abc:234 前面的abc:可有可无
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 匹配标签开始 形如 <abc-123 捕获里面的标签名
const startTagClose = /^\s*(\/?)>/; // 匹配标签结束  >
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾 如 </abc-123> 捕获里面的标签名
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性  形如 id="app"


let root, currentParent // 根节点， 当前父节点

const stack = [] // 栈，表示开始标签和结束标签

const ELEMENT_TYPE = 1
const TEXT_TYPE = 3

// 生成ast
function createASTElement(tagName, attrs) {
  return {
    tag: tagName,
    type: ELEMENT_TYPE,
    children: [],
    attrs,
    parent: null
  }
}

// 对开始标签进行处理
function handleStartTag({tagName, attrs}) {
  const element = createASTElement(tagName, attrs)
  if(!root) {
    root = element
  }
  currentParent = element
  stack.push(element)
}

// 对结束标签进行处理
function handleEndTag(tagName) {
  // <div><span>hello</span></div>
  const element = stack.pop()
  // 当前父元素就是栈顶的上一个元素
  currentParent = stack[stack.length - 1]
  // 建立parent和child的关系
  if(currentParent) {
    element.parent = currentParent
    currentParent.children.push(element)
  }
}

// 对文本进行处理
function handleChars(text) {
  text = text.replace(/\s/g, '')
  console.log('currentParent', currentParent);
  if(text) {
    currentParent.children.push({
      type: TEXT_TYPE,
      text
    })
  }
}

// 解析标签，生成ast 核心
export function parse(html) {
  while(html) {
    // 查找<
    const textEnd = html.indexOf('<')
    // <在第一个，即标签 不论开始或者结束标签
    if(textEnd === 0) {
      // 若是开始标签
      const startTagMatch = parseStartTag()
      if(startTagMatch) {
        // 把解析好的标签名和属性解析生成ast
        handleStartTag(startTagMatch)
        continue;
      }

      // 若是结束标签（匹配到</）
      const endTagMatch = html.match(endTag)
      if(endTagMatch) {
        advance(endTagMatch[0].length)
        handleEndTag(endTagMatch)
        continue;
      }
    }

    let text;
    // 形如:hello<div></div>
    if(textEnd >=0) {
      // 获取文本
      text = html.substring(0, textEnd)
    }
    if(text) {
      advance(text.length)
      handleChars(text)
    }
  }

  function parseStartTag() {
    const start = html.match(startTagOpen)
    if(start) {
      const match = {
        tagName: start[1],
        attrs: []
      }

      // 匹配到了开始标签，就截取掉
      advance(start[0].length)

      // 开始匹配属性
      let end, attr
      while(
        !(end = html.match(startTagClose)) &&
        (attr = html.match(attribute))
      ) {
        advance(attr[0].length)

        attr = {
          name: attr[1],
          value: attr[3] || attr[4] || attr[5] // 正则捕获支持（双|单|无）引号的属性值
        }
        match.attrs.push(attr)
      }
      if(end) {
        // 代表一个标签匹配到了结束>， 代表开始标签解析完毕
        advance(1)
        return match
      }
    }
  }

  // 截取html字符串，每次匹配到了，就往前继续匹配
  function advance(len) {
    html = html.substring(len)
  }

  // 返回生成的ast
  return root
}