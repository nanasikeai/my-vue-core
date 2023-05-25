function vnode(tag, data, key, children, text) {
    return {
        tag,
        data,
        key,
        children,
        text
    }
}

function createElement(tag, data = {}, ...children) {
    return vnode(tag, data, data.key, children)
}

function createText(text) {
    return vnode(undefined, undefined,undefined,undefined, text)
}

export function renderMixin(vue) {
    vue.prototype._c = function () { // 标签
        return createElement(...arguments)
    }
    vue.prototype._v = function (text) { // 文本
        return createText(text)
    }
    vue.prototype._s = function (val) { // 变量
        return val == null ? "" : typeof val === 'object' ? JSON.stringify(val) : val
    }
    vue.prototype._render = function () {
        let vm = this
        let render = vm.$options.render
        let vnode = render.call(vm)
        return vnode
    }
}