class ElementWrapper {
  constructor(type) {
    this.root = document.createElement(type)
  }
  setAttribute(name, value) {
    this.root.setAttribute(name, value)
  }
  appendChild(component) {
    this.root.appendChild(component.root) //隐藏api
  }
}

class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content)
  }
}

export class Component {
  constructor() {
    this.props = Object.create(null) //绝对的空
    this.children = []
    this._root = null
  }
  setAttribute(name, value) {
    this.props[name] = value
  }
  appendChild(component) {
    this.children.push(component)
  }

  //getter
  get root() {
    if (!this._root) {
      this._root = this.render().root //render出来的东西希望有root 不然就会递归，知道根节点为elementwrapper或者textWrapper
    }
    return this._root
  }
}

export function createElement(type, attributes, ...children) {
  let e
  if (typeof type === "string") {
    e = new ElementWrapper(type) //Mycomponent 是个对象，需要进行特殊处理，不然这里塞不进去
  } else {
    e = new type() //
  }

  for (let p in attributes) {
    e.setAttribute(p, attributes[p])
  }

  let insertChildren = (children) => {
    for (let child of children) {
      if (typeof child === "string") {
        //处理文本节点
        child = new TextWrapper(child)
      }
      if (typeof child === "object" && child instanceof Array) {
        insertChildren(child)
      } else {
        e.appendChild(child)
      }
    }
  }
  insertChildren(children)

  return e
}

export function render(component, parentElement) {
  parentElement.appendChild(component.root)
}
