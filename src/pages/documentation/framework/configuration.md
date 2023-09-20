# Configuration

In Deepkit framework, modules and your application can have configuration options. For example, a configuration can consist of database URLs, passwords, IPs, and so on. Services, HTTPRPCCLI controllers, and template functions can read these configuration options via dependency injection.

A configuration can be defined by defining a class with properties. This is a type-safe way to define a configuration for your entire application, and its values are automatically serialized and validated.

## Example

```typescript
import { MinLength } from '@deepkit/type';
import { App } from '@deepkit/app';
import { FrameworkModule } from '@deepkit/framework';
import { http } from '@deepkit/http';

class Config {
    pageTitle: string & MinLength<2> = 'Cool site';
    domain: string = 'example.com';
    debug: boolean = false;
}

class MyWebsite {
    constructor(protected allSettings: Config) {
    }

    @http.GET('/')
    helloWorld() {
        return 'Hello from ' + this.allSettings.pageTitle + ' via ' + this.allSettings.domain;
    }
}

new App({
    config: Config,
    controllers: [MyWebsite],
    imports: [new FrameworkModule]
}).run();
```

```sh
$ curl http://localhost:8080/
Hello from Cool site via example.com
```

## Configuration class

```typescript
import { MinLength } from '@deepkit/type';

export class Config {
    title!: string & MinLength<2>; //this makes it required and needs to be provided
    host?: string;

    debug: boolean = false; //default values are supported as well
}
```

```typescript
import { createModule } from '@deepkit/app';
import { Config } from './module.config.ts';

export class MyModule extends createModule({
   config: Config
}) {}
```

Die Werte für die Konfigurationsoptionen können entweder im Konstruktor des Moduls, mit der Methode `.configure()` oder über Konfigurationslader (z.B. Umgebungsvariablenlader) bereitgestellt werden.

```typescript
import { MyModule } from './module.ts';

new App({
   imports: [new MyModule({title: 'Hello World'}],
}).run();
```

To dynamically change the configuration options of an imported module, you can use the `process` hook. This is a good place to either redirect configuration options or set up an imported module depending on the current module configuration or other module instance information.

```typescript
import { MyModule } from './module.ts';

export class MainModule extends createModule({
}) {
    process() {
        this.getImportedModuleByClass(MyModule).configure({title: 'Changed'});
    }
}
```

At the application level, it works a little differently:

```typescript
new App({
    imports: [new MyModule({title: 'Hello World'}],
})
    .setup((module, config) => {
        module.getImportedModuleByClass(MyModule).configure({title: 'Changed'});
    })
    .run();
```

When the root application module is created from a regular module, it works similarly to regular modules.

```typescript
class AppModule extends createModule({
}) {
    process() {
        this.getImportedModuleByClass(MyModule).configure({title: 'Changed'});
    }
}

App.fromModule(new AppModule()).run();
```

## Read configuration values

To use a configuration option in a service, you can use normal dependency injection. It is possible to inject either the entire configuration object, a single value, or a portion of the configuration.

### Partial

To inject only a subset of the configuration values, use the `Pick` type.

```typescript
import { Config } from './module.config';

export class MyService {
     constructor(private config: Pick<Config, 'title' | 'host'}) {
     }

     getTitle() {
         return this.config.title;
     }
}


//In unit tests, it can be instantiated via
new MyService({title: 'Hello', host: '0.0.0.0'});

//or you can use type aliases
type MyServiceConfig = Pick<Config, 'title' | 'host'};
export class MyService {
     constructor(private config: MyServiceConfig) {
     }
}
```

### Single value

To inject only a single value, use the index access operator.

```typescript
import { Config } from './module.config';

export class MyService {
     constructor(private title: Config['title']) {
     }

     getTitle() {
         return this.title;
     }
}
```

### All

To inject all config values, use the class as dependency.

```typescript
import { Config } from './module.config';

export class MyService {
     constructor(private config: Config) {
     }

     getTitle() {
         return this.config.title;
     }
}
```
