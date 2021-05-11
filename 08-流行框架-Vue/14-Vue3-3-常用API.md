# 14-Vue3-3-常用 API

## 一 常用基础 API

### 1.1 computed() 计算属性

```html
<template>
    <h2>输入响应式数据</h2>
    <input type="text" placeholer="请输入姓名" v-model="user.name" />
    <input type="text" placeholer="请输入年龄" v-model="user.age" />
    <h2>显示计算数据</h2>
    当前姓名：
    <input type="text" v-model="computedName" />
    <br />
    当前年龄：
    <input type="text" v-model="computedAge" />
    <br />
</template>

<script>
    import { computed, reactive } from 'vue'
    export default {
        name: 'HelloWorld',
        setup() {
            const user = reactive({
                name: 'Li',
                age: 30,
            })

            // 第一种使用方式
            const computedName = computed(() => {
                return user.name
            })

            // 第二种使用方式
            const computedAge = computed({
                get() {
                    return parseInt(user.age) + 1
                },
                set(val) {
                    // 修改静思园属性时触发
                    console.log('set....')
                    console.log(val)
                },
            })

            return {
                user,
                computedName,
                computedAge,
            }
        },
    }
</script>
```

### 1.2 watch()、watchEffect() 监视

```html
<template>
    <h2>输入响应式数据</h2>
    <input type="text" placeholer="请输入姓名" v-model="user.name" />
    <input type="text" placeholer="请输入年龄" v-model="user.age" />
    <h2>显示监视数据</h2>
    watch年龄：
    <input type="text" v-model="watchAge" />
    <br />
</template>

<script>
    import { reactive, watch, ref } from 'vue'
    export default {
        name: 'HelloWorld',
        setup() {
            const user = reactive({
                name: 'Li',
                age: 30,
            })

            let watchAge = ref(0)
            watch(
                user,
                val => {
                    console.log('watch...')
                    watchAge.value = val.age * 2
                },
                { immediate: true }
            )
            // 第二个可选参数 immediate，让watch在一开始就执行一次
            // 第三个可选参数 deep，是否深层监视 user对象的变更
            // 此外，vue3提供了 watchEffect() 会默认执行一次，类似带 immediate参数的watch

            return {
                user,
                watchAge,
            }
        },
    }
</script>
```

贴士：

-   第二个可选参数：immediate，让 watch 在一开始就执行一次，vue3 提供了 watchEffect() 函数功能与其类似
-   第三个可选参数：deep，表示是否深层监视对象的变更

watch 还支持监视多个数据：

```js
// 非响应式数据需要回调形式
watch([user, person, () => num])
```

## 二 其他常用 API

### 2.1 toRaw() 与 markRow()

toRaw() 返回普通对象，内部会将由 reactive()、readonly() 转换的响应式代理对象还原为普通对象，适用于临时读取源数据，其访问不会被代理追踪，所以写入也不会触发界面更新。

markRaw() 返回对象本身，内部会标记源对象，使其永远不会转换为代理对象，适用于一些无需转换为响应式数据的源数据。

### 2.2 toRefs()

toRefs() 可以把一个响应式对象转换为普通对象，该普通的对象的每个属性都是一个 ref。

### 2.3 customRef() 自定义 ref

customRef() 用于自定义一个 ref：

```html
<template>
    <input type="text" v-model="keyword" />
    <p>{{keyword}}</p>
</template>

<script>
    import { customRef } from 'vue'

    function debounce(val, delay) {
        let timer

        let myCustomRef = customRef((track, trigger) => {
            return {
                get() {
                    track() // 告诉vue追踪数据
                    return val
                },
                set(newVal) {
                    clearTimeout(timer)
                    timer = setTimeout(() => {
                        val = newVal
                        trigger() // 告诉vue更新界面
                    }, delay)
                },
            }
        })

        return myCustomRef
    }

    export default {
        num1: 'HelloWorld',
        setup() {
            // 自定义一个防抖函数
            const keyword = debounce('hello', 500)
            return {
                keyword,
            }
        },
    }
</script>
```

### 2.4 provide 与 inject

provide 与 inject 可以提供依赖注入功能，类似 Vue2 的 provide/inject，用来实现跨层级组件通信。

示例：祖先组件向孙子组件传递数据。

祖先组件：

```html
<template>
    祖先数据：{{color}}
    <button @click="color='green'">传递绿色</button>
    <button @click="color='red'">传递红色</button>
    <Son />
</template>

<script>
    import { ref, provide } from 'vue'
    import Son from './Son.vue'

    export default {
        name: 'HelloWorld',
        components: {
            Son: Son,
        },
        setup() {
            const color = ref('black')
            provide('colorTag', color)
            return {
                color,
            }
        },
    }
</script>
```

孙子组件：

```html
<template>
    <div>grandson：{{color}}</div>
</template>

<script>
    import { inject } from 'vue'
    export default {
        name: 'GrandSon',
        setup() {
            const color = inject('colorTag')
            return {
                color,
            }
        },
    }
</script>

<style></style>
```
