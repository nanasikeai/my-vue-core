import {initState} from "./state";
import {compileToFunctions} from "../../compiler/index";
import {callHook, mountComponent} from "./lifecycle";
import {mergeOptions} from "../utils/index";

export function initMixin(Vue) {
    Vue.prototype._init = function (options) {
        const vm = this
        vm.$options = mergeOptions(this.constructor.options, options)
        callHook(vm, 'beforeCreated')
        // 初始化状态(包含props、data、methods、computed、watch)
        initState(vm);
        callHook(vm, 'created')
        // 創建mount
        if(vm.$options.el) {
            vm.$mount(vm.$options.el)
        }
    }
    Vue.prototype.$mount = function (el) {
        const vm = this
        let options = vm.$options
        el = document.querySelector(el)
        vm.$el = el
        if(!options.render) {
            if(options.template) {
                // nothing
            } else if(el){
                // 獲取掛載點的html
                let template = el.outerHTML
                // render函数
                let render = compileToFunctions(template)
                // 将render函数变成虚拟dom =》 真实dom
                options.render = render
            }
        }
        // 挂载组件
        mountComponent(vm,el)
    }
}
