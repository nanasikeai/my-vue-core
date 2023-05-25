import {parseHTML} from "./html-parser";
import {generate} from "./genetate";

export function compileToFunctions(template) {
    // 将html变成ast语法树
    let ast = parseHTML(template)
    // ast变成字符串 =》 变成render函数
    let code = generate(ast)
    let render = new Function(`with(this){return ${code}}`)
    // 将render函数 变成虚拟dom
    return render
}