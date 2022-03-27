let _Vue = null;

export default class VueRouter {
  constructor(options) {
    this.options = options;
    this.routeMap = {};
    this.data = _Vue.observable({
      current: "/",
    })
  }

  static install(Vue) {
    // 1. 判断当前插件是否已经被安装
    if (VueRouter.install.installed) return;
    VueRouter.install.installed = true;
    // 2. 把Vue构造函数记录到全局变量
    _Vue = Vue;
    // 3. 将创建Vue实例时候传入的router对象注入到Vue实例上
    // 混入
    _Vue.mixin({
      beforeCreate() {
        if (this.$options.router) {
          _Vue.prototype.$router = this.$options.router;
          this.$options.router.init();
        }
      }
    })
  }

  // 遍历路由规则转为键值对存储到routerMap中
  createRouteMap() {
    this.options.routes.forEach(route => {
      this.routeMap[route.path] = route.component;
    })
  }

  initComponents(Vue) {
    Vue.component("router-link", {
      props: {
        to: String,
      },
      // template:`<a :href="to"><slot></slot></a>`
      render(h) {
        return h("a", {
          attrs: {
            href: this.to
          },
          on: {
            "click": this.clickHandler
          },
        }, [this.$slots.default])
      },
      methods: {
        clickHandler(evt) {
          evt.preventDefault();
          // 改变地址栏，但不会发送请求
          window.history.pushState({}, "", this.to);
          this.$router.data.current = this.to;
        }
      }
    })
    const _this = this;
    Vue.component("router-view", {
      render(h) {
        let current = _this.data.current;
        const component = _this.routeMap[current];
        return h(component)
      }
    })
  }

  init() {
    this.createRouteMap();
    this.initComponents(_Vue);
    this.initEvent();
  }

  initEvent() {
    window.addEventListener("popstate", () => {
      this.data.current = window.location.pathname;
    })
  }
}