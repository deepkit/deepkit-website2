# Injection

It's called Dependency Injection since a dependency is injected. Injection either happens by the user (manually) or by the DI container (automatically).

## Constructor/Property Injection

In most cases, constructor injection is used. All dependencies are specified as constructor arguments and are automatically injected by the DI container.

```typescript
class MyService {
    constructor(protected database: Database) {
    }
}
```

Optional dependencies should be marked as such, otherwise an error could be triggered if no provider can be found.

```typescript
class MyService {
    constructor(protected database?: Database) {
    }
}
```

An alternative to constructor injection is property injection. This is usually used when the dependency is optional or the constructor is otherwise too full. The properties are automatically assigned once the instance is created (and thus the constructor is executed).

```typescript
import { Inject } from '@deepkit/injector';

class MyService {
    //required
    protected database!: Inject<Database>;

    //or optional
    protected database?: Inject<Database>;
}
```
