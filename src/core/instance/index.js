import {initMixin} from "./init";
import {lifecycleMixin} from "./lifecycle";
import {renderMixin} from "../../vnode/index";
import {initGlobalApi} from "../global-api/index";
import Watcher, {nextTick} from "../observe/watcher";
import {compileToFunctions} from "../../compiler/index";
import {createEl, patch} from "../../vnode/patch";

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

setTimeout(() =>{
    let render1 = compileToFunctions(`<ul key="t" style="color: red">
        <li key="a">a</li>
        <li key="b">b</li>
        <li key="c">c</li>
        <li key="d">d</li>
    </ul>`)
    let vm1 = new Vue({data: {name: '杨'}})
    let preVnode = render1.call(vm1)
    let el1 = createEl(preVnode)
    document.body.appendChild(el1)

    let render2 = compileToFunctions(`<ul key="t" style="color: green">   
        <li key="d">d</li>    
        <li key="c">c</li>
        <li key="b">b</li>
        <li key="a">a</li>
    </ul>`)
    let vm2 = new Vue({data: {name: '杨'}})
    let nextVnode = render2.call(vm2)

// 不直接替换真实节点，而是比较他们之间的差异再生成真实dom
    setTimeout(() =>{
        patch(preVnode, nextVnode)
    },3000)
},500)



export default Vue