# Koa2框架从0开始构建预告片网站

[TOC]

## 第1章 2018 年的编程姿势

### 1-3 毫不犹豫的使用promise

* `https://www.promisejs.org/`
* promise不是简单的语法糖，而是一个设计规范，有着各种各样的库去实现这套规范，进而向我们提供Promise接口能力的函数。

## 第2章 必会 ES6-7 语法特性与规范

* 箭头函数：跟父作用域共享this

```js
// 箭头函数经典栗子
const jerry = {
    age: 18,
    say: function () {
        setTimeout(function () {
            console.log('age: ', this.age)
        }, 500)
    },
    sayWithThis: function () {
        let _this = this
        setTimeout(function () {
            console.log('_this age: ', _this.age)
        }, 1000)
    },
    sayWithArrow: function () {
        setTimeout(() => {
            console.log('arrow age: ', this.age)
        }, 1500)
    },
    sayWithGlobalArrow: () => {
        setTimeout(() => {
            console.log('global arrow age: ', this.age)
        }, 2000) // --> global arrow age:  undefined
    }
}
```

### 这些年JavaScript处理异步的几个阶段

第一阶段：`callback`

```js
function readFile (cb) {
  fs.readFile('../package.json', (err, data) => {
    if (err) return cb(err)

    cb(null, data)
  })
}

readFile((err, data) => {
  if (!err) {
    data = JSON.parse(data)

    console.log(data.name)
  }
})
```

第二阶段：`promise`

```js
function readFileAsync (path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })
}

readFileAsync('../package.json')
  .then(data => {
    data = JSON.parse(data)

    console.log(data.name)
  })
  .catch(err => {
    console.error(err)
  })
```

第三阶段：`co + Generator + Promisify`

```js
co(function *() {
  let data = yield util.promisify(fs.readFile)('../package.json')

  data = JSON.parse(data)

  console.log(data.name)
})
```

第四阶段：`async`

```js
const readAsync = util.promisify(fs.readFile)

async function init () {
  let data = await readAsync('../package.json')

  data = JSON.parse(data)

  console.log(data.name)
}

init()
```

一开始我没明白`co+generator+promise`是什么意思，后来发现原来co是把函数暂停了异步的结果，等到异步结果出来后再去执行后续的代码。

### babel环境配置与import、export、async和await

配置babel环境

* `npm i -D babel-cli babel-preset-env`
* add `.babelrc`

`ReferenceError: regeneratorRuntime is not defined` 重新配置babel

* `npm i -S babel-plugin-transform-runtime babel-runtime`
* 修改 `.babelrc`

## 第3章 层层学习 Koa 框架的 API

### Koa核心对象

```js
Koa           Epxress
======================
HTTP  接收  解析  响应
中间件      执行上下文

Application   Context
Request      Response
Middlewares
Session      Cookie
```

```js
const Koa = require('koa')
const app = new Koa()

app.use(async (ctx, next) => {
  ctx.body = 'Jerry Shi - ' + Date.now()
})

app.listen(4441)
```

* Koa和Epxress一样，是一个Web服务框架，能够接收接收、解析和响应HTTP请求。
* Koa的全链路组合以后就是一个应用服务对象，这个对象内部有application、context、request、response、middlewares等对象。
* 上述代码中 `async` 、 `ctx` 、 `next` 、整个`app.use`传入的function `ctx.body` 各是什么？

### Koa源码之 Application

```js
module.exports = class Application extends Emitter {
  constructor() {
    super();

    this.proxy = false;
    this.middleware = [];
    this.subdomainOffset = 2;
    this.env = process.env.NODE_ENV || 'development';
    this.context = Object.create(context);
    this.request = Object.create(request);
    this.response = Object.create(response);
  }

  listen(...args) {
    const server = http.createServer(this.callback());
    return server.listen(...args);
  }

  /**
   * Use the given middleware `fn`.
   *
   * Old-style middleware will be converted.
   *
   * @param {Function} fn
   * @return {Application} self
   * @api public
   */

  use(fn) {
    this.middleware.push(fn);
    return this;
  }

  /**
   * Return a request handler callback
   * for node's native http server.
   */

  callback() {
    const fn = compose(this.middleware);
    const handleRequest = (req, res) => {
      const ctx = this.createContext(req, res);
      return this.handleRequest(ctx, fn);
    };

    return handleRequest;
  }

  handleRequest(ctx, fnMiddleware) {
    const res = ctx.res;
    res.statusCode = 404;
    const onerror = err => ctx.onerror(err);
    const handleResponse = () => respond(ctx);
    onFinished(res, onerror);
    return fnMiddleware(ctx).then(handleResponse).catch(onerror);
  }

  createContext(req, res) {
    const context = Object.create(this.context);
    const request = context.request = Object.create(this.request);
    const response = context.response = Object.create(this.response);
    context.app = request.app = response.app = this;
    context.req = request.req = response.req = req;
    context.res = request.res = response.res = res;
    request.ctx = response.ctx = context;
    request.response = response;
    response.request = request;
    context.originalUrl = request.originalUrl = req.url;
    context.cookies = new Cookies(req, res, {
      keys: this.keys,
      secure: request.secure
    });
    request.ip = request.ips[0] || req.socket.remoteAddress || '';
    context.accept = request.accept = accepts(req);
    context.state = {};
    return context;
  }
};

function respond(ctx) {
  // allow bypassing koa
  if (false === ctx.respond) return;

  const res = ctx.res;
  if (!ctx.writable) return;

  let body = ctx.body;
  const code = ctx.status;

  // ignore body
  if (statuses.empty[code]) {
    // strip headers
    ctx.body = null;
    return res.end();
  }

  if ('HEAD' == ctx.method) {
    if (!res.headersSent && isJSON(body)) {
      ctx.length = Buffer.byteLength(JSON.stringify(body));
    }
    return res.end();
  }

  // status body
  if (null == body) {
    body = ctx.message || String(code);
    if (!res.headersSent) {
      ctx.type = 'text';
      ctx.length = Buffer.byteLength(body);
    }
    return res.end(body);
  }

  // responses
  if (Buffer.isBuffer(body)) return res.end(body);
  if ('string' == typeof body) return res.end(body);
  if (body instanceof Stream) return body.pipe(res);

  // body: json
  body = JSON.stringify(body);
  if (!res.headersSent) {
    ctx.length = Buffer.byteLength(body);
  }
  res.end(body);
}
```

* 当我们import一个`Koa`时，其实是暴露了一个`Application`类，它继承了`Emitter`，就以为这这个类可以直接为自定义事件注册回调函数，也可以触发一些事件，同时可以捕获到其它地方捕捉到的事件，那就意味着它有了“耳朵”和“手”，可以听到一些动静之后，做一些事件。
* Koa-Compose对应中间件的函数数组，Koa中的所有中间件都必须是中间件数组，数组中的每个值都必须是函数，这点需要注意。Koa-Compose实现的非常精妙，执行过程中的next都是在它里面传入后往下进行的整个流程的运转的，此源码应该读读。
* context 整个运行服务的上下文，context里不仅能访问到HTTP来源所携带的信息以及方法，也能访问到给用户返回数据的方法
* 读源码时，可以使用删减法来读，把非核心不重要的代码删除后再来整体阅读。看看它核心解决了什么问题，是怎么解决的
* `application.js` 提供一种能力：通过它所new的实例后，这个实例就能使用它的能力，它的能力包括传入中间件use、监听端口生成服务器实例，生成之后能够在nodejs里通过拿到进来的http请求，对这个请求逐层的过中间件数组，最后把过完之后的结果交给它内部的`handleRespose`来处理响应

### Koa源码之middlewares

```js
const mid1 = async (ctx, next) => {
  ctx.body = 'Hi'
  await next()
  ctx.body = ctx.body + ' There'
}

const mid2 = async (ctx, next) => {
  ctx.type = 'text/html; charset=utf-8'
  await next()
}

const mid3 = async (ctx, next) => {
  await next()
}

app.use(mid1)
app.use(mid2)
app.use(mid3)
```

* koa中间件可以不断堆到堆栈中，其实就是堆到数组中，执行时也是按照先进先执行的方式进行，只不过每个中间件里都允许具备时间旅行的能力，可以先做自己的一部分事情，再去其他中间件继续做事情，全部做好之后再回来把自己剩下的事做完。
* koa中间件为什么可以按use顺序依次执行？为什么中间件可以在依次执行的过程中暂停下来执行其他中间件完了以后又接着做？

### Koa-Compose的纯函数与尾递归

```js
module.exports = compose

function compose (middleware) {
  if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!')
  for (const fn of middleware) {
    if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
  }

  return function (context, next) {
    // last called middleware #
    let index = -1
    return dispatch(0)
    function dispatch (i) {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'))
      index = i
      let fn = middleware[i]
      if (i === middleware.length) fn = next
      if (!fn) return Promise.resolve()
      try {
        return Promise.resolve(fn(context, function next () {
          return dispatch(i + 1)
        }))
      }
    }
  }
}
```

Koa-Compose：

* next看作一个钩子或回调函数，可以串联到下一个中间件
* compose入参是一个纯函数
* compose真正返回的是一个 **promise**
* compose作用就是把一个个不相干的中间件给串在一起来组合函数，把这些函数串联起来执行，多个函数组合之后，前一个函数的输出结果就是后一个函数的输入参数。一旦第一个函数开始执行后，整个中间件的队列就像是多米诺骨牌一样，推到执行了。

Koa小节：

1. Koa中一切流程皆是中间件
2. 一个HTTP请求进入Koa后，都会流经过预先配置好的中间件数组
3. 在中间件执行策略中，是会通过Koa-Compose来把这些中间件组合在一起，一个接一个的把数组里面的函数依次执行，通过一个next钩子/回调函数，不断的将控制权/执行权进行往下传递。理解了Koa-Compose就是理解了Koa的洋葱模型
4. 每一个中间件都会拿到整个HTTP请求的Context，通过context可以访问打request和response对象，而且可以访问到上面的属性和方法
5. 贯穿中间件的请求上下文context、request、response三者互相引用，方便调用，request和response都是在node原生对象上扩展出来的

## 第4章 Koa2 与 Koa1 、Express 框架对比

### koa 与 express 选型

* Koa是基于新的语法特性实现了Promise链传递，错误处理更友好。同时Koa不管任何中间件，是非常干净的、裸的框架，需要什么就加什么，而且Koa对流的支持度也非常好，通过对上下文对象的交叉引用，让内部的流程、请求和响应都能串联的更加紧凑。如果Express是大而全，则Koa就是小而精，两者定位不同。而且Koa的扩张性很好，稍微组装几个中间件就可以与Express匹敌，代码质量也很高，设计理念先进，语法特性超前。
* 从框架内部实现的角度来看，Koa与Express的中间件加载和实现机制是截然不同的，这点区别会让项目所用的中间件会走向两种不同的方式。故epxress能搞定的，koa同样能搞定，express能让你爽的，koa就能让你更爽。

## 第5章 从 0 开发一个电影预告片网站

### 关于构建工具pracel解决的问题

![porject](http://cdn.jerryshi.com//blog/2018/koa-5-7-001.png)

* `npm i -S babel-preset-env babel-preset-stage-0 babel-preset-react`
* `npm i -S babel-plugin-transform-decorators-legacy babel-plugin-transform-class-properties`

Parcel打包配置流程

* html引入index.js脚本
* index.js中引入react和react-dom，写jsx
* 配置babel

```json
{
  "presets": [
    [
      "env",
      {
        "targets": {
          "node": "current"
        }
      }
    ],
    "stage-0",
    "react"
  ],
  "plugins": [
    [
      "transform-runtime",
      {
        "polyfill": false,
        "regenerator": true
      }
    ],
    "transform-decorators-legacy",
    "transform-class-properties"
  ]
}
```

* 配置npm脚本

```jsson
{
  "build": "rimraf parcel/dist && parcel build parcel/index.html --no-cache -d parcel/dist --public-url /dist/"
}
```

## 第6章 利用爬虫搞定网站基础数据

![flow](http://cdn.jerryshi.com//blog/2018/dynamic_flow.png)

### 利用puppeteer爬取和分析电影列表

    一个网站的价值其实是信息传递的价值，而信息的本质是数据。
    可用性对于前端是一个比较敏感的词，说白了可用性就可以稳定性。

因为Node.js天生就是单线程的，所以我们就在主线程跑一个比较重的服务的话，比如说起一个内置浏览器来跑脚本，那么就会增加服务器挂断的风险，所以为了不让服务器断掉，我们会在服务器的主进程里再跑一个若干个子进程来干那些脏活累活，那么就算子进程挂了，而主进程还健在。

### 同步和异步物理案例

    仅能简单对比，不是实际运行流畅。

故事铺垫：你和一个妹子合租一套两室一厅一卫的房子。

故事内容：某天早上你和妹子同时起床时，卫生间是闲置的，但两人都需要去洗漱，你要去洗澡，妹子要去刷牙，但只有一个卫生间，怎么办？

* 方式一：妹子先在卫生间刷牙，你在门口等着，一直等到妹子刷完牙以后你再去洗澡。 ———— 同步阻塞
* 方式二：妹子在卫生间刷牙，我去看了一下，有人在用，你就走开了，但你会每间隔一段时间来看看卫生间用完没，一直到某次我看到卫生间没人了，你就去洗澡。———— 同步非阻塞 (其中每次过来看用完的行为称之为轮询)
* 对于等待的行为，方式一为阻塞，方式二为非阻塞
* 方式三：你在门上装了一个红外感应设备，只要你来卫生间门口看到有人在用，你就按下红外设备开关表示有人占用，待妹子用完出来时红外设备会自动通知你可以洗澡了。 ———— 异步非阻塞 (从主动轮休到被动通知，我跑去查看的行为从同步变为异步，那我做事的状态就从阻塞变为非阻塞)
* 方式三种按下红外感应设备行为代表我注册了一个回调函数，卫生间通知到你就代表执行回调
* 同步异步是过程，在于有无消息通知的机制，调用方是主动等待还被动通知进度，阻塞非阻塞是状态，是调用方在获取结果的过程中是干等还是各不耽误。
* 异步阻塞的调用模型是节约调用方时间的，而异步非阻塞就是node.js特点。

## 第7章 彩蛋篇 - [高难度拔高干货] 深度理解 Node.js 异步 IO 模型

IO：数据的进出。人机交互时，我们会把鼠标键盘这些外设视为Input输入，对于主机上会有专门信号的输入(物理)接口，显示器作为一个可视化的外设，对主机上则有专门的输出接口，这个就是我们显示的IO接口。

而在操作系统层面，则有磁盘读写，DNS查询，数据库连接，网络接收处理请求返回等，在不同操作系统中其表现形式也不一样，有的是存异步非阻塞，有的则是同步阻塞的，无论怎么样我们可以把IO看作上层应用和下层系统之间的数据交互，上层依赖于下层，上层可以对这些能力进一步定制和改造，如果这个交互是异步非阻塞的，那么这种就是**“异步IO模型”**，如果是同步的阻塞的，那么就是“同步IO模型”。

在Node.js同提到异步IO，我们可以拿文件读写为例，Koa是一个用JavaScript写的上层Web服务框架，其与操作系统的沟通读写能力都是建立在Node.js整个的通信服务模型之上，Node.js提供的“fs”模块，模块中提供了文件读写接口readFile是异步接口，它就是典型的异步IO接口，反之readFileSync就是一个阻塞的同步的IO接口。以其类推，我们站在上层Web服务器层面就很容易理解Node.js的异步非阻塞模型。

## 第8章 实战篇 - 在 Koa 中向 MongoDB 建立数据模型

## 第9章 实战篇 - 为网站增加路由与控制器层对外提供 API 服务

### 9-1

这章我们专注于网站的核心业务，也就是网站的路由、数据的获取和数据的返回，即关于整个系统中后台的部分。那么对于一个后端服务来说，请求也就意味着HTTP请求接收和返回，处理接收和返回的能力在 `koa` 中主要借助于其上下文 `ctx` 以及众多的中间件完成，其中有处理会话的、有处理body解析的，还有处理路由的。

```bash
git checkout master -b daily-9-1
git add .
git commit -m ''
git push oirgin daily-9-1
```

### 9-2

```js
/// koa-router的几种应用方式
// 多个中间件
router.use(mid1()).use(mid2()).get('/movies', (ctx, next) => {
  const Category = mongoose.model('Category')
  ctx.category = await Category.find({}).exec()
  
  next()
}, async (ctx, next) => {
  const Movie = mongoose.model('Movie')
  const movies = await Movie.find({}).sort({
    'meta.createAt': -1
  })

  ctx.body = {
    movies
  }
})

// 加前缀
const router = new Router({
  prefix: '/movies'
})
```

### 9-3

```js
class Boy {
  @speak('云南话')
  run() {
    console.log('I can run!')
    console.log('I can speak ' + this.lang)
  }
}

function speak(lang) {
  return function (target, key, descriptor) {
    console.log(target)
    console.log(key)
    console.log(descriptor)
    target.lang = lang

    return descriptor
  }
}

const jerry = new Boy()

jerry.run()

/////////////////
// Boy {}
// run
// { value: [Function: run],
//   writable: true,
//   enumerable: false,
//   configurable: true }
// I can run!
// I can speak 云南话
```

## 第10章 实战篇 - 集成 AntDesign 与 Parcel 打通前后端与构建

### 10-1 配置babel postcss 支持parcel打包

新建.postcssrc
`yarn add postcss-modules autoprefixer`

```bash
{
  "modules": true,
  "plugins": {
    "autoprefixer": {
      "grid": true
    }
  }
}
```

## 第11章 实战篇 - 实现网站前端路由与页面功能

## 第12章 实战篇 - 实现后台登录权限与管理功能

## 第13章 服务器部署与发布

## 第14章 课程总结与展望
