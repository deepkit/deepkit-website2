# Framework

Deepkit Framework is a highly modular, scalable, and fast TypeScript framework for building web applications, APIs, and microservices. 
It is designed to be as flexible as necessary and as structured as required, allowing developers to maintain high development speeds, both in the short term and the long term.

## Installation

Deepkit Framework is based on TypeScript and runtime types in Deepkit Type. Let's start by installing the required packages.

```sh
npm install typescript ts-node @deepkit/framework @deepkit/type @deepkit/http @deepkit/type-compiler
```

Next, we make sure Deepkit's type compiler is installed into the installed TypeScript package at `node_modules/typescript`:

```sh
./node_modules/.bin/deepkit-type-install
```

Make sure that all peer dependencies are installed. By default, NPM 7+ installs them automatically.

To compile your application, we need the TypeScript compiler and recommend `ts-node` to easily run the app.

An alternative to using `ts-node` is to compile the source code with the TypeScript compiler and execute the JavaScript source code directly. This has the advantage of dramatically increasing execution speed for short commands. However, it also creates additional workflow overhead by either manually running the compiler or setting up a watcher. For this reason, `ts-node` is used in all examples in this documentation.

## First application

Since the Deepkit framework does not use configuration files or a special folder structure, you can structure your project however you want. The only two files you need to get started are the TypeScript app.ts file and the TypeScript configuration tsconfig.json.

Our goal is to have the following files in our project folder:

```
.
├── app.ts
├── node_modules
├── package-lock.json
└── tsconfig.json
```

_File: tsconfig.json_

```json
{
  "compilerOptions": {
    "outDir": "./dist",
    "experimentalDecorators": true,
    "strict": true,
    "esModuleInterop": true,
    "target": "ES2020",
    "module": "CommonJS",
    "moduleResolution": "node"
  },
  "reflection": true,
  "files": [
    "app.ts"
  ]
}
```

_File: app.ts_

```typescript
import { App } from '@deepkit/app';
import { Logger } from '@deepkit/logger';
import { FrameworkModule } from '@deepkit/framework';

new App({
    imports: [new FrameworkModule({debug: true})]
})
    .command('test', (logger: Logger) => {
        logger.log('Hello World!');
    })
    .run();
```

In this code, you can see that we have defined a test command and created a new app that we run directly using `run()`. By running this script, we start the app.


and then run it directly.

```sh
$ ts-node app.ts
VERSION
  Node

USAGE
  $ ts-node-script app.ts [COMMAND]

TOPICS
  debug
  migration  Executes pending migration files. Use migration:pending to see which are pending.
  server     Starts the HTTP server

COMMANDS
  test
```

Now, to execute our test command, we run the following command.

```sh
$ ts-node app.ts test
Hello World
```

In Deepkit Framework everything is now done via this `app.ts`. You can rename the file as you like or create more. Custom CLI commands, HTTP/RPC server, migration commands, and so on are all started from this entry point.

Since the app also imports the `FrameworkModule`, we see there are more commands available grouped into topics. 
One of them is `server:start`, which starts the HTTP server.

```sh
$ ./app.ts server:start
```

This currently does nothing since we have not defined any HTTP controllers yet. Let's do that now.

```typescript
import { App } from '@deepkit/app';
import { HttpRouterRegistry } from '@deepkit/http';

const app = new App({
    imports: [new FrameworkModule({debug: true})]
});

app.command('test', (logger: Logger) => {
    logger.log('Hello World!');
});


const router = app.get(HttpRouterRegistry);

router.get('/', () => {
    return 'Hello World';
})

app.run();
```

When you execute the `server:start` command again, you will see that the HTTP server is now started and the route `/` is available.

```sh
$ curl http://localhost:8080/
Hello World
```

To serve requests please read chapter [HTTP](http.md) or [RPC](rpc.md). In chapter [CLI](cli.md) you can learn more about CLI commands.

## App

The `App` class is the main entry point for your application. It is responsible for loading all modules, configuration, and starting the application.
It is also responsible for loading all CLI commands and executing them. Modules like FrameworkModule provide additional commands, register event listeners,
provide controllers for HTTP/RPC, service providers and so on.

This `app` object can also be used to access the Dependency Injection container without running a CLI controller.

```typescript
const app = new App({
    imports: [new FrameworkModule]
});

//get access to all registered services
const eventDispatcher = app.get(EventDispatcher);
```

You can retrieve the `EventDispatcher` because the `FrameworkModule` registers it as a service provider like many other (Logger, ApplicationServer, and [much more](https://github.com/deepkit/deepkit-framework/blob/master/packages/framework/src/module.ts)).

You can also register your own service.

```typescript

class MyService {
    constructor(private logger: Logger) {}
    helloWorld() {
        this.logger.log('Hello World');
    }
}

const app = new App({
    providers: [MyService],
    imports: [new FrameworkModule]
});

const service = app.get(MyService);

service.helloWorld();
```

### Debugger

The configuration values of your application and all modules can be displayed in the debugger. Enable the debug option in `FrameworkModule` and open `http://localhost:8080/_debug/configuration`.

```typescript
import { App } from '@deepkit/app';
import { FrameworkModule } from '@deepkit/framework';

new App({
    config: Config,
    controllers: [MyWebsite],
    imports: [
        new FrameworkModule({
            debug: true,
        })
    ]
}).run();
```

![Debugger Configuration](/assets/documentation/framework/debugger-configuration.png)

You can also use `ts-node app.ts app:config` to display all available configuration options, the active value, their default value, description and data type.

```sh
$ ts-node app.ts app:config
Application config
┌─────────┬───────────────┬────────────────────────┬────────────────────────┬─────────────┬───────────┐
│ (index) │     name      │         value          │      defaultValue      │ description │   type    │
├─────────┼───────────────┼────────────────────────┼────────────────────────┼─────────────┼───────────┤
│    0    │  'pageTitle'  │     'Other title'      │      'Cool site'       │     ''      │ 'string'  │
│    1    │   'domain'    │     'example.com'      │     'example.com'      │     ''      │ 'string'  │
│    2    │    'port'     │          8080          │          8080          │     ''      │ 'number'  │
│    3    │ 'databaseUrl' │ 'mongodb://localhost/' │ 'mongodb://localhost/' │     ''      │ 'string'  │
│    4    │    'email'    │         false          │         false          │     ''      │ 'boolean' │
│    5    │ 'emailSender' │       undefined        │       undefined        │     ''      │ 'string?' │
└─────────┴───────────────┴────────────────────────┴────────────────────────┴─────────────┴───────────┘
Modules config
┌─────────┬──────────────────────────────┬─────────────────┬─────────────────┬────────────────────────────────────────────────────────────────────────────────────────────────────┬────────────┐
│ (index) │           name               │      value      │  defaultValue   │                                            description                                             │    type    │
├─────────┼──────────────────────────────┼─────────────────┼─────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────┼────────────┤
│    0    │       'framework.host'       │   'localhost'   │   'localhost'   │                                                 ''                                                 │  'string'  │
│    1    │       'framework.port'       │      8080       │      8080       │                                                 ''                                                 │  'number'  │
│    2    │    'framework.httpsPort'     │    undefined    │    undefined    │ 'If httpsPort and ssl is defined, then the https server is started additional to the http-server.' │ 'number?'  │
│    3    │    'framework.selfSigned'    │    undefined    │    undefined    │           'If for ssl: true the certificate and key should be automatically generated.'            │ 'boolean?' │
│    4    │ 'framework.keepAliveTimeout' │    undefined    │    undefined    │                                                 ''                                                 │ 'number?'  │
│    5    │       'framework.path'       │       '/'       │       '/'       │                                                 ''                                                 │  'string'  │
│    6    │     'framework.workers'      │        1        │        1        │                                                 ''                                                 │  'number'  │
│    7    │       'framework.ssl'        │      false      │      false      │                                       'Enables HTTPS server'                                       │ 'boolean'  │
│    8    │    'framework.sslOptions'    │    undefined    │    undefined    │                   'Same interface as tls.SecureContextOptions & tls.TlsOptions.'                   │   'any'    │
...
```

## Application Server

## File Structure

## Auto-CRUD

## Events

Deepkit framework comes with various event tokens on which event listeners can be registered.

See the [Events](framework/events.md) chapter to learn more about how events work.

### Dispatch Events

Events are sent via the `EventDispatcher` class. In a Deepkit Framework application, this can be provided via dependency injection.

```typescript
import { cli, Command } from '@deepkit/app';
import { EventDispatcher } from '@deepkit/event';

@cli.controller('test')
export class TestCommand implements Command {
    constructor(protected eventDispatcher: EventDispatcher) {
    }

    async execute() {
        this.eventDispatcher.dispatch(UserAdded, new UserEvent({ username: 'Peter' }));
    }
}
```
