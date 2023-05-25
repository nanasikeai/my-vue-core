import {observe} from "../observe/index";
import Watcher from "../observe/watcher";
import Dep from "../observe/dep";

const sharedPropertyDefinition = {
    enumerable: true,
    configurable: true,
    get: {},
    set: {}
}

function proxy(target, sourceKey, key) {
    sharedPropertyDefinition.get = function proxyGetter() {
        return this[sourceKey][key]
    }
    sharedPropertyDefinition.set = function proxyGetter(newValue) {
        this[sourceKey][key] = newValue
    }
    Object.defineProperty(target, key, sharedPropertyDefinition)
}

function initData(vm) {
    let data = vm.$options.data
    // data.call(vm) 改变this指向
    data = vm._data = typeof data === 'function' ? data.call(vm) : data
    // 将data挂载在vm上
    const keys = Object.keys(data)
    let i = keys.length
    while(i--) {
        proxy(vm, '_data', keys[i])
    }
    // 劫持data数据
    observe(data)
}

function createComputedGetter(key) {
    return function () {
        // 获取对应属性watcher
        const watcher = this._computedWatchers[key]
        if(watcher.dirty) {
            watcher.evaluate()
        }
        // 计算属性watcher出栈后，获取渲染watcher
        if(Dep.target) {
            watcher.depend()
        }
        return watcher.value
    };
}

// 可以通过实例拿到对应的属性
function defineComputed(target, key, setter) {
    Object.defineProperty(target, key, {
        get: createComputedGetter(key),
        set: setter
    })
}

function initComputed(vm) {
    let computed = vm.$options.computed
    let keys = Object.keys(computed)
    let watcher = vm._computedWatchers = {}
    for(let i = 0,l = keys.length; i < l; i ++) {
        let userDef = computed[keys[i]]
        const getter = typeof userDef === 'function' ? userDef : userDef.get
        const setter = userDef.set || (() => {})
        // 添加watcher
        watcher[keys[i]] = new Watcher(vm, getter, '',{lazy: true})
        defineComputed(vm, keys[i], setter)
    }
}

function createWatch(vm, key, handlerElement) {
    // 字符串 函数 （对象暂不考虑）
    if(typeof handlerElement === 'string') {
        handlerElement = vm[handlerElement]
    }
    return vm.$watch(key, handlerElement)
}

function initWatch(vm) {
    let watch = vm.$options.watch
    for(let key in watch) { // 字符串 数组 函数
        const handler = watch[key]
        if(Array.isArray(handler)) {
            for (let i = 0; i < handler.length; i ++) {
                createWatch(vm, key, handler[i])
            }
        } else {
            createWatch(vm, key, handler)
        }
    }
}

export function initState(vm) {
    const ops = vm.$options
    if(ops.data) {
        initData(vm)
    }
    if(ops.computed) {
        initComputed(vm)
    }
    if(ops.watch) {
        initWatch(vm)
    }
}
