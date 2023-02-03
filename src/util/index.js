// 定义生命周期
export const LIFECYCLE_HOOKS = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeDestroy',
  'destroyed'
]

// 合并策略
const strats = {}

// 生命周期合并策略
function mergeHook(parentVal, childVal) {
  // 如果有儿子
  if(childVal) {
    if(parentVal) {
      // 合并成数组
      return parentVal.concat(childVal)
    } else {
      return [childVal]
    }
  } else {
    return parentVal
  }
}

// 为生命周期添加合并策略
LIFECYCLE_HOOKS.forEach(hook => {
  strats[hook] = mergeHook
})

// mixin 核心方法

export function mergeOptions(parent, child) {
  const options = {}
  // 遍历父亲
  for(const key in parent) {
    mergeFiled(key)
  }

    // 父亲有，儿子没有
    for(const key in child) {
      if(!parent.hasOwnProperty(key)) {
        mergeFiled(key)
      }
    }


  // 真正合并字段的方法
  function mergeFiled(key) {
    if(strats[key]) {
      options[key] = strats[key](parent[key], child[key])
    } else {
      // 默认的合并策略
      options[key] = child[key] || parent[key]
    }
  }
  
  return options
}