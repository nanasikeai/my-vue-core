import watcher from "./watcher";

let id = 0
class Dep {
    constructor() {
        this.id = id++
        this.subs = [] // watcher数组
    }
    depend() {
        // this.subs.push(Dep.target)
        // 页面使用相同的数据时，由于每次get()都会添加watcher，所以需要去重：先让watcher记住dep，同时去重，再在watcher中调用addSub
        // watcher记录dep，Dep.target此时是watcher，this是dep
        Dep.target.addDep(this)
    }
    addSub(watcher) {
        this.subs.push(watcher)
    }
    notify() {
        // this.subs.forEach(watcher => watcher.getter())
        this.subs.forEach(watcher => watcher.update())
    }
}
Dep.target = null
let stack = []
// 添加watcher到dep的全局target变量
export function pushTarget(watcher) {
    stack.push(watcher)
    Dep.target = watcher
}
// 清空
export function popTarget() {
    stack.pop()
    Dep.target = stack[stack.length -1]
}
export default Dep