// 獲取原來數組原型鏈方法
const arrayProto = Array.prototype
// 繼承原來的方法
export const arrayMethods = Object.create(arrayProto)

// 劫持方法
const methodsToPatch = [
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse'
]
methodsToPatch.forEach(method => {

    arrayMethods[method] = function (...args) {
        // 劫持數組方法
        const result = arrayProto[method].call(this, ...args)
        // 添加的参数
        let inserted
        switch (method) {
            case 'push':inserted = args;
                break;
            case 'unshift':inserted = args;
                break;
            case 'splice':inserted = args.slice(2)
                break;
        }
        if(inserted) {
            this.__ob__.observeArray(inserted)
        }
        this.__ob__.dep.notify()
        return result
    }
})