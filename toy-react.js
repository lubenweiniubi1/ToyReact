const RENDER_TO_DOM = Symbol("render to Dom")

class ElementWrapper {
  constructor(type) {
    this.root = document.createElement(type)
  }
  setAttribute(name = "", value) {
    if (name.match(/^on([\s\S]+)$/)) {
      this.root.addEventListener(
        RegExp.$1.replace(/^[\s\S]/, (c) => c.toLowerCase()),
        value
      )
    } else {
      this.root.setAttribute(name, value)
    }
  }
  appendChild(component) {
    let range = document.createRange()
    range.setStart(this.root, this.root.childNodes.length)
    range.setEnd(this.root, this.root.childNodes.length)
    component[RENDER_TO_DOM](range)
  }
  [RENDER_TO_DOM](range) {
    range.deleteContents()
    range.insertNode(this.root)
  }
}

class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content)
  }
  [RENDER_TO_DOM](range) {
    range.deleteContents()
    range.insertNode(this.root)
  }
}

export class Component {
  constructor() {
    this.props = Object.create(null) //绝对的空
    this.children = []
    this._root = null
    this._range = null
  }
  setAttribute(name, value) {
    this.props[name] = value
  }
  appendChild(component) {
    this.children.push(component)
  }

  [RENDER_TO_DOM](range) {
    this._range = range
    this.render()[RENDER_TO_DOM](range)
  }
  rerender() {
    this._range.deleteContents()
    this[RENDER_TO_DOM](this._range)
  }

  setState(newState) {
    if (this.state === null || typeof this.state !== "object") {
      this.state = newState
      this.rerender()
      return
    }

    //深拷贝设计
    let merge = (oldState, newState) => {
      for (let p in newState) {
        //null 的typeof 也是object ，所以这里要联合判断
        if (oldState[p] === null || typeof  oldState[p] !== "object") {
          oldState[p] = newState[p]
        } else {
          merge(oldState[p], newState[p])
        }
      }
    }

    merge(this.state, newState)
    this.rerender()
  }

  //getter
  // get root() {
  //   if (!this._root) {
  //     this._root = this.render().root //render出来的东西希望有root 不然就会递归，知道根节点为elementwrapper或者textWrapper
  //   }
  //   return this._root
  // }
}

export function createElement(type, attributes, ...children) {
  let e
  if (typeof type === "string") {
    e = new ElementWrapper(type) // 开始的string 是一个原生标签
  } else {
    e = new type() //Mycomponent 是个对象，需要进行特殊处理，不然这里塞不进去
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
        //多个children传入的是数组
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
  let range = document.createRange()
  range.setStart(parentElement, 0)
  range.setEnd(parentElement, parentElement.childNodes.length)
  range.deleteContents()
  component[RENDER_TO_DOM](range)
}
