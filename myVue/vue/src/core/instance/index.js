import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

function Vue (options) {
  // 判断是不是通过 new 进行实例化
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}

// 定义Vue原型上的init方法（内部方法）
initMixin(Vue)
// 定义原型上跟数据相关的属性方法
stateMixin(Vue)
// 定义原型上跟事件相关的属性方法
eventsMixin(Vue)
// 定义原型上跟生命周期有关的方法
lifecycleMixin(Vue)
// 定义渲染相关函数
renderMixin(Vue)

export default Vue
