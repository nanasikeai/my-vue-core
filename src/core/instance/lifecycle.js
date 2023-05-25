import {patch} from "../../vnode/patch";
import Watcher from "../observe/watcher";

export function mountComponent(vm, el) {
    // _render 将render函数变成虚拟dom
    // _update 将虚拟dom变成真实dom，放到页面
    callHook(vm, 'beforeMounted')
    let updateComponent = () => {
        vm._update(vm._render())
    }
    let watcher = new Watcher(vm, updateComponent, ()=>{}, true)
    callHook(vm, 'mounted')
}

export function lifecycleMixin(vue) {
    vue.prototype._update = function (vnode) {
        let vm = this
        /*
        * $el 旧的dom
        * vnode 虚拟dom
        * */
        vm.$el = patch(vm.$el, vnode)
    }
}

// 生命周期调用
export function callHook(vm, hook) {
    const handler = vm.$options[hook]
    if(handler) {
        for(let i = 0, l = handler.length; i < l; i++) {
            handler[i].call(this) // 改变生命周期this指向
        }
    }
}