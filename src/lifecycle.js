import Watcher from "./observer/watcher"

export function mountComponent(vm, el) {
  const updateComponent = () =>{
    console.log('刷新页面')
    // vm._update(vm._render())
  }
  new Watcher(vm, updateComponent, null, true)
}