import {compiler} from "./compiler.js"
let data = {
  data:{
    people: {
      name: "张三",
      age: "今年22岁",
    }
  }
}
// 1. 拿到模板
let myVue = document.querySelector("#myVue")
let temNode = myVue.cloneNode(true)
compiler(temNode, data)
// 2. 替换模板
myVue.parentNode.replaceChild(temNode, myVue)