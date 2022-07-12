# 13.4-Nestjs-功能扩展

## 一 序列化

在 entity 中，有时候有些字段不一定要返还给前端，通常我们需要自己做一次筛选，而 Nestjs 中，配合 <https://github.com/typestack/class-transformer>，可以很方便的实现这个功能。

例如，我们有个 entity 的基类 common.entity.ts，返还数据的时候，我们不希望把 create_at 和 update_at 也带上，这时候就可以使用 @Exclude() 排除 CommonEntity 中的这两个字段：

```ts
import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Exclude } from 'class-transformer'

export class CommonEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Exclude()
  @CreateDateColumn({
    comment: '创建时间',
  })
  create_at: number

  @Exclude()
  @UpdateDateColumn({
    comment: '更新时间',
  })
  update_at: number
}
```

在对应请求的地方标记使用 ClassSerializerInterceptor，此时，GET /api/v1/cats/1 这个请求返回的数据中，就不会包含 create_at 和 update_at 这两个字段。

```ts
@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  findOne(@Param('id') id: string): Promise<Array<Partial<CatEntity>>> {
    return this.catsService.getCat(id)
  }
}
```

如果某个 controller 中都需要使用 ClassSerializerInterceptor 来帮我们做一些序列化的工作，可以把 Interceptor 提升到整个 controller：

```ts
@UseInterceptors(ClassSerializerInterceptor)
@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Array<Partial<CatEntity>>> {
    return this.catsService.getCat(id)
  }

  @Post()
  create(@Body() createCatDto: CreateCatDto): Promise<void> {
    return this.catsService.createCat(createCatDto)
  }
}
```

甚至可以在 main.ts 中把它作为全局的 Interceptor，不过这样不方便进行细粒度地控制。

```ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.setGlobalPrefix('api/v1')

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))

  await app.listen(config.port, config.hostName, () => {
    Logger.log(
      `Awesome-nest API server has been started on http://${config.hostName}:${config.port}`
    )
  })
}

bootstrap()
```

在某些场景下，我们需要对 entity 中某个字段处理后再返回，可以使用 @Transform()：

```ts
@Entity('dog')
export class DogEntity extends CommonEntity {
  @Column({ length: 50 })
  @Transform((value) => `dog: ${value}`)
  name: string

  @Column()
  age: number

  @Column({ length: 100, nullable: true })
  breed: string
}
```

此时，name 字段经过 @Transform 的包装就会变成 dog: name 的格式。如果我们需要根据已有字段构造一个新的字段，可以使用 @Expose()：

```ts
@Entity('dog')
export class DogEntity extends CommonEntity {
  @Column({ length: 50 })
  @Transform((value) => `dog: ${value}`)
  name: string

  @Column()
  age: number

  @Column({ length: 100, nullable: true })
  breed: string

  @Expose()
  get isOld(): boolean {
    return this.age > 10
  }
}
```

上面代码会根据查询到的 age 字段动态计算 isOld 的值，此时通过 GET 方法请求返回的结果如下：

```json
{
  "data": [
    {
      "id": "15149ec5-cddf-4981-89a0-62215b30ab81",
      "name": "dog: nana",
      "age": 12,
      "breed": "corgi",
      "isOld": true
    }
  ],
  "status": 0,
  "message": "请求成功"
}
```

## 二 认证

在这个应用内，现在对用户还没有进行认证，通过用户认证可以判断该访问角色的合法性和权限。通常认证要么基于 Session，要么基于 Token。这里就以基于 Token 的 JWT（JSON Web Token）方式进行用户认证。

创建 jwt.strategy.ts，用来验证 token，当 token 有效时，允许进一步处理请求，否则返回 401(Unanthorized)：

```ts
// npm install --save @nestjs/passport passport @nestjs/jwt passport-jwt

import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import config from '../../config'
import { UserEntity } from '../entities/user.entity'
import { AuthService } from './auth.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.jwt.secret,
    })
  }
  async validate(payload: UserEntity) {
    const user = await this.authService.validateUser(payload)
    if (!user) {
      throw new UnauthorizedException('身份验证失败')
    }
    return user
  }
}
```

然后创建 auth.service.ts，上面的 jwt.strategy.ts 会使用这个服务校验 token，并且提供了创建 token 的方法：

```ts
import { JwtService } from '@nestjs/jwt'
import { Injectable } from '@nestjs/common'
import { UserEntity } from '../entities/user.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Token } from './auth.interface'
import config from '../../config'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService
  ) {}
  createToken(email: string): Token {
    const accessToken = this.jwtService.sign({ email })
    return {
      expires_in: config.jwt.signOptions.expiresIn,
      access_token: accessToken,
    }
  }

  async validateUser(payload: UserEntity): Promise<any> {
    return await this.userRepository.find({ email: payload.email })
  }
}
```

这两个文件都会作为服务在对应的 module 中注册，并且引入 PassportModule 和 JwtModule：

```ts
import { Module } from '@nestjs/common'
import { AuthService } from './auth/auth.service'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { JwtStrategy } from './auth/jwt.strategy'
import config from '../config'

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register(config.jwt),
  ],
  providers: [AuthService, JwtStrategy],
  exports: [],
})
export class FeaturesModule {}
```

这时候，就可以使用 @UseGuards(AuthGuard()) 来对需要认证的 API 进行身份校验：

```ts
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'

import { CatsService } from './cats.service'
import { CreateCatDto } from './cat.dto'
import { CatEntity } from '../entities/cat.entity'
import { AuthGuard } from '@nestjs/passport'

@Controller('cats')
@UseGuards(AuthGuard())
export class CatsController {
  constructor(private readonly catsService: CatsService) {}
  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  findOne(@Param('id') id: string): Promise<Array<Partial<CatEntity>>> {
    return this.catsService.getCat(id)
  }

  @Post()
  create(@Body() createCatDto: CreateCatDto): Promise<void> {
    return this.catsService.createCat(createCatDto)
  }
}
```

通过 Postman 模拟请求时，如果没有带上 token，就会返回下面结果：

```json
{
  "message": {
    "statusCode": 401,
    "error": "Unauthorized"
  },
  "status": 1
}
```

## 三 安全

Web 安全中，常见有两种攻击方式：XSS（跨站脚本攻击）和 CSRF（跨站点请求伪造）。

对 JWT 的认证方式，因为没有 cookie，所以也就不存在 CSRF。如果你不是用的 JWT 认证方式，可以使用 csurf 这个库去解决这个安全问题。

对于 XSS，可以使用 helmet 去做安全防范。helmet 中有 12 个中间件，它们会设置一些安全相关的 HTTP 头。比如 xssFilter 就是用来做一些 XSS 相关的保护。

对于单 IP 大量请求的暴力攻击，可以用 <https://github.com/nfriedly/express-rate-limit> 来进行限速。

对于常见的跨域问题，Nestjs 提供了两种方式解决，一种通过 app.enableCors() 的方式启用跨域，另一种像下面一样，在 Nest 选项对象中启用。

最后，所有这些设置都是作为全局的中间件启用，最后 main.ts 中，和安全相关的设置如下：

```ts
import * as helmet from 'helmet'
import * as rateLimit from 'express-rate-limit'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true })

  app.use(helmet())
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    })
  )

  await app.listen(config.port, config.hostName, () => {
    Logger.log(
      `Awesome-nest API server has been started on http://${config.hostName}:${config.port}`
    )
  })
}
```

## 四 http 请求

Nestjs 中对 Axios 进行了封装，并把它作为 HttpService 内置到 HttpModule 中。HttpService 返回的类型和 Angular 的 HttpClient Module 一样，都是 observables，所以可以使用 rxjs 中的操作符处理各种异步操作。

首先，我们需要导入 HttpModule：

```ts
import { Global, HttpModule, Module } from '@nestjs/common'

import { LunarCalendarService } from './services/lunar-calendar/lunar-calendar.service'

@Global()
@Module({
  imports: [HttpModule],
  providers: [LunarCalendarService],
  exports: [HttpModule, LunarCalendarService],
})
export class SharedModule {}
```

这里我们把 HttpModule 作为全局模块，在 sharedModule 中导入并导出以便其他模块使用。这时候我们就可以使用 HttpService，比如我们在 LunarCalendarService 中注入 HttpService，然后调用其 get 方法请求当日的农历信息。这时候 get 返回的是 Observable。

对于这个 Observable 流，可以通过 pipe 进行一系列的操作，比如我们直接可以使用 rxjs 的 map 操作符帮助我们对数据进行一层筛选，并且超过 5s 后就会报 timeout 错误，catchError 会帮我们捕获所有的错误，返回的值通过 of 操作符转换为 observable：

```ts
import { HttpService, Injectable } from '@nestjs/common'
import { of, Observable } from 'rxjs'
import { catchError, map, timeout } from 'rxjs/operators'

@Injectable()
export class LunarCalendarService {
  constructor(private readonly httpService: HttpService) {}

  getLunarCalendar(): Observable<any> {
    return this.httpService
      .get('https://www.sojson.com/open/api/lunar/json.shtml')
      .pipe(
        map((res) => res.data.data),
        timeout(5000),
        catchError((error) => of(`Bad Promise: ${error}`))
      )
  }
}
```

如果需要对 axios 进行配置，可以直接在 Module 注册的时候设置：

```ts
import { Global, HttpModule, Module } from '@nestjs/common'

import { LunarCalendarService } from './services/lunar-calendar/lunar-calendar.service'

@Global()
@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  providers: [LunarCalendarService],
  exports: [HttpModule, LunarCalendarService],
})
export class SharedModule {}
```

## 热重载

在开发的时候，运行 npm run start:dev 的时候，是进行全量编译，如果项目比较大，全量编译耗时会比较长，这时候我们可以利用 webpack 来帮我们做增量编译，这样会大大增加开发效率。

在根目录下创建一个 webpack.config.js：

```ts
// npm i --save-dev webpack webpack-cli webpack-node-externals ts-loader
const webpack = require('webpack')
const path = require('path')
const nodeExternals = require('webpack-node-externals')

module.exports = {
  entry: ['webpack/hot/poll?100', './src/main.ts'],
  watch: true,
  target: 'node',
  externals: [
    nodeExternals({
      whitelist: ['webpack/hot/poll?100'],
    }),
  ],
  module: {
    rules: [
      {
        test: /.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  mode: 'development',
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'server.js',
  },
}
```

在 main.ts 中启用 HMR：

```ts
declare const module: any

async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule)
  await app.listen(3000)

  if (module.hot) {
    module.hot.accept()
    module.hot.dispose(() => app.close())
  }
}
bootstrap()
```

在 package.json 中增加下面两个命令：

```ts
{
  "scripts": {
    "start": "node dist/server",
    "webpack": "webpack --config webpack.config.js"
  }
}
```

运行 npm run webpack 之后，webpack 开始监视文件，然后在另一个命令行窗口中运行 npm start。
