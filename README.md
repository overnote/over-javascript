# README

## 一 关于本笔记

OverNote 系列笔记是我在平时一些学习时间阅读书籍博客、观看视频后整理出来的一套体系化笔记，着重将一个整套知识体系由浅入深的记录下来，并做**可持续的**扩展。许多内容仍然没有细化，笔误依然很多，敬请期待不断校正后的正式版。正式版会以类似 gitbook 的形式开放，便于阅读。

笔记的内容大多都来源于市面上常见的经典书籍，以及笔者自己平时的开发经验整理。

贴士 1：ES6 现在基本被各运行时接受，故 ES6 的内容已经完全被整合入对应章节，不再单独列出。如 let 声明已经并入了变量相关章节，class 并入了面向对象相关章节。

贴士 2：一些内容涉及了数学公式等，笔者使用了 KaTex/MathJax 代码，为了在浏览器上能正常显示，可以安装插件 [MathJax Plugin for Github](https://chrome.google.com/webstore/detail/mathjax-plugin-for-github/ioemnmodlmafdkllaclgeombjnmnbima)

## 二 笔记内容来源书籍整理

### 2.1 HTNL CSS

笔者推荐直接阅读新时期的一些必读著作：

- [**《深入解析 CSS》**](https://book.douban.com/subject/35021471/)：重点书籍，新近较好的 CSS 基础与进阶书籍
- [**《CSS 揭秘》**](https://book.douban.com/subject/26745943/)：重点书籍，CSS 书籍瑰宝！！！
- [**《CSS3 艺术 网页设计案例实战》**](https://book.douban.com/subject/34932891/)：CSS 进阶书籍，提供了大量 CSS3 的示例与优化技巧
- [《CSS 设计指南》](https://book.douban.com/subject/23123255/)：很基础的 CSS 入门书籍，讲解了 CSS 语法与常用案例如导航、下拉菜单等等
- [《CSS 权威指南（第四版）》](https://book.douban.com/subject/33398314/)：经典书籍，可以作为 CSS 字典查阅
- [《精通 CSS》第 3 版](https://book.douban.com/subject/30450258/)：内容与《深入解析 CSS》重合
- [《CSS 实战手册》第四版](https://book.douban.com/subject/26898555/)：内容与《深入解析 CSS》重合

其他优秀书籍：

```txt
零基础入门类书籍：
《Head First HTML 与 CSS》第 2 版
《HTML & CSS 设计与构建网站》
《HTML5 与 CSS3 基础教程》第 8 版

CSS 提升类书籍：
《CSS 禅意花园》：不推荐，内容偏设计，非程序员读物，且时代较为久远
《CSS 世界》：可阅读，深入 CSS 的一本书，但是作者行文风格较为奇特
《CSS 选择器世界》：可阅读，内容较好，但是作者行文风格较为特殊
```

### 2.2 JavaScript 基础篇

这一部分有太多好书了，笔者爱不释手，可以根据需要选择 3-4 本左右即可。

JavaScript 语法汇总类：

- [**《JavaScript 高级程序设计》** 第 4 版](https://book.douban.com/subject/35175321/)：红宝书，最好的 JS 入门、提升书籍之一
- [**《JavaScript 语言精髓与编程实践》** 第 3 版](https://book.douban.com/subject/35085910/)：国内出品非常优秀的 JS 书籍
- [**《JavaScript 权威指南》** 第 7 版](https://book.douban.com/subject/35396470/)：犀牛书，JS 的百科全书，与红宝书冲突过多
- [《JavaScript 编程全解》](https://book.douban.com/subject/25767719/)：内容全面，讲解的很细致优秀，但是内容与红宝书、犀牛书重复较多
- [《JavaScript 面向对象编程指南》（第 3 版）](https://book.douban.com/subject/35692269/)：名为讲解面向对象，实则补充了 JS 语法、设计模式、DOM 编程等部分，内容与红宝书、犀牛书重复较多

ES6 相关书籍：

- [**《ECMAScript6 入门》** 第 3 版](https://book.douban.com/subject/27127030/)：阮一峰的 ES6 作品，全面深入，也可以看 [网页版](https://es6.ruanyifeng.com/#docs/generator)
- [**《深入理解 ECMAScript6》**](https://book.douban.com/subject/27072230/)：ES6 书籍，偏基础

其他优秀基础书籍：

```txt
《Head First JavaScript 程序设计》：零基础入门书籍
《JavaScript 编程精解 第 3 版》：佳作《Eloquent JavaScript》中文版，深入浅出，建议看英文版。
```

### 2.3 Web 编程篇

大多 Web 相关书籍内容在 JavaScript 语法书中都有涉及，有网页开发经验的，笔者认为可以忽略本节书籍：

- [《HTML5 秘籍》第 2 版]()：内容比较系统的一本 Web 编程书籍
- [《锋利的 jQuery》](https://book.douban.com/subject/3794471/)第 2 版：罗列了 jQuery 的 API 使用示例，适合初学 jQuery 时看一看
- [《JavaScript&jQuery 交互式 Web 前端开发》](https://book.douban.com/subject/26433805/)：适合学习使用 jQuery 制作优秀的交互式网站

其他书籍：

```txt
《JavaScript DOM 编程艺术》：非常基础的一本DOM编程书籍，内容与《JavaScript&jQuery 交互式 Web 前端开发》类似
《HTML5 权威指南》：知识点全面，内容比较宽泛，可以作为手册
```

### 2.4 JavaScript 进阶篇

- [**《你不知道 JavaScript》** 上卷 + 中卷](https://book.douban.com/subject/26351021/)：笔者认为目前最好的 JS 深入书籍之一
- [**《JavaScript 忍者秘籍》** 第 2 版](https://book.douban.com/subject/30143702/)：对函数的讲解：闭包、重载、柯里化化讲解极好
- [**《Effective JavaScript》**](https://book.douban.com/subject/25786138/)：非常好的进阶书籍，不分内容过时
- [**《JavaScript 函数式编程指北-Franklin Risby》**](https://llh911001.gitbooks.io/mostly-adequate-guide-chinese/content/)：很好的函数式书籍，目前只有英文版
- [《深入理解 JAVASCRIPT 特性》](https://book.douban.com/subject/33441887/)：比较有深度
- [《JavaScript 函数式编程思想》](https://book.douban.com/subject/30449514/)
- [《JavaScript 函数式编程指南》](https://book.douban.com/subject/30283769/)

其他优秀书籍：

```txt

《JavaScript ES8 函数式编程实践入门 (第 2 版)》：内容较为基础
《JavaScript 语言精粹》修订版：即经典蝴蝶书，短小精悍，附录中对 JS 语言糟粕的汇总值得一看！但大多问题已被 ES6 相关书籍总结
```

### 2.5 TypeScript

- [**《TypeScript 编程》**](https://book.douban.com/subject/35134660/)：TS 语法基础，也拥有一些实用基础，类型进阶、错误处理、JS 互操作等章节的一些实践不错
- [**《Effective TypeScript》**](https://book.douban.com/subject/35689352/)：TS 使用中的一些实践技巧，建议英文版

```txt
《编程与类型系统》：笔者认为有上述2本书的情况下TS的学习、实践已经足够了
```

### 2.6 Node.js

- [overnote 笔记](https://github.com/overnote/over-javascript/tree/master/04-NodeJS)：Node 发展太快，市面上的入门书籍大多过时，还是直接看本笔记吧 o(╯□╰)o
- [**《Node.js 设计模式》** 第 3 版](https://book.douban.com/subject/35608760/)：质内容上乘，推荐看英文原版
- [**《深入浅出 Node.js》**](https://book.douban.com/subject/25768396/)：Node 书籍的集大成者，部分内容已过时，但仍然值得精读
- [《Node.js:来一打 C++扩展》](https://book.douban.com/subject/30247892/)：适合学习开发扩展使用

### 2.8 前端框架

Vue：

- [**《Vue.js 设计与实现》**](https://book.douban.com/subject/35768338/)：目前非常好的 vue 原理书籍
- [**《深入浅出 Vue.js》**](https://book.douban.com/subject/32581281/)：vue 一些原理分析
- [**《Vue.js 技术内幕》**](https://book.douban.com/subject/36092368/)

React：

- [**React 官方文档**](https://zh-hans.reactjs.org/docs/getting-started.html)：React 官方文档是目前比较新的、全面的文档，基础学习看这里即可
- [**《React 设计原理》**](https://book.douban.com/subject/36171032/)
- [《React Hooks 实战》](https://book.douban.com/subject/36077233/)
- [**《React 状态管理与同构实战》**](https://book.douban.com/subject/30290509/)

jQuery：

- [**《jQuery 技术内幕》**](https://book.douban.com/subject/25823709/)

Webpack：

- [**《Webpack+Babel 入门与实例详解》**](https://book.douban.com/subject/35721564/)

其他：

```txt
《深入 React 技术栈》：原理介绍较好，但是版本较老了
《深入浅出React和Redux》：适合学习react和redux，但是版本较老了
《Webpack 实战：入门、进阶与调优》第 2 版
```

### 2.9 前端综合

- [**《现代前端技术解析》**](https://book.douban.com/subject/27021790/)：前端目前技术趋势的汇总，适合茶余饭后简单阅读。
- [**《高效前端：Web 高效编程与优化实践》**](https://book.douban.com/subject/30170670/)
- [**《高性能 JavaScript》**](https://book.douban.com/subject/5362856/)
- [**《Web 性能权威指南》**](https://book.douban.com/subject/25856314/)
- [**《JavaScript 设计模式与开发实践》**](https://book.douban.com/subject/26382780/)
- [**《JavaScript 模式》**](https://book.douban.com/subject/11506062/)

其他优秀书籍：

```txt
《编写可维护的 JavaScript》：不推荐，现在 ESLint 等工具已经成熟。
```

### 2.10 桌面开发

- [**《Electron 实战：入门、进阶与性能优化》** 刘晓伦](https://book.douban.com/subject/35069275/)
- [**《深入浅出 Electron：原理、工程与实践》** 刘晓伦](https://book.douban.com/subject/35693818/)

其他书籍如：

```txt
《Electron 跨平台开发实战》：版本较老
```

### 2.11 Canvas

- [**《HTML5+JavaScript 动画基础》**](https://book.douban.com/subject/24744218/)：目前最好的动画书籍
- [**《HTML5 Canvas 核心技术》**](https://book.douban.com/subject/24533314/)：目前最好的 canvas 书籍
- [**《TypeScript 图形渲染实战：2D 架构设计与实现》**](https://book.douban.com/subject/31365348/)：编排较乱，但仍有值得看的地方

### 2.12 待读

```txt
Web 性能实战
Web 前端开发 Debug 技巧
前端性能揭秘
前端开发必知必会：从工程核心到前沿实战
微前端设计与实现
微前端实战
前端跨界开发指南
前端架构师：基础建设与架构设计思想
前端开发核心知识进阶：从夯实基础到突破瓶颈
现代JavaScript库开发 原理、技术与实战
前端自动化测试框架 ——Cypress 从入门到精通
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
