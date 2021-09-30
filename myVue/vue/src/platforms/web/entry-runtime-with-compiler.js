/* @flow */

import config from 'core/config'
import { warn, cached } from 'core/util/index'
import { mark, measure } from 'core/util/perf'

import Vue from './runtime/index'
import { query } from './util/index'
import { compileToFunctions } from './compiler/index'
import { shouldDecodeNewlines, shouldDecodeNewlinesForHref } from './util/compat'

const idToTemplate = cached(id => {
  const el = query(id)
  return el && el.innerHTML
})

// 缓存了原型上的$mount方法
const mount = Vue.prototype.$mount
// 重新定义$mount,为包含编译器和不包含编译器的版本提供不同封装，最终调用的是缓存原型上的$mount方法
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  // 获取挂载函数
  el = el && query(el)

  /* istanbul ignore if */
  // 挂载元素不能为根结点
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' && warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    )
    return this
  }

  const options = this.$options
  // resolve template/el and convert to render function
  // 需要编译或者不需要编译
  if (!options.render) {
    // render选项不存在，代表是template模版的形式，此时需要进行模版的编译过程
    let template = options.template
    if (template) {
      // 针对字符串模版和选择符匹配模版
      if (typeof template === 'string') {
        // 选择符匹配模版，以‘#’为前缀的选择器
        if (template.charAt(0) === '#') {
          /**
          <div id="app">
            <div>test1</div>
            <script type="x-template" id="test">
              <p>test</p>
            </script>
          </div>
              var vm = new Vue({
                el: '#app',
                template: '#test'
              })
           */
          // 获取匹配元素的innerHTML
          template = idToTemplate(template)
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            )
          }
        }
      } else if (template.nodeType) { // 针对dom元素匹配
        /**
          <div id="app">
            <div>test1</div>
            <span id="test"><div class="test2">test2</div></span>
          </div>
          var vm = new Vue({
            el: '#app',
            template: document.querySelector('#test')
          }) 
         */
        // 获取匹配元素的innerHTML
        template = template.innerHTML
      } else {
        // 其他类型判定为非法传入
        if (process.env.NODE_ENV !== 'production') {
          warn('invalid template option:' + template, this)
        }
        return this
      }
    } else if (el) {
      // 如果没有传入template模板，则默认以el元素所属的根节点作为基础模板
      template = getOuterHTML(el)
    }
    if (template) {
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile')
      }

      const { render, staticRenderFns } = compileToFunctions(template, {
        // 编译的配置信息
        outputSourceRange: process.env.NODE_ENV !== 'production',
        shouldDecodeNewlines,
        shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,
        comments: options.comments
      }, this)
      options.render = render
      options.staticRenderFns = staticRenderFns

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile end')
        measure(`vue ${this._name} compile`, 'compile', 'compile end')
      }
    }
  }
   // 无论是template模板还是手写render函数最终调用缓存的$mount方法
  return mount.call(this, el, hydrating)
}

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 */
function getOuterHTML (el: Element): string {
  if (el.outerHTML) {
    return el.outerHTML
  } else {
    const container = document.createElement('div')
    container.appendChild(el.cloneNode(true))
    return container.innerHTML
  }
}
// 将compileToFunctions方法暴露给Vue作为静态方法存在
Vue.compile = compileToFunctions

export default Vue
