const attribute =
    /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const dynamicArgAttribute =
    /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+?\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`)
const startTagClose = /^\s*(\/?)>/
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)
const doctype = /^<!DOCTYPE [^>]+>/i
// #7298: escape - to avoid being passed as HTML comment when inlined in page
const comment = /^<!\--/
const conditionalComment = /^<!\[/

export function parseHTML(html) {
    // 删除
    function advance(index) {
        html = html.substring(index)
    }

    // 解析开始标签
    function parseStartTag() {
        // 返回结果或者false
        const start = html.match(startTagOpen)
        let match
        if(start) {
            match = {
                tagName: start[1],
                attrs: []
            }
            // 删除开始标签
            advance(start[0].length)
            // 遍历开始标签的属性
            let attr
            let end
            // 不为结束'<'，且有属性
            while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
                match.attrs.push({
                    name: attr[1],
                    value: attr[3] || attr[4] || attr[5]
                })
                advance(attr[0].length)
            }
            if(end) {
                advance(end[0].length)
                return match
            }
        }
    }

    function createASTElement(tag, attrs) {
        return {
            tag,
            attrs,
            children: [],
            type: 1,
            parent: null
        }
    }
    let root
    let createParent
    let stack = []
    function start(tagName, attrs) {
        let element = createASTElement(tagName, attrs)
        if(!root) {
            root = element
        }
        createParent = element
        stack.push(element)
    }

    function charts(text) {
        text = text.replace(/\s/g, '')
        if(text) {
            createParent.children.push({
                type: 3,
                text
            })
        }
    }

    function end(tag) {
        let element = stack.pop()
        createParent = stack[stack.length -1]
        if(createParent) {
            element.parent = createParent.tag
            createParent.children.push(element)
        }
    }

    // 遍历html字符串开始解析
    while (html) {
        // 判断标签
        let textEnd = html.indexOf('<')
        // 是一个标签,两种情况 ：开始标签、结束标签
        if(textEnd === 0) {
            // 开始标签
            const startTagMatch = parseStartTag()
            if(startTagMatch) {
                start(startTagMatch.tagName, startTagMatch.attrs)
                continue
            }
            // 结束标签
            const endTagMatch = html.match(endTag)
            if(endTagMatch) {
                advance(endTagMatch[0].length)
                end(endTagMatch[1])
                continue
            }
        }
        // 是文本
        if(textEnd > 0) {
            // 获取文本内容
            let text = html.substring(0, textEnd)
            if(text) {
                advance(text.length)
                charts(text)
            }
        }
    }
    return root
}