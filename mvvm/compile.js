class Compile {
  constructor(el, vm) {
    this.el = this.isElement(el) ? el : document.querySelector(el);
    this.vm = vm;
    if (this.el) {
      let fragment = this.node2fragment(this.el);
      this.compile(fragment);
      this.el.appendChild(fragment);
    }
  }

  isDirective(name) {
    return name.startsWith('v-');
  }

  isElement(node) {
    return node.nodeType && node.nodeType == '1'
  }

  node2fragment(el) {
    let fragment = document.createDocumentFragment();
    let firstChild;
    while (firstChild = el.firstChild) {
      fragment.appendChild(firstChild);
    }
    return fragment;
  }

  compileElement(node) {
    let attrs = node.attributes;
    Array.from(attrs).forEach((attr) => {
      if (this.isDirective(attr.name)) {
        let v = attr.value;
        let type = attr.name.slice(2);
        CompileUtil[type](node, this.vm, v);
      } else {

      }
    })

  }

  compileText(node) {
    let expr = node.textContent;
    // console.log(text)
    let reg = /\{\{[^}]+\}\}/g;
    if (reg.test(expr)) {
      CompileUtil['text'](node, this.vm, expr);
    }
  }

  compile(node) {
    let childNodes = node.childNodes;
    Array.from(childNodes).forEach((node) => {
      if (this.isElement(node)) {
        this.compileElement(node);
        this.compile(node);
      } else { // 文本
        this.compileText(node);
      }
    })
  }
}

CompileUtil = {
  // 'message = a.b.c'
  getVal(data, expr) {
    return expr.split('.').reduce((acc, cur, index, arr) => {
      return acc[cur]
    }, data)
  },
  text(node, vm, expr) { //文本
    let temp = expr;
    expr = expr.trim().replace(/\{\{([^}]+)\}\}/g, '$1') // 去\s

    new Watcher(vm, expr);

    let updateFn = this.updater['textUpdate'];
    updateFn && updateFn(node, this.getVal(vm.$data, expr), temp);
  },
  model(node, vm, expr) { // 输入框
    let updateFn = this.updater['modelUpdate'];
    // 数据变化 应该调用watcher的cb
    // 值变化后调用cb 传递新值
    new Watcher(vm, expr, (newValue)=>{
      updateFn && updateFn(node, this.getVal(vm.$data, expr));
    })
    updateFn && updateFn(node, this.getVal(vm.$data, expr));
  },
  updater: {
    textUpdate(node, value, expr) {
      node.textContent = value;
    },
    modelUpdate(node, value) {
      node.value = value;
    }
  }
  // ...
}