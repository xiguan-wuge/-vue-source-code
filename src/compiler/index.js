import {parse} from './parse'
import {generate} from './generate'


export function compilerToFunction(template) {
  // 需要把HTML字符串转换成render函数
  // 1. 把html代码转成ast语法树，（ast 用来描述代码本身行程数结构，不仅可以描述HTML，也能描述CSS 和JS）
  const ast = parse(template)

  // 2. 优化静态节点
  // 不影响核心功能，暂不实现

  // 3. 通过ast,重新生成代码
  // 类似于 _c('div', {id: 'app'}, _c('div', undefined, _v('hello'+_s(name))))...
  // _c 表示创建元素，_v表示 创建文本， _s 表示JSON.stringify --把对象解析成文本
  const code = generate(ast)
  console.log('code', code)
  // with语法，改变作用域为this, 之后调用render函数可以使用call改变this，方便code里面的变量取值
  const renderFn = new Function(`with(this){return ${code}}`)

  return renderFn
}