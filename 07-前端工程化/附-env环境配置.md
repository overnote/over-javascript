# 附-env 环境配置

## 一 环境区分

通常情况下，我们需要针对不同环境（开发环境、集成环境、生产环境等），进行相应策略的打包（比如是否替换接口地址，代码是否压缩等）。

我们有多种做法：

- 新建 config.js 文件：在该文件内配置不同的域名、端口等。但是每次切换环境都要修改 config.js 中环境判断
- 在 package.json 的启动脚本中添加环境变量，适合少量配置
- 使用 .env 文件：适合书写大量配置

## 二 package.json 启动脚本

Node 提供了一个专门的 API `process.env` 来获取环境变量配置。

通常的做法是新建一个环境变量 `NODE_ENV`，设置其值为 `development` 代表开发环境，设置其值为 `production` 代表生产环境，当我们在开发中需要该环境变量便可通过 `process.env.NODE_ENV` 获取。

可以直接在 shell 环境内设置该环境，但是通常我们不这样做，可以在 Node 项目的 package.json 中直接设置，如下所示：

```json
// Win系统
{
  "scripts": {
    "dev": "set NODE_ENV=development && webpack-dev-server --open --hot",
    "build": "set NODE_ENV=production && --progress --hide-modules"
  }
}

// Mac系统
{
  "scripts": {
    "dev": "export NODE_ENV=development && webpack-dev-server --open --hot",
    "build": "export NODE_ENV=production && --progress --hide-modules"
  }
}
```

为了解决操作系统的差异，可以使用 cross-env 包：

```json
// 安装：npm i -D cross-env
{
  "scripts": {
    "dev": "cross-env NODE_ENV=development webpack-dev-server --open --hot",
    "build": "cross-env NODE_ENV=production webpack --mode=production  --progress --hide-modules"
  }
}
```

## 三 .env 文件

### 3.1 env 文件概念

.env 文件中可以书写大量的配置，一般可以使用三个文件分别代表不同环境的配置：

- .env：全局默认配置文件，不论什么环境都会加载合并该文件内容
- .env.development：开发环境下的配置文件
- .env.production：生产环境下的配置文件

在使用启动脚本执行时，会依据脚本中的 `mode` 变量自动加载哪个配置，比如 `npm run dev --mode=development` 启动本地开发环境，会自动加载 `.env.development`内的配置，代码中通过 `process.env` 获取。

.env 配置示例：

```txt
VUE_APP_URL='localhost:3000'
```

注意：如果 env 内配置了密码等信息，无比在 gitignore 文件中忽略掉

### 3.2 .env 文件优先级

.env.development / .env.production 中的配置如果与 .env 配置冲突，则会替换掉 .env 中的配置，如下所示：

```txt
.env：默认。
.env.local：本地覆盖。除 test 之外的所有环境都加载此文件。
.env.development, .env.test, .env.production：设置特定环境。
.env.development.local, .env.test.local, .env.production.local：设置特定环境的本地覆盖。
```

左侧的文件比右侧的文件具有更高的优先级：

```txt
npm start: .env.development.local, .env.development, .env.local, .env
npm run build: .env.production.local, .env.production, .env.local, .env
npm test: .env.test.local, .env.test, .env (注意没有 .env.local )
```

## 四 脚手架项目传入启动参数

使用 vue-cli、create-react-app 等脚手架创建的项目，其启动脚本已经传递好了 mode 模式，无需配置，也会自动加载对应的 env 文件（所以 NODE_ENV 是无法配置的）！且必须使用 VUE_APP/REACT_APP 这样开头进行配置。如果此时我们仍然想传递一些启动参数，比如添加一个 DATA_FROM 参数，可以这样设计启动脚本：

```json
// npm i cross-env -D
{
  "scripts": {
    "dev": "node_modules/.bin/cross-env REACT_APP_DATA_FROM=local react-scripts start",
    "start": "react-scripts start",
    "build": "react-scripts build"
  }
}
```

当然笔者推荐使用 dotenv 包，可以自定义环境，使用对应的 env 文件，比如现在我们想创建一个 mine 环境，这个环境下使用 mock 数据，那么配置启动方式如下：

```json
// npm install -D dotenv-cli
{
  "scripts": {
    "dev": "dotenv -e .env.mine react-scripts start",
    "start": "react-scripts start",
    "build": "react-scripts build"
  }
}
```
