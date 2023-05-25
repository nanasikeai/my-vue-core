function patchProps(el, oldProps = {}, props = {}) {
    // 老有新无 删除老的
    let oldStyle = oldProps.style || {}
    let newStyle = props.style || {}
    for(let key in oldStyle) {
        if(!newStyle[key]) {
            el.style[key] = ''
        }
    }
    for(let key in oldProps) {
        if(!props[key]) {
            el.removeAttribute(key)
        }
    }
    for(let key in props) {
        if(key === 'style') {
            for(let styleName in props.style) {
                el.style[styleName] = props.style[styleName]
            }
        } else {
            el.setAttribute(key, props[key])
        }
    }
}

export function createEl(vnode) {
    // 解析
    let {tag, data, key, children, text} = vnode
    if(typeof tag === 'string') {
        vnode.el = document.createElement(tag) // 创建元素
        patchProps(vnode.el, {}, data)
        if(children.length) {
            for(let i = 0,l = children.length; i < l; i++) {
                vnode.el.appendChild(createEl(children[i]))
            }
        }
    } else {
        vnode.el = document.createTextNode(text)
    }
    return vnode.el
}

function isSameVnode(oldVnode, vnode) {
    return oldVnode.tag === vnode.tag && oldVnode.key === vnode.key
}

function mountChildren(el, newChildren) {
    for(let i = 0; i < newChildren.length; i ++) {
        let child = newChildren[i]
        el.appendChild(createEl(child))
    }
}

function updateChildren(el, oldChildren, newChildren) {
    let oldStartIndex = 0
    let newStartIndex = 0
    let oldEndIndex = oldChildren.length - 1
    let newEndIndex = newChildren.length - 1

    let oldStartVnode = oldChildren[0]
    let newStartVnode = newChildren[0]
    let oldEndVnode = oldChildren[oldEndIndex]
    let newEndVnode = newChildren[newEndIndex]

    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
        // 比较第一个节点是否相同
        if(isSameVnode(oldStartVnode, newStartVnode)) {
            patchVnode(oldStartVnode, newStartVnode) // 如果是相同节点，则递归比较子节点
            oldStartVnode = oldChildren[++oldStartIndex]
            newStartVnode = newChildren[++newStartIndex]
            continue
        }
        // 比较倒数第一个节点是否相同
        if(isSameVnode(oldEndVnode, newEndVnode)) {
            patchVnode(oldEndVnode, newEndVnode) // 如果是相同节点，则递归比较子节点
            oldEndVnode = oldChildren[--oldEndIndex]
            newEndVnode = newChildren[--newEndIndex]
            continue
        }
        // 交叉比对, 老的最后一个和新的第一个相同
        if(isSameVnode(oldEndVnode, newStartVnode)) {
            patchVnode(oldEndVnode, newStartVnode)
            el.insertBefore(oldEndVnode.el, oldStartVnode.el) // 将老的最后一个移动到前面
            oldEndVnode = oldChildren[--oldEndIndex]
            newStartVnode = newChildren[++newStartIndex]
            continue
        }
        // 交叉对比，老的第一个和新的第一个相同
        if(isSameVnode(oldStartVnode, newEndVnode)) {
            patchVnode(oldStartVnode, newEndVnode)
            el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling)
            oldStartVnode = oldChildren[++oldStartIndex]
            newEndVnode = newChildren[--newEndIndex]
            continue
        }
    }
    // 如果循环结束，新children的头指针和尾指针之间还有节点，则是新增的需要插入
    if(newStartIndex <= newEndIndex) {
        for(let i = newStartIndex; i <= newEndIndex; i++) {
            let childEl = createEl(newChildren[i])
            let anchor = newChildren[newEndIndex + 1] ?
                newChildren[newEndIndex + 1].el :
                null // anchor相当于一个参照物，如果是从尾指针向前比较的unshift，则newEndIndex的下一个肯定是有值
            el.insertBefore(childEl, anchor) // anchor为null，说明是push，即appendChild
        }
    }
    // 如果循环结束，老的children的头指针和尾指针之间还有节点， 则是多余的需要删除
    if(oldStartIndex <= oldEndIndex) {
        for(let i = oldStartIndex; i <= oldEndIndex; i ++) {
            let childEl = oldChildren[i].el
            el.removeChild(childEl)
        }
    }

}

function patchVnode(oldVnode, vnode) {
    if(isSameVnode(oldVnode, vnode)) {
        let el = vnode.el = oldVnode.el // 复用老节点标签
        // 文本情况
        if(!oldVnode.tag) {
            if(oldVnode.text !== vnode.text) {
                oldVnode.el.textContent = vnode.text // 用新文本覆盖
            }
        }
        // 标签情况
        patchProps(el, oldVnode.data, vnode.data) // 先对比属性
        let oldChildren = oldVnode.children || []
        let newChildren = vnode.children || []
        if(oldChildren.length && newChildren.length) { // 再对比子节点
            // 对比两个子节点
            updateChildren(el, oldChildren, newChildren)
        } else if(newChildren.length) {
            // 新有老无 新增
            mountChildren(el, newChildren)
        } else if(oldChildren.length) {
            // 老有新无 删除
            el.innerHTML = '' // 有组件可能也会删除
        }
        return el
    } else {
        let el = createEl(vnode)
        oldVnode.el.parentNode.replaceChild(el, oldVnode.el)
        return el
    }
}

export function patch(oldVnode, vnode) {
    const isRealElement = oldVnode.nodeType
    // 初次渲染
    if(isRealElement) {
        let el = createEl(vnode)
        let parentEl = oldVnode.parentNode
        parentEl.insertBefore(el, oldVnode.nextSibling)
        parentEl.removeChild(oldVnode)
        return el
    } else { // diff算法
        // 判断两个节点是不是同一个节点，不一样直接删除老的，替换新的；一样比较两个节点属性（平级比较）
        // 节点比较完后，比较两个节点children
        return patchVnode(oldVnode, vnode)
    }

}