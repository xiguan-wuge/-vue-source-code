import {initMixins} from './init.js'
import {lifecycleMixin} from './lifecycle'
import {renderMixin} from './render'

function Vue(options) {
  console.log('this is Vue Constructor')
  // _init Vue原型上的方法
  this._init(options)
}

// 便于代码分割，清晰逻辑
initMixins(Vue)
renderMixin(Vue)
lifecycleMixin(Vue)
export default Vue