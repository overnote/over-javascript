# README

## 一 关于本笔记

OverNote 系列笔记是我在平时一些学习时间阅读书籍博客、观看视频后整理出来的一套体系化笔记，着重将一个整套知识体系由浅入深的记录下来，并做**可持续的**扩展。由于笔记刚刚开始整理，许多地方仍然没有细化，笔误依然很多，敬请期待不断校正后的正式版。正式版会以类似 gitbook 的形式开放，便于阅读。

为何是笔记形式，而不是独立博客形式？

```txt
因为我个人不是很喜欢在类似博客这样的平台上分享零碎的知识点，
独立博客的内容目录极度不清晰，久而久之只能成为一个自己也不会问津的垃圾收集器。

像 OverNote 这样层次分明的结构，更方便基于 Git 在原来的基础上进行增删改，这东西纯粹是一个记录不适合做专业的 blog。
```

贴士：ES6 现在基本被各运行时接受，故 ES6 的内容已经完全被整合入对应章节，不再单独列出。如 let 声明已经并入了变量相关章节，class 并入了面向对象相关章节。

## 二 资料

贴士：**书不在于多，而在于精**，以下只是读者本人的推荐，全部书籍都有进行粗读，特别进行列表标记的是读者精读并认为内容可以的书籍。

### 2.1 HTNL CSS

笔者推荐直接阅读新时期的一些必读著作：

- [《CSS 设计指南》](https://book.douban.com/subject/23123255/)：CSS 入门
- [**《深入解析 CSS》**](https://book.douban.com/subject/35021471/)：重点书籍，新近较好的 CSS 基础与进阶书籍，有大量工作细节补充
- [**《CSS 揭秘》**](https://book.douban.com/subject/26745943/)：重点书籍，CSS 书籍瑰宝！！！
- [《CSS 权威指南（第四版）》](https://book.douban.com/subject/33398314/)：经典书籍，可以作为 CSS 字典查阅
- [《精通 CSS》第 3 版](https://book.douban.com/subject/30450258/)：内容与《深入解析 CSS》重合
- [《CSS 实战手册》第四版](https://book.douban.com/subject/26898555/)：内容与《深入解析 CSS》重合
- [《CSS3 艺术》](https://book.douban.com/subject/34932891/)：提供大量 CSS3 的示例与优化技巧

其他优秀书籍：

```txt
0 基础入门类书籍：
《HTML & CSS 设计与构建网站》
《Head First HTML 与 CSS》第 2 版
《HTML5 与 CSS3 基础教程》第 8 版

CSS 提升类书籍：
《CSS 禅意花园》：不推荐，内容偏设计，非程序员读物，且时代较为久远
《CSS 世界》：可阅读，深入 CSS 的一本书，但是作者行文风格较为特殊
《CSS 选择器世界》：可阅读，内容较好，但是作者行文风格较为特殊
```

### 2.2 JavaScript 基础

JavaScript 语法基础：

- [**《JavaScript 高级程序设计》第 4 版**](https://book.douban.com/subject/35175321/)：红宝书，最好的 JS 入门、提升书籍之一
- [**《JavaScript 语言精髓与编程实践》第 3 版**](https://book.douban.com/subject/35085910/)：国内非常深入优秀的 JS 书籍
- [《JavaScript 权威指南》第 7 版](https://book.douban.com/subject/35396470/)：犀牛书，JS 的百科全书，与红宝书冲突过多
- [《深入理解 ECMAScript6》](https://book.douban.com/subject/27072230/)：ES6 书籍，偏基础
- [《JavaScript 面向对象编程指南》（第 3 版）](https://book.douban.com/subject/35692269/)：部分内容被红宝书覆盖，后半部分的设计模式等内容可以看其他书籍

其他优秀基础书籍：

```txt
JavaScript 语言学习：
《Head First JavaScript 程序设计》：零基础入门书籍
《JavaScript 编程精解 第 3 版》：佳作《Eloquent JavaScript》，深入浅出，整体偏基础，翻译不佳。
《JavaScript 语言精粹》修订版：即蝴蝶书，短小精悍，附录中对 JS 语言糟粕的汇总值得一看！但大多问题已被 ES6 相关书籍总结
《JavaScript 编程全解》-井上诚一郎：内容全面详细，但是被《红宝书》完全替代
```

### 2.3 DOM 编程

大多 DOM 相关书籍内容都被 JS 基础书涵盖了，有编程基础可以忽略本节书籍。

```txt
《JavaScript DOM 编程艺术》第 2 版：内容极简，适合零基础入门
《HTML5 秘籍（第 2 版）》：内容较好，推荐学习
《HTML5 权威指南》：与《HTML5 秘籍》冲突
《锋利的 jQuery》第 2 版：适合初学 jQuery 时一看
《JavaScript&jQuery 交互式 Web 前端开发》：适合学习使用 jQuery 制作优秀的交互式网站
```

### 2.4 JavaScript 进阶

- [**《你不知道 JavaScript》上卷 + 中卷**](https://book.douban.com/subject/26351021/)：笔者认为目前最好的 JS 深入书籍之一
- [**《JavaScript 忍者秘籍》第 2 版**](https://book.douban.com/subject/30143702/)：对函数的讲解：闭包、重载、柯里化化讲解极好
- [**《Effective JavaScript》**](https://book.douban.com/subject/25786138/)：
- [**《ECMAScript6 入门》第 3 版**](https://book.douban.com/subject/27127030/)：ES6 书籍，偏全面
- [《JavaScript 函数式编程思想》](https://book.douban.com/subject/30449514/)
- [《JavaScript ES8 函数式编程实践入门 (第 2 版)》](https://book.douban.com/subject/35791367/)
- [《JavaScript 函数式编程指南》](https://book.douban.com/subject/30283769/)
- [《JavaScript 函数式编程指北-Franklin Risby》](https://llh911001.gitbooks.io/mostly-adequate-guide-chinese/content/)

其他：

```txt
深入理解 JAVASCRIPT 特性
```

### 2.5 TypeScript

- [《TypeScript 编程》](https://book.douban.com/subject/35134660/)：TS 语法基础
- [**《Effective TypeScript》**](https://book.douban.com/subject/35689352/)：TS 使用中的一些实践技巧

```txt
《编程与类型系统》：笔者认为有上述2本书的情况下TS的学习、实践已经足够了
```

### 2.6 Node.js

- [overnote 笔记](https://github.com/overnote/over-javascript/tree/master/04-NodeJS)：市面上的入门书籍太过时，还是直接看本笔记吧 o(╯□╰)o
- [**《Node.js 设计模式》第 3 版**](https://book.douban.com/subject/35608760/)：质内容上乘，推荐看英文原版
- [《深入浅出 Node.js》](https://book.douban.com/subject/25768396/)：Node 书籍的集大成者，部分内容已过时，但仍然值得精读
- [《Node.js:来一打 C++扩展》](https://book.douban.com/subject/30247892/)：适合学习开发扩展使用

### 2.8 前端框架

Vue：

- [**《Vue.js 设计与实现》**](https://book.douban.com/subject/35768338/)：目前非常好的 vue 原理书籍
- [《深入浅出 Vue.js》](https://book.douban.com/subject/32581281/)：vue 一些原理分析

React：

- [**《React 设计原理》**](https://book.douban.com/subject/36171032/)
- [**《React Hooks 实战》**](https://book.douban.com/subject/36077233/)
- [《深入 React 技术栈》](https://book.douban.com/subject/26918038/)：知识内容版本较老
- [《深入浅出 React 和 Redux》](https://book.douban.com/subject/27033213/)：知识内容版本较老
- [《React 状态管理与同构实战》](https://book.douban.com/subject/30290509/)：知识内容版本较老

其他：

- [《jQuery 技术内幕》](https://book.douban.com/subject/25823709/)
- [《Webpack+Babel 入门与实例详解》](https://book.douban.com/subject/35721564/)
- [《Webpack 实战：入门、进阶与调优》第 2 版](https://book.douban.com/subject/35818947/)：能看的 webpack 书籍

### 2.9 前端综合

- [《现代前端技术解析》](https://book.douban.com/subject/27021790/)：前端目前技术趋势的汇总，适合茶余饭后简单阅读。
- [《高效前端：Web 高效编程与优化实践》](https://book.douban.com/subject/30170670/)
- [《了不起的 JavaScript 工程师：从前端到全端高级进阶》](https://book.douban.com/subject/34788884/)
- [《高性能 JavaScript》](https://book.douban.com/subject/5362856/)
- [《Web 性能权威指南》](https://book.douban.com/subject/25856314/)
- [《JavaScript 设计模式与开发实践》](https://book.douban.com/subject/26382780/)
- [《JavaScript 模式》](https://book.douban.com/subject/11506062/)

其他优秀书籍：

```txt
《编写可维护的 JavaScript》：不推荐，现在 ESLint 等工具已经成熟。
```

### 2.10 桌面开发

- [《Electron 实战：入门、进阶与性能优化》刘晓伦](https://book.douban.com/subject/35069275/)
- [《深入浅出 Electron：原理、工程与实践》刘晓伦](https://book.douban.com/subject/35693818/)

其他书籍如：《Electron 跨平台开发实战》等过老。

### 2.11 图形学、canvas 等

- [《HTML5+JavaScript 动画基础》](https://book.douban.com/subject/24744218/)：目前最好的动画书籍
- [《HTML5 Canvas 核心技术》](https://book.douban.com/subject/24533314/)：目前最好的 canvas 书籍
- [《TypeScript 图形渲染实战：2D 架构设计与实现》](https://book.douban.com/subject/31365348/)：编排较乱，但仍有值得看的地方
- [《WebGL 编程指南》](https://book.douban.com/subject/25909351/)：webgl 使用手册，目前可以额外关注 webgpu
- [《Three.js 开发指南》](https://book.douban.com/subject/34451906/)：threejs 的编程手册

### 2.12 待读

```txt
Webpack+Babel入门与实例详解
Web 性能实战
前端自动化测试框架 ——Cypress 从入门到精通
Vue.js 技术内幕
Web 前端开发 Debug 技巧
轻松学会 JavaScript
图解算法：使用JavaScript
图解数据结构 使用JavaScript
前端性能揭秘
前端开发必知必会：从工程核心到前沿实战
微前端设计与实现
微前端实战
前端跨界开发指南
前端架构师：基础建设与架构设计思想
前端开发核心知识进阶：从夯实基础到突破瓶颈
现代JavaScript库开发 原理、技术与实战
```

## 附

**OverNote**地址：<https://github.com/overnote>  
**笔者的地址**：<https://github.com/ruyuejun>

**OverNote 分类**：

- [Golang](https://github.com/overnote/over-golang)：详尽的 Go 领域笔记：Go 语法、Go 并发编程、GoWeb 编程、Go 微服务等
- [大前端](https://github.com/overnote/over-javascript)：包含 JavaScript、Node.js、vue/react、微信开发、Flutter 等大前端技术
- [数据结构与算法](https://github.com/overnote/over-algorithm)：以 C/Go 实现为主记录数据结构与算法的笔记
- [服务端架构](https://github.com/overnote/over-server)：分布式与微服务笔记，附 Nginx、Mysql、Redis 等常用服务端技术
- [Python 与机器学习](https://github.com/overnote/over-python)：Python 相关笔记，完善中
- [cs](https://github.com/overnote/over-cs)：计算机组成原理、操作系统、计算机网络、编译原理基础学科笔记
- [大数据](https://github.com/overnote/over-bigdata)：大数据笔记，完善中
- [Flutter](https://github.com/overnote/over-flutter)：完善中
