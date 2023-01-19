# 13.1-对象操作-对象的检测

## 一 Symbol 类型基本使用

Symbol(类型) 是 ES6 新增的基本数据类型，其实例是**唯一、不可变的**，其用途是确保对象属性使用唯一标识符，不发生冲突！

贴士：Symbol 并不能用来作为创建对象的私有属性，因为 Object API 提供了获取 Symbol 属性的方法，且 ES 未来方案已经规定 `#` 符号表示私有属性。

创建 Symbol 类型：

```js
// 直接创建
let s1 = Symbol()
console.log(typeof s1) // symbol
let s2 = Symbol()
console.log(typeof s2) // symbol

// 传入一个字符串参数描述，这个字符串只是一个描述，用来提供调试帮助，没有其他意义
let s3 = Symbol('demo3')
console.log(typeof s3) // symbol
let s4 = Symbol('demo4')
console.log(typeof s4) // symbol

// 甚至可以传入字符串
let s5 = Symbol({ name: 'lisi' })

// 任意两个 Symbol 都不相等
console.log(s1 == s2) // false
console.log(s3 == s4) // false
```

注意：Symbol 类型是值类型，其没有对应包装对象！而数值、布尔等都有包装类型，如：Number()、Boolean()，这种包装类型与 Symbol 并不是一回事。所以 Symbol 不能使用 `new`进行构造，会报错：`Symbol is not a constructor`。如果要强行使用符号包装对象，可以使用 Object 函数：

```js
let s = Symbol()
let sObj = Object(s)
```

## 二 Symbol 作用

任意两个 Symbol 都不相等，利用该特性可以解决一些实际问题。比如两个对象都要对一个对象进行属性插入，插入的属性的 key 名称相同，那么就会引发问题，有了 Symbol 就可以解决：

```js
let obj = {
  name: 'zs',
  [Symbol('category')]: '食品',
}

// 再添加一个 category 分类
obj[Symbol('category')] = '西餐'
console.log(obj) // {name: "zs", Symbol(category): "食品", Symbol(category): "西餐"}

// Symbol 属性需要使用特殊的获取方式
console.log(Object.getOwnPropertySymbols(obj)) // [Symbol(category), Symbol(category)]
console.log(Reflect.ownKeys(obj)) //["name", Symbol(category), Symbol(category)]
```

## 三 Symbol 的使用场景

```js
let users = {
  lisi: '30 岁，前端工程师',
  lisi: '24 岁，设计师',
}

// 这 2 个人的名字一样
console.log(users.lisi) // 24 岁，设计师
```

如果要继续采用上述的书写格式：

```js
let user1 = {
  name: 'lisi',
  key: Symbol(),
}

let user2 = {
  name: 'lisi',
  key: Symbol(),
}

let userInfo = {
  [user1.key]: '30 岁，前端工程师',
  [user2.key]: '24 岁，设计师',
}
```

使用 Symbol 来控制对象中的成员无法被访问：

```js
const DATA = Symol();
const user = {
  [DATA]: {name},
  set name(v) {
    this[DATA].name = v;
  }
  get name(){
    return this[DATA].name;
  }
}
```

## 四 Symbol 常见成员

## 4.1 Symbol 成员获取

```js
let s = Symbol()

let p = {
  name: 'lisi',
  [s]: '隐藏属性',
}

// 使用 for in 或者 for of 都无法遍历到 [s] 成员
// for (const key in p){}
// for (const key of Object.keys(p)){}

// 只能遍历到 Symbol 类型属性
// for(const key of Object.getOwnPropertySymbols(p)){}

// 遍历所有属性
for (const key of Reflect.ownKeys(p)) {
  console.log(key) // name  Symbol()
}
```

### 4.2 Symbol 内置属性

ES6 提供了 11 个内置的 Symbol 值，如：

```js
Symbol.hasInstance // 当其他兑现使用 instanceof 判断是否为该对象的实例时，调用该方法
Symbol.match // 当执行 str.match(obj) 时，如果该属性存在，会调用该方法
```

示例：

```js
class Person {
  static [Symbol.hasInstance]() {
    console.log('被用来检测！')
  }
}

let o = {}
console.log(o instanceof Person)
```

### 4.3 Symbol.for() 全局符号注册

先看示例：

```js
let s1 = Symbol.for('foo')
let s2 = Symbol.for('foo')
console.log(s1 === s2) // true

let s3 = Symbol('foo')
console.log(s1 === s3) // false
```

通过 Symbol.for() 创建的 Symbol 会注册到一个全局表中，这个全局表内的数据可以通过 Symbol.keyFor() 查询到：

```js
let s1 = Symbol.for('foo')
console.log(Symbol.keyFor(s1)) // foo

let s2 = Symbol('bar')
console.log(Symbol.keyFor(s2)) // undefined
```

### 4.4 Symbol.hasInstance

类似关键字 instanceof，Symbol.hasInstance 用来检查以 Symbol.hasInstance 为键的函数，在其原型链上是否存在原型：

```js
class Foo {}

let f = new Foo()

// 检查 f 实例的原型链上是否有 Foo
console.log(Foo[Symbol.hasInstance](f)) // true
```

不过要注意静态修饰符：

```js
class Foo {}

class Fov extends Foo {
  static [Symbol.hasInstance]() {
    return false
  }
}

let f = new Fov()

console.log(Foo[Symbol.hasInstance](f)) // true
console.log(f instanceof Foo) // true
console.log(Fov[Symbol.hasInstance](f)) // false
console.log(f instanceof Fov) // false
```
