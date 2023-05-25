import {initMixin} from "./init";
import {lifecycleMixin} from "./lifecycle";
import {renderMixin} from "../../vnode/index";
import {initGlobalApi} from "../global-api/index";
import Watcher, {nextTick} from "../observe/watcher";

function Vue(options) {
    this._init(options)
}
Vue.prototype.$nextTick = nextTick
Vue.prototype.$watch = function (exprOrFn, cb) {
    new Watcher(this, exprOrFn, cb, { user: true })
}
initMixin(Vue)
lifecycleMixin(Vue) // 添加生命周期
renderMixin(Vue) // 添加_render方法
initGlobalApi(Vue)

export default Vue