import {arrayMethods} from "./array";
import Dep from "./dep"

function dependArray(value) {
    for(let i = 0,l = value.length; i < l; i++) {
        let current = value[i]
        current.__ob__ && current.__ob__.dep.depend()
        if(Array.isArray(current)) {
            dependArray(current)
        }
    }
}

function defineReactive(data, key) {
    let value = data[key]
    // 深度代理，檢測每一個屬性
    let childOb = observe(value)
    // 给每个属性添加dep
    let dep = new Dep()
    // 實現劫持
    Object.defineProperty(data, key, {
        get() {
            if(Dep.target) {
                // dep记住当前的watcher
                dep.depend()
                if(childOb) {
                    childOb.dep.depend() // 让数组和对象本身也记住当前的watcher
                    if(Array.isArray(value)) {
                        dependArray(value)
                    }
                }
            }
            return value
        },
        set(newValue) {
            if(data[key] === newValue) return
            value = newValue
            dep.notify()
        }
    })
}

class Observer {
    constructor(data) {
        // 给每个对象或者数组添加watcher（用于数组监听数组方法和对象新增的属性）
        this.dep = new Dep()
        Object.defineProperty(data, '__ob__', {
            value: this,
            enumerable: false,
            writable: true,
            configurable: true,
        })
        if(Array.isArray(data)) {
            // 數組類型：方法劫持
            data.__proto__ = arrayMethods
            // 可能是数组对象/多维数组：循环数组判断
            this.observeArray(data)
        } else {
            // 對象類型：循環對象，給每一個屬性添加劫持
            let keys = Object.keys(data)
            for(let i = 0; i < keys.length; i ++) {
                let key = keys[i]
                defineReactive(data, key)
            }
        }
    }
    observeArray(data) {
        for(let i = 0, l = data.length; i < l; i ++) {
            observe(data[i])
        }
    }
}

export function observe(data) {
    // 只有數組或者對象才進行觀測
    if(Array.isArray(data) || (Object.prototype.toString.call(data) === '[object Object]')) {
        return new Observer(data)
    }
}