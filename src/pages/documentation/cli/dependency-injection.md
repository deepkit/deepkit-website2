# Dependency Injection

The class and function of the command is managed by the Dependency Injection Container, so dependencies can be defined that are resolved via the DI Container.

```typescript
import { App, cli } from '@deepkit/app';
import { Logger, ConsoleTransport } from '@deepkit/logger';

//functional
new App({
    providers: [{provide: Logger, useValue: new Logger([new ConsoleTransport])}],
}).command('test', (logger: Logger) => {
    logger.log('Hello World!');
});

//class
@cli.controller('test', {
    description: 'My super first command'
})
class TestCommand {
    constructor(protected logger: Logger) {
    }

    async execute() {
        this.logger.log('Hello World!');
    }
}

new App({
    providers: [{provide: Logger, useValue: new Logger([new ConsoleTransport]}],
    controllers: [TestCommand]
}).run();
```

You can define as many dependencies as you want. The Dependency Injection Container will resolve them automatically.
