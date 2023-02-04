import { mergeOptions } from "../util/index";

/**
 * 核心思路：使用原型继承的方法，返回Vue的子类，并且利用mergeOptions把传入组件的options和父类的options进行合并
 * @param {*} Vue 
 */
export default function initExtend(Vue) {
  let cid = 0 // 组件的唯一标识

  // 创建子类继承父类Vue，便于属性扩展
  Vue.extend = function(extendOptions) {
    // 创建子类的构造函数，并且调用初始化方法
    const Sub = function VueComponent(options) {
      this._init(options) // 调用Vue的初始化方法，初始化组件实例
    }
    Sub.cid = cid++
    Sub.prototype = Object.create(this.prototype)
    Sub.prototype.constructor = Sub 
    // 合并自身和父类的options
    Sub.options = mergeOptions(this.options, extendOptions)
    return Sub
  }
}