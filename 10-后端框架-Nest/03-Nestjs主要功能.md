# 13.2-Nestjs-主要功能

## 一 主要功能功能

### 中间件 Middlewares

Nest 的中间件与 express 的中间件是保持一致的，可以直接使用 express 的中间件：

```js
import * as helmet from 'helmet'

async function bootstrap() {
  const app =
    (await NestFactory.create) <
    NestExpressApplication >
    (AppModule,
    {
      cors: true,
      logger: false,
    })

  app.use(helmet())

  await app.listen(config.port, config.hostName, () => {
    Logger.log(
      `Flash API server has been started on http://${config.hostName}:${config.port}`
    )
  })
}
```

## 守卫 Guards

Guards 和前端路由中的路由守卫一样，主要确定请求是否应该由路由处理程序处理。通过守卫可以知道将要执行的上下文信息，所以和 middleware 相比，守卫可以确切知道将要执行什么。守卫在每个中间件之后执行的，但在拦截器和管道之前。

```ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Observable } from 'rxjs'

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest()
    return validateRequest(request) // validateRequest 函数实现 Request 的验证
  }
}
```

### 拦截器 Interceptors

Interceptors 可以给每一个需要执行的函数绑定，拦截器将在该函数执行前或者执行后运行。可以转换函数执行后返回的结果，扩展基本函数行为等。

```ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { getFormatResponse } from '../../shared/utils/response'

export interface Response<T> {
  data: T
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<Response<T>> {
    return next.handle().pipe(map(getFormatResponse))
  }
}
```

### 管道 Pipe

Pipe 是具有 @Injectable() 装饰器的类，并实现了 PipeTransform 接口。通常 pipe 用来将输入数据转换为所需的输出或者处理验证。

下面就是一个 ValidationPipe，配合 class-validator 和 class-transformer，可以更方便地对参数进行校验。

```ts
import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
  Injectable,
} from '@nestjs/common'
import { validate } from 'class-validator'
import { plainToClass } from 'class-transformer'

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value, metadata: ArgumentMetadata) {
    const { metatype } = metadata
    if (!metatype || !this.toValidate(metatype)) {
      return value
    }
    const object = plainToClass(metatype, value)
    const errors = await validate(object)
    if (errors.length > 0) {
      throw new BadRequestException('Validation failed')
    }
    return value
  }

  private toValidate(metatype): boolean {
    const types = [String, Boolean, Number, Array, Object]
    return !types.find((type) => metatype === type)
  }
}
```

### 异常 Exceptor

内置的 Exception filters 负责处理整个应用程序中的所有抛出的异常，也是 Nestjs 中在 response 前，最后能捕获异常的机会。

```ts
import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common'

@Catch()
export class AnyExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()

    response.status(status).json({
      statusCode: exception.getStatus(),
      timestamp: new Date().toISOString(),
      path: request.url,
    })
  }
}
```

### 数据转模型 DTO

数据访问对象简称 DTO（Data Transfer Object），是一组需要跨进程或网络边界传输的聚合数据的简单容器。它不应该包含业务逻辑，并将其行为限制为诸如内部一致性检查和基本验证之类的活动。

在 Nestjs 中，可以使用 TypeScript 接口或简单的类来完成。配合 class-validator 和 class-transformer 可以很方便地验证前端传过来的参数：

```ts
import { IsString, IsInt, MinLength, MaxLength } from 'class-validator'
import { ApiModelProperty } from '@nestjs/swagger'

export class CreateCatDto {
  @ApiModelProperty()
  @IsString()
  @MinLength(10, {
    message: 'Name is too short',
  })
  @MaxLength(50, {
    message: 'Name is too long',
  })
  readonly name: string

  @ApiModelProperty()
  @IsInt()
  readonly age: number
  @ApiModelProperty()
  @IsString()
  readonly breed: string
}

import { Controller, Post, Body } from '@nestjs/common'
import { CreateCatDto } from './dto'

@Controller('cats')
export class CatsController {
  @Post()
  create(@Body() createCatDto: CreateCatDto) {
    return 'This action adds a new cat'
  }
}
```

在 Nestjs 中，DTO 主要定义如何通过网络发送数据的对象，通常会配合 class-validator 和 class-transformer 做校验。

```ts
import { IsString, IsInt } from 'class-validator'

export class CreateCatDto {
  @IsString()
  readonly name: string

  @IsInt()
  readonly age: number

  @IsString()
  readonly breed: string
}
import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common'
import { CreateCatDto } from './dto'

@Controller('cats')
export class CatsController {
  @Post()
  create(@Body() createCatDto: CreateCatDto) {
    return 'This action adds a new cat'
  }
}
```

上面对请求 body 定义了一个 DTO，并且在 DTO 中对参数类型进行了限制，如果 body 中传过来的类型不符合要求，会直接报错。

DTO 中的 class-validator 还需要配合 pipe 才能完成校验功能：

```ts
import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
  Injectable,
} from '@nestjs/common'
import { validate } from 'class-validator'
import { plainToClass } from 'class-transformer'
import * as _ from 'lodash'

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value, metadata: ArgumentMetadata) {
    const { metatype } = metadata
    if (!metatype || !this.toValidate(metatype)) {
      return value
    }
    const object = plainToClass(metatype, value)
    const errors = await validate(object)
    if (errors.length > 0) {
      const errorMessage = _.values(errors[0].constraints)[0]
      throw new BadRequestException(errorMessage)
    }
    return value
  }
  private toValidate(metatype): boolean {
    const types = [String, Boolean, Number, Array, Object]
    return !types.find((type) => metatype === type)
  }
}
```

这个 pipe 会根据元数据和对象实例，去构建原有类型，然后通过 validate 去校验。

这个 pipe 一般会作为全局的 pipe 去使用：

```ts
async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule)
  app.setGlobalPrefix('api/v1')

  app.useGlobalPipes(new ValidationPipe())

  await app.listen(3000)
}
bootstrap()
```

假设我们没有这层 pipe，那在 controller 中就会进行参数校验，这样就会打破单一职责的原则。有了这一层 pipe 帮助我们校验参数，有效地降低了类的复杂度，提高了可读性和可维护性。

### Interceptor 和 Exception Filter

可以利用 AOP 的思想可以对返回值进行设计。

首先，我们需要全局捕获错误的切片层去处理所有的 exception；其次，如果是一个成功的请求，需要把这个返回结果通过一个切片层包装一下。

在 Nestjs 中，返回请求结果时，Interceptor 会在 Exception Filter 之前触发，所以 Exception Filter 会是最后捕获 exception 的机会。我们把它作为处理全局错误的切片层。

```ts
import {
  Catch,
  ArgumentsHost,
  HttpException,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common'

@Catch()
export class ExceptionsFilter implements ExceptionFilter {
  async catch(exception, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()

    let message = exception.message
    let isDeepestMessage = false
    while (!isDeepestMessage) {
      isDeepestMessage = !message.message
      message = isDeepestMessage ? message : message.message
    }
    const errorResponse = {
      message: message || '请求失败',
      status: 1,
    }

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR

    response.status(status)
    response.header('Content-Type', 'application/json; charset=utf-8')
    response.send(errorResponse)
  }
}
```

而 Interceptor 则负责对成功请求结果进行包装：

```ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

interface Response<T> {
  data: T
}
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((rawData) => {
        return {
          data: rawData,
          status: 0,
          message: '请求成功',
        }
      })
    )
  }
}
```

同样 Interceptor 和 Exception Filter 需要把它定义在全局范围内：

```ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.setGlobalPrefix('api/v1')

  app.useGlobalFilters(new ExceptionsFilter())
  app.useGlobalInterceptors(new TransformInterceptor())
  app.useGlobalPipes(new ValidationPipe())

  await app.listen(3000)
}
```
