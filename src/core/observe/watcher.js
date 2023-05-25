import {popTarget, pushTarget} from "./dep";

let id = 0

// 组成watcher队列
let queue = []
// 一个组件更新多次，去重
let has = {}
let pending = false

function flushSchedulerQueue() {
    let flushQueue = queue.slice(0)
    queue = []
    has = {}
    pending = false
    flushQueue.forEach(q => q.run())
}

let callBacks = []
let waiting = false

function flushCallback() {
    let cbs = callBacks.slice(0)
    waiting = false
    callBacks = []
    cbs.forEach(cb => cb())
}

let timerFunc
if(Promise) {
    timerFunc = () => {
        Promise.resolve().then(flushCallback)
    }
} else if(MutationObserver) {
    let observer = new MutationObserver(flushCallback)
    let textNode = document.createTextNode('1')
    observer.observe(textNode,{
        characterData: true
    })
    timerFunc = () => {
        textNode = '2'
    }
} else if(setImmediate) {
    timerFunc = () => {
        setImmediate(flushCallback)
    }
} else {
    timerFunc = () => {
        setTimeout(flushCallback,0)
    }
}

// vue2源码没有直接使用setTimeout， 使用的优雅降级方式
export function nextTick(cb) {
    callBacks.push(cb)
    if(!waiting) {
        timerFunc()
        waiting = true
    }
}

function queueWatcher(watcher) {
    let id = watcher.id
    if(!has[id]) {
        queue.push(watcher)
        has[id] = true
        // 不管我们的update执行多少次，只执行一次刷新
        if(!pending) {
            nextTick(flushSchedulerQueue)
            pending = true
        }
    }
}

class Watcher {
    constructor(vm, exprOrFn, cb, options) {
        this.id = id++
        this.vm = vm
        this.cb = cb
        this.deps = [] // 存放dep
        this.depsId = new Set() // 存放dep的Id
        this.lazy = options.lazy
        this.dirty = this.lazy // 缓存
        this.user = options.user
        // 判断
        if(typeof exprOrFn === 'function') {
            this.getter = exprOrFn // 更新视图
        } else {
            this.getter = function () {
                return vm[exprOrFn]
            }
        }
        if(!this.lazy){
            this.value = this.get()
        }
    }
    // 添加记录dep,一个属性可能对应多个watcher（一个实例/组件），也需要去重
    addDep(dep) {
        let depId = dep.id
        if(!this.depsId.has(depId)) {
            this.deps.push(dep)
            this.depsId.add(depId)
            // 让dep记录watcher
            dep.addSub(this)
        }
    }
    evaluate() {
        // 获取用户函数返回值
        this.value = this.get()
        this.dirty = false
    }
    // 初次渲染
    get() {
        pushTarget(this)
        let value = this.getter.call(this.vm)
        popTarget()
        return value
    }
    depend() {
        let i = this.deps.length
        while (i--) {
            this.deps[i].depend()
        }
    }
    update() {
        if(this.lazy) {
            this.dirty = true
        } else {
            queueWatcher(this)
        }
        // this.getter()
    }
    run() {
        let newValue = this.get()
        let oldValue = this.value
        if(this.user) {
            this.cb.call(this.vm, newValue, oldValue)
        }
    }
}

export default Watcher