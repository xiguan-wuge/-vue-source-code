import { observe, toggleObserving, shouldObserve } from "../observer"
import { hasOwn } from "../shared/utils"

export function validateProp(key, propsOptions, propsData, vm) {
  // 获取到props的声明，如:{type: Boolean, default: false}
  const prop = propsOptions[key]
  const absent = Object.prototype.hasOwnProperty.call(propsData, key)
  let value = propsData[key]

  // 布尔值场景
  const booleanIndex = getTypeIndex(Boolean, props.type)
  if(booleanIndex > -1) {
    if(absent && !Object.prototype.hasOwnProperty.call(prop, 'default')) {
      value = false
    } else if(value === '' || value === hyphenate(key)) {
      // 若布尔值具有更高的优先级，则仅将空字符串 或者同名布尔值 转换为布尔值
      // 如：{type: [Boolean|String], default: false}
      const stringIndex = getTypeIndex(String, prop.key)
      if(stringIndex < 0 || booleanIndex < stringIndex) {
        value = true
      }
    }
  }

  // 检查默认值
  if(value === undefined) {
    value = getPropDefaultValue(vm, prop, key)
    // 由于默认值是新拷贝，确保观测它
    const prevShouldObserve =  shouldObserve
    toggleObserving(true)
    observe(value)
    toggleObserving(prevShouldObserve)
  }
  return value
}

function getTypeIndex(type, expectedTypes) {
  if(!Array.isArray(expectedTypes)) {
    return isSameType(expectedTypes, type) ? 0 : -1
  }

  for(let i = 0, len = expectedTypes.length; i < len; i++) {
    if(isSameType(expectedTypes[i], type)) {
      return i
    }
  }
  return -1
}

function isSameType(a, b) {
  return getType(a) === getType(b)
}
// 通过函数名检查内置类型？
function getType(fn) {
  const match = fn && fn.toString().match(functionTypeCheckRE)
  return match ? match[1] : ''
}

const functionTypeCheckRE = /^\s*function (\w*)/

// 获取props的默认值
function getPropDefaultValue(vm, prop, key) {
  if(hasOwn(prop, 'default')) {
    return undefined
  }
  const def = prop.default

  // 原始道具值也未从先前渲染中定义，
  //返回上一个默认值以避免不必要的观察程序触发  
  if(vm && vm.$options.propsData && 
    vm.$options.propsData[key] === undefined &&
    vm._props[key] !== undefined
  ) {
    return vm._props[key]
  }

  return typeof def === 'function' && getType(props.type) !== 'function'
    ? def.call(vm)
    : def
}