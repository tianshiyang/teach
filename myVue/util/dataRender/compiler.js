// 正则表达式，匹配{}中的内容
let rkuohao = /\{\{(.+?)\}\}/g;
// compiler中两个参数，template页面模板，data数据
function compiler(template, data) {
  let nodeChilds = template.childNodes
  for (let i = 0; i < nodeChilds.length; i++) {
    // nodeType== 3文本节点； nodetype == 1 元素节点
    let nodeType = nodeChilds[i].nodeType
    if (nodeType == 3) {
      // 文本节点
      let text = nodeChilds[i].nodeValue
      text = text.replace(rkuohao, function(odlVal, k) {
        // 防止类似于{{  name  }}这种情况
        let key = k.trim()
        // 如果数据格式是{{ data.people.name }}
        let keyList = key.split(".")
        return getDeepValue(keyList, data)
      })
      // 替换节点
      nodeChilds[i].nodeValue = text
    } else if (nodeType == 1) {
      // 元素节点
      compiler(nodeChilds[i], data)
    }
  }
}
function getDeepValue(keyList, data) {
  let prop = keyList
  let res = data
  // shift() 删除数组第一项，并返回该项值
  while(prop = keyList.shift()) {
    res = res[prop]
  }
  return res
}
export {compiler}