// 创建存函数的缓存版本
export function cached(fn) {
  const cache = Object.create(fn)
  return (function cacheFn(str) {
    const hit = cache[str]
    return hit || (cache[str] = fn(str))
  })
}

// 小驼峰改为-
const hyphenateRE = /\B([A-Z])/g
export const hyphenate = cached(str => {
  return str.replace(hyphenateRE, '-$1').toLowerCase()
})

export function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key)
}