# 附-ES 规范

## 一 ES2017

### 1.1 Object.values Object.entries

### 1.2 async/await

## 二 ES2018

### 2.1 对象支持扩展

### 2.2 Promise.finally

### 2.3 for await

## 三 ES2019

### 3.1 Array.flat、Array.flatMap

### 3.2 Object.fromEntries

### 3.3 String.trimStart String.trimEnd

## 四 ES2020

### 4.1 String.prototype.matchAll

### 4.2 动态导入 dynamic import

### 4.3 Bigint

### 4.4 可选操作符 Optional Chaining

?运算符，也是链判断运算符，支持开发者读取深度嵌套在对象链中的属性，却不必验证每个属性都是否存在，引用为空时，返回 undefined：

```js
const obj = {
  name: 'zs',
  info: {
    age: 14,
    sex: 1,
  },
}

console.log(obj.sex?)// undefined
console.log(obj.info?.school)// undefined
```

### 4.5 空位操作符 Nullish coalescing

??操作符下，可以不想让 0、空字符串、false 当成假，只把 null 、undefined 当成假：

```js
console.log(false ?? true) // false
console.log(0 ?? 1) // 0
console.log(undefined ?? []) // []
```

### 4.6 Promise.allSettled

### 4.7 globalThis

```js
// ES2020 前使用下列封装方法获取环境的this
const getGlobalThis = () => {
  // webworker
  if (typeof self !== 'undefined') return self

  // browser
  if (typeof window !== 'undefined') return window

  // node
  if (typeof global !== 'undefined') return global

  // js shell
  if (typeof this !== 'undefined') return this

  // 没找到
  throw new Error('unable to locate global object')
}
```

### 4.8 模块命名空间导出

```js
import * as utils from './util'
export { utils }
```

## 五 ES2021

### 5.1 String.prototype.replaceAll

### 5.2 逻辑运算符 ||= &&= ??=

```js
a ||= b // 等价于 a || (a = b)
a &&= b // 等价于 a && (a = b)
a ??= b // 等价于 a ?? (a = b)
```

### 5.3 WeakSet、WeakMap

### 5.3 数字分隔符

数字分隔符便于阅读，如：

```js
100000000000000
100_000_000_000_000
```

### 5.4 Promise.any
