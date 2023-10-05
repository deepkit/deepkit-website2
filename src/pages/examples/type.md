Title: Iterate over class properties

```typescript
import { ReflectionClass } from '@deepkit/type';

class User {
    id: number = 0;
    username: string = '';
    password: string = '';
}

const properties = ReflectionClass.from(User).getProperties();
for (const property of properties) {
    console.log(property.name, property.type);
}
```

##-------------------------------------------------##

Title: Convert plain object to class instance

```typescript
import { cast } from '@deepkit/type';

class User {
    firstName: string = '';
    lastName: string = '';

    get fullName() {
        return this.firstName + ' ' + this.lastName;
    }
}

const user = cast<User>({ firstName: 'Peter', lastName: 'Mayer' });
console.log(user.fullName); //Peter Mayer
```

##-------------------------------------------------##

Title: Validate username and email

```typescript
import { Email, MaxLength, MinLength, Pattern, validate } from '@deepkit/type';

type Username = string & MinLength<3> & MaxLength<20> & Pattern<'^[a-zA-Z0-9]+$'>;

class User {
    email: Email = '';
    username: Username = '';
}

const errors = validate<User>({ email: 'peter@example.com', username: 'pet' });
console.log(errors); // [{ path: 'username', message: '...' }]
``` 
