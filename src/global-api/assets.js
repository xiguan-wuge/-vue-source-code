// const ASSETS_TYPE = ['component', 'directive', 'filter']
import { ASSETS_TYPE } from "./index"
/**
 * assets 注册方法
 * @param {*} Vue 
 */
export default function initAssetRegisters(Vue) {
  ASSETS_TYPE.forEach(type => {
    Vue[type] = function(name, definition) {
      if(type === 'component') {
        // this 指向 Vue
        // 全局组件注册
        // 子组件注册可能也有Extend方法， VueComponent.component方法
        definition = this.options._base.extend(definition)
      }
      this.options[type + 's'][name] = definition
    }
  })
}