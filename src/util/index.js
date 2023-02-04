import { ASSETS_TYPE } from "../global-api/index"

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

// 组件 指令 过滤器的合并策略
function mergeAssets(parentVal, childVal) {
  // 若有同名的全局组件和自定义局部组件，parentVal 代表全局组件，childVal代表局部组件
  // 首先会查找局部组件，找到就用局部组件；没有查找到，就从原型继承全局组件，res.__proto__ = parentVal

  // 代码的实现逻辑：先原型继承全局组件，如果有同名局部组件，则采用局部组件
  const res = Object.create(parentVal)
  if(childVal) {
    for(const key in childVal) {
      res[key] = childVal[key] // 后面注册的局部组件会覆盖同名组件
    }
  }
  return res
}

// 定义组件的合并策略
ASSETS_TYPE.forEach(type => {
  strats[type + 's'] = mergeAssets
})

/**
 * 判断是否是对象
 * @param {*} data 
 * @returns Boolean
 */
export function isObject(data) {
  if(typeof data !== 'object' || data === null) {
    return false
  } else {
    return true
  }
}

/**
 * 判断是否是常规html标签
 * @param {String} tagName 
 * return Boolean | Undefined
 */
export function isReservedTag(tagName) {
  // 定义常规标签
  const str = 
    "html,body,base,head,link,meta,style,title," +
    "address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section," +
    "div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul," +
    "a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby," +
    "s,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video," +
    "embed,object,param,source,canvas,script,noscript,del,ins," +
    "caption,col,colgroup,table,thead,tbody,td,th,tr," +
    "button,datalist,fieldset,form,input,label,legend,meter,optgroup,option," +
    "output,progress,select,textarea," +
    "details,dialog,menu,menuitem,summary," +
    "content,element,shadow,template,blockquote,iframe,tfoot";
  const obj = {}
  str.split(',').forEach(tag => {
    obj[tag] = true
  })
  return obj[tagName]
}

