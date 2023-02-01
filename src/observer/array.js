// 劫持数组数据更新：
// 核心：重写数组的其中方法， 在不改变原数组函数执行结果的前提下，获取7中可能改变数组的函数，递归监听其新增的数据
// 思想：切片编程 （在保留原功能的前提下，新增功能）

const arrayProto = Array.prototype // 先保留数组原型

export const arrayMethods = Object.create(arrayProto)

const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'reverse',
  'sort'
]

methodsToPatch.forEach(method => {
  arrayMethods[method] = function(...args) {
    const result = arrayProto[method].apply(this, args)
    
    const ob = this.__ob__ // 获取当前数组item的实例，便于后续调用监听数组的方法

    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break;
      case 'splice':
        inserted = args.slice(2)
        break
      default:
        break
    }

    if(inserted) ob.observeArray(inserted) // 进一步监听新增数据
    // 数组派发更新
    ob.dep.notify()

    return result
  }
})