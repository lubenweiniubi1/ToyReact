const RENDER_TO_DOM = Symbol("render to Dom")

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
  get vdom() {
    return this.render().vdom //这里是递归的调用
  }
  get vchildren() {
    return this.children.map((child) => child.vdom)
  }
  [RENDER_TO_DOM](range) {
    this._range = range
    this.render()[RENDER_TO_DOM](range)
  }
  rerender() {
    let oldRange = this._range

    let range = document.createRange()
    range.setStart(oldRange.startContainer, oldRange.startOffset)
    range.setEnd(oldRange.startContainer, oldRange.startOffset)

    this[RENDER_TO_DOM](range)

    oldRange.setStart(range.endContainer, range.endOffset)
    oldRange.deleteContents()
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
        if (oldState[p] === null || typeof oldState[p] !== "object") {
          oldState[p] = newState[p]
        } else {
          merge(oldState[p], newState[p])
        }
      }
    }

    merge(this.state, newState)
    this.rerender()
  }
}

class ElementWrapper extends Component {
  constructor(type) {
    super(type)
    this.type = type
  }
  // setAttribute(name = "", value) {
  //   if (name.match(/^on([\s\S]+)$/)) {
  //     this.root.addEventListener(
  //       RegExp.$1.replace(/^[\s\S]/, (c) => c.toLowerCase()),
  //       value
  //     )
  //   } else {
  //     if (name === "className") {
  //       this.root.setAttribute("class", value)
  //     } else {
  //       this.root.setAttribute(name, value)
  //     }
  //   }
  // }

  // appendChild(component) {
  //   let range = document.createRange()
  //   range.setStart(this.root, this.root.childNodes.length)
  //   range.setEnd(this.root, this.root.childNodes.length)
  //   component[RENDER_TO_DOM](range)
  // }
  get vdom() {
    return this
    /*{
      type: this.type,
      props: this.props,
      children: this.children.map((child) => child.vdom),
    }*/
  }

  [RENDER_TO_DOM](range) {
    range.deleteContents()
    let root = document.createElement(this.type)

    for (let name in this.props) {
      let value = this.props[name]

      if (name.match(/^on([\s\S]+)$/)) {
        root.addEventListener(
          RegExp.$1.replace(/^[\s\S]/, (c) => c.toLowerCase()),
          value
        )
      } else {
        if (name === "className") {
          root.setAttribute("class", value)
        } else {
          root.setAttribute(name, value)
        }
      }
    }

    for (let child of this.children) {
      let childRange = document.createRange()
      childRange.setStart(root, root.childNodes.length)
      childRange.setEnd(root, root.childNodes.length)
      child[RENDER_TO_DOM](childRange)
    }

    range.insertNode(root)
  }
}

class TextWrapper extends Component {
  constructor(content) {
    super(content)
    this.content = content
    this.root = document.createTextNode(content)
    this.type = "#text"
  }
  get vdom() {
    return this
    /*
    {
      type: "#text",
      content: this.content,
    }*/
  }
  [RENDER_TO_DOM](range) {
    range.deleteContents()
    range.insertNode(this.root)
  }
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
      if (child === null) {
        continue
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
