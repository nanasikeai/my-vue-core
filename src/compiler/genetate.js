//  处理属性
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g
function genProps(attrs) {
    let str = ''
    for (let i = 0,l = attrs.length; i < l; i++) {
        let attr = attrs[i]
        if(attr.name === 'style') {
            let obj = {}
            // ['color: red', 'font-size: 30px']
            attr.value.split(';').forEach(item => {
                // ['color', 'red']
                let [key, value] = item.split(':')
                obj[key] = value
            })
            attr.value = obj
        }
        str += `${attr.name}:${JSON.stringify(attr.value)},`
    }
    return `{${str.slice(0,-1)}}`
}

// 元素或者文本
function gen(child) {
    if(child.type === 1) { // 元素
        return generate(child)
    }
    if(child.type === 3) { // 文本
        let text = child.text
        if(!defaultTagRE.test(text)) {
            return `_v(${JSON.stringify(text)})`
        }
        let tokens = []
        let lastIndex = defaultTagRE.lastIndex = 0
        let match
        while(match = defaultTagRE.exec(text)) {
            let index = match.index
            if(index > lastIndex) { // 添加文本内容
                tokens.push(JSON.stringify(text.slice(lastIndex,index)))
            }
            tokens.push(`_s(${match[1].trim()})`)
            lastIndex = index + match[0].length
        }
        if(lastIndex < text.length) {
            tokens.push(JSON.stringify(text.slice(lastIndex)))
        }
        return `_v(${tokens.join('+')})`
    }
}

// 处理子节点
function genChildren(el) {
    let children = el.children
    if(children.length) {
        return children.map(child => gen(child)).join(',')
    }
}

export function generate(el) {
    let children = genChildren(el)
    return `_c('${el.tag}',${el.attrs.length ? genProps(el.attrs) : 'undefined'}${el.children.length ? `,${children}` : ''})`
}