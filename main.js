import { createElement, render, Component } from "./toy-react.js"

//继承默认行为
class MyComponent extends Component {
  render() {
    return (
      <div>
        <h1>my component </h1>
        {this.children}
      </div>
    )
  }
}

render(
  <MyComponent id="a" class="b">
    <div>abc</div>
    <div></div>
    <div></div>
  </MyComponent>,
  document.body
)
