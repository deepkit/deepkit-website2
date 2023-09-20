# Modules

Deepkit framework is highly modular and allows you to split your application into several handy modules. Each module has its own dependency injection sub-container, configuration, commands and much more. In the chapter "First application" you have already created one module - the root module. `new App` takes almost the same arguments as a module, because it creates the root module for you automatically in the background.

You can skip this chapter if you do not plan to split your application into submodules, or if you do not plan to make a module available as a package to others.

A module is a simple class:

```typescript
import { createModule } from '@deepkit/app';

export class MyModule extends createModule({}) {
}
```

It basically has no functionality at this point because its module definition is an empty object and it has no methods, but this demonstrates the relationship between modules and your application (your root module). This MyModule module can then be imported into your application or other modules.

```typescript
import { MyModule } from './module.ts'

new App({
    imports: [
        new MyModule(),
    ]
}).run();
```

You can now add features to this module as you would with `App`. The arguments are the same, except that imports are not available in a module definition. Add HTTPRPCCLI controllers, services, a configuration, event listeners, and various module hooks to make modules more dynamic.

## Controllers

Modules can define controllers that are processed by other modules. For example, if you add a controller with decorators from the `@deepkit/http` package, its `HttpModule` module will pick this up and register the found routes in its router. A single controller may contain several such decorators. It is up to the module author who gives you these decorators how he processes the controllers.

In Deepkit there are three packages that handles such controllers: HTTP, RPC, and CLI. See their respective chapters to learn more. Below is an example of an HTTP controller:

```typescript
import { createModule } from '@deepkit/app';
import { http } from '@deepkit/http';
import { injectable } from '@deepkit/injector';

class MyHttpController {
    @http.GET('/hello)
    hello() {
        return 'Hello world!';
    }
}

export class MyModule extends createModule({
    controllers: [MyHttpController]
}) {}

//same is possible for App
new App({
    controllers: [MyHttpController]
}).run();
```

## Provider

When you define a provider in the `providers` section of your application, it is accessible throughout your application. For modules, however, these providers are automatically encapsulated in that module's dependency injection subcontainer. You must manually export each provider to make it available to another module or your application.

To learn more about how providers work, see the [Dependency Injection](../dependency-injection.md) chapter.

```typescript
import { createModule } from '@deepkit/app';
import { http } from '@deepkit/http';
import { injectable } from '@deepkit/injector';

export class HelloWorldService {
    helloWorld() {
        return 'Hello there!';
    }
}

class MyHttpController {
    constructor(private helloService: HelloWorldService) {}

    @http.GET('/hello)
    hello() {
        return this.helloService.helloWorld();
    }
}

export class MyModule extends createModule({
    controllers: [MyHttpController],
    providers: [HelloWorldService],
}) {}

//same is possible for App
new App({
    controllers: [MyHttpController],
    providers: [HelloWorldService],
}).run();
```

When a user imports this module, he has no access to `HelloWorldService` because it is encapsulated in the sub-dependency injection container of `MyModule`.

## Exports

To make providers available in the importer's module, you can include the provider's token in `exports`. This essentially moves the provider up one level into the dependency injection container of the parent module - the importer.

```typescript
import { createModule } from '@deepkit/app';

export class MyModule extends createModule({
    controllers: [MyHttpController]
    providers: [HelloWorldService],
    exports: [HelloWorldService],
}) {}
```

If you have other providers like `FactoryProvider`, `UseClassProvider` etc., you should still use only the class type in the exports.

```typescript
import { createModule } from '@deepkit/app';

export class MyModule extends createModule({
    controllers: [MyHttpController]
    providers: [
        {provide: HelloWorldService, useValue: new HelloWorldService}
    ],
    exports: [HelloWorldService],
}) {}
```

We can now import that module and use its exported service in our application code.

```typescript
import { App } from '@deepkit/app';
import { cli, Command } from '@deepkit/app';
import { HelloWorldService, MyModule } from './my-module';

@cli.controller('test')
export class TestCommand implements Command {
    constructor(protected helloWorld: HelloWorldService) {
    }

    async execute() {
        this.helloWorld.helloWorld();
    }
}

new App({
    controllers: [TestCommand],
    imports: [
        new MyModule(),
    ]
}).run();
```

Read the [Dependency Injection](../dependency-injection.md) chapter to learn more.
