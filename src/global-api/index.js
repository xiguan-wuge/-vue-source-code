import initExtend from './initExtend'
import initAssetRegisters from './assets'
import initMixin from './mixin'

// 实例选项式api配置项
export const ASSETS_TYPE = ['component', 'directive', 'filter']

/**
 * 注册全局API
 * 如 Vue.mixin Vue.extend
 * @param {*} Vue 
 */
export function initGlobalAPi(Vue) {
  Vue.options = {} // 全局的组件 指令 过滤器
  initMixin(Vue)
  ASSETS_TYPE.forEach(type => {
    Vue.options[type + 's'] = {}
  })
  Vue.options._base = Vue // _base 指向 Vue

  initExtend(Vue) // extend方法
  initAssetRegisters(Vue) // assets 注册方法
}