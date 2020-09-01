# ToyReact
学习自制袖珍react

最重要的是

+ jsx

1. 安装webpack ,webpack-cli

## 安装webpack

最终变成单个大文件

### 使用babel，为了兼容

转换ES6 ，打包，算了 自己看官网，累死了。

使用 `npx webpack`来进行打包 ，加了

打包成功了出现了 dist 目录

```javascript
for (let i of [1, 2, 3, 4]) {
  console.log(i)
}
//转成了

eval("for (var _i = 0, _arr = [1, 2, 3, 4]; _i < _arr.length; _i++) {\n  var i = _arr[_i];\n  console.log(i);\n}\n\n//# sourceURL=webpack:///./main.js?");
```

现在还不能使用jsx

#### @babel/plugin-transform-react-jsx  

配置了以后

```js
let a = <div></div>
//变成
var a = createElement("div", null);//被翻译成函数调用了

<div id="a" class="b" />
 //变成
var a = createElement("div", {
  id: "a",
  "class": "b"
});


let a = (
  <div id="a" class="b">
    <div></div>
    <div></div>
    <div></div>
  </div>
)
//变成
var a = createElement("div", {
  id: "a",
  "class": "b"
}, createElement("div", null),
                   createElement("div", null),
                    createElement("div", null));
    
```

简单的createElment:

```js
function createElement(tagName, attributes, ...children) {
  let e = document.createElement(tagName)
  for (let p in attributes) {
    e.setAttribute(p, attributes[p])
  }
  for (let child of children) {
    if (typeof child === "string") {
      //处理文本节点
      child = document.createTextNode(child)
    }
    e.appendChild(child)
  }
  return e
}

document.body.appendChild(
  <div id="a" class="b">
    <div>abc</div>
    <div></div>
    <div></div>
  </div>
)

```

### 自定义标签明：

```js
let a =  <MyComponent id="a" class="b">
    <div>abc</div>
    <div></div>
    <div></div>
  </MyComponent>

//转成
document.body.appendChild(createElement(MyComponent, {//这里没有引号，是个函数或者是class
  id: "a",
  "class": "b"
}, createElement("div", null, "abc"), createElement("div", null), createElement("div", null)));

```

