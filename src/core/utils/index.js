export const HOOKS = [
    "beforeCreate",
    "created",
    "beforeMount",
    "mounted",
    "beforeUpdate",
    "updated",
    "beforeDestroy",
    "destroyed",
]
let starts = {}
// starts.data = function (parentVal, childVal){
//     return childVal
// }
// starts.computed = function (){}
// starts.watch = function (){}
// starts.methods = function (){}

function mergeHooks(parentVal, childVal) {
    if(childVal) {
        if(parentVal) {
            return parentVal.concat(childVal)
        } else {
            return [childVal] // [a]
        }
    } else {
        return parentVal
    }
}

// 遍历生命周期
HOOKS.forEach(hooks =>{
    starts[hooks] = mergeHooks
})
export function mergeOptions(parent, child) {
    const options = {}
    // 合并属性
    function mergeField(key) {
        if(starts[key]) {
            starts[key](parent[key], child[key])
        } else {
            options[key] = child[key] || parent[key]
        }
    }

    for(let key in parent) {
        mergeField(key)
    }
    for(let key in child) {
        if(!parent.hasOwnProperty(key)) {
            mergeField(key)
        }
    }
    return options
}