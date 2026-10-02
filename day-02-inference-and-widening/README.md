# Day 2 — Inference and Widening

## Folder

```text
advanced-typescript/
└── day-02-inference-and-widening/
    ├── 01-literal-types.ts
    ├── 02-as-const.ts
    ├── 03-satisfies.ts
    ├── 04-assertions.ts
    ├── 05-typeof-and-contextual-typing.ts
    ├── 06-practice.ts
    └── README.md
```

---

# 1. Literal Types and Widening

TypeScript can infer either an **exact literal type** or a **wider type**.

A literal type represents one exact value.

```ts
type A = "hello";
type B = 10;
type C = true;
```

These are different from:

```ts
string;
number;
boolean;
```

because:

```text
"hello"
```

means exactly `"hello"`.

Whereas:

```text
string
```

means any string.

---

## `let` usually causes widening

```ts
let message = "hello";
```

The inferred type is:

```ts
string;
```

Why?

Because `let` allows reassignment:

```ts
message = "world";
```

Since the variable can contain different strings, TypeScript widens the literal.

Mental model:

```text
let message = "hello"
        ↓
variable can change
        ↓
"hello" becomes
string
```

---

# 2. `const` and Literal Types

For primitive values, `const` usually preserves the literal type.

```ts
const message = "hello";
```

The type is:

```ts
"hello";
```

because the variable itself cannot be reassigned:

```ts
message = "world"; // error
```

Similarly:

```ts
const count = 10;
// type: 10

const enabled = true;
// type: true
```

Comparison:

```ts
let a = "hello";
// string

const b = "hello";
// "hello"
```

---

# 3. `const` Does Not Make Objects Immutable

A common misconception is that `const` makes the entire object readonly.

It does not.

```ts
const user = {
  name: "Avishek",
};
```

This is still allowed:

```ts
user.name = "John";
```

Therefore TypeScript generally widens the property:

```ts
type Name = typeof user.name;
// string
```

The important distinction is:

```text
const
↓
prevents reassignment of the variable

NOT

const
↓
makes object properties readonly
```

Example:

```ts
const obj = {
  status: "success",
};

obj.status = "failed"; // allowed
```

Therefore:

```ts
typeof obj.status;
```

is:

```ts
string;
```

rather than:

```ts
"success";
```

---

# 4. `as const`

`as const` is used when we want TypeScript to preserve literal values and treat the resulting structure as readonly.

```ts
const obj = {
  status: "success",
} as const;
```

Now the type is effectively:

```ts
{
  readonly status: "success";
}
```

Three important effects:

```text
as const
├── prevents literal widening
├── makes object properties readonly
└── turns arrays into readonly tuples
```

---

## Object example

Without `as const`:

```ts
const response = {
  status: "success",
};
```

Type:

```ts
{
  status: string;
}
```

With `as const`:

```ts
const response = {
  status: "success",
} as const;
```

Type:

```ts
{
  readonly status: "success";
}
```

---

# 5. `as const` with Arrays

Normal array:

```ts
const colors = ["red", "green", "blue"];
```

Type:

```ts
string[]
```

The array is mutable:

```ts
colors[0] = "yellow";
```

With `as const`:

```ts
const colors = ["red", "green", "blue"] as const;
```

Type:

```ts
readonly[("red", "green", "blue")];
```

This is a readonly tuple.

Therefore:

```ts
colors[0] = "yellow";
// error
```

The exact positions and literal values are preserved.

---

# 6. `satisfies`

`satisfies` is used to check that a value is compatible with a type **without replacing the value's inferred type with that type**.

Example:

```ts
type Config = {
  mode: "development" | "production";
  port: number;
};
```

Using a normal type annotation:

```ts
const config: Config = {
  mode: "development",
  port: 3000,
};
```

The variable is treated as:

```ts
Config;
```

Therefore:

```ts
type Mode = typeof config.mode;
```

is:

```ts
"development" | "production";
```

---

## Using `satisfies`

```ts
const config = {
  mode: "development",
  port: 3000,
} satisfies Config;
```

`satisfies` checks that the object conforms to `Config`.

But it does not simply replace the inferred object type with `Config`.

Mental model:

```text
satisfies Config
      ↓
check compatibility
      ↓
keep the expression's inferred type
```

---

# 7. Important: `satisfies` Does Not Automatically Preserve Literals

A very important detail:

`satisfies` does **not** mean "preserve every literal".

Normal inference rules still apply.

For example:

```ts
type Config = {
  mode: "development" | "production";
  port: number;
};

const config = {
  mode: "development",
  port: 3000,
} satisfies Config;
```

Because the object property is mutable, `mode` can still widen under normal inference.

So `satisfies` does not guarantee that:

```ts
typeof config.mode;
```

will be:

```ts
"development";
```

`satisfies` and `as const` have different responsibilities.

```text
satisfies
→ validate compatibility

as const
→ preserve literals + readonly
```

---

# 8. `satisfies` Does Not Perform Runtime Validation

This:

```ts
const config = {
  mode: "development",
  port: 3000,
} satisfies Config;
```

does not generate runtime validation code.

`satisfies` exists only for TypeScript's compile-time checking.

After TypeScript compilation, the `satisfies` expression itself is gone.

Therefore:

```text
satisfies
→ compile-time only
→ no runtime validation
```

---

# 9. `satisfies` and Excess Property Checking

Consider:

```ts
type Animal = {
  name: string;
};
```

A fresh object literal:

```ts
const dog = {
  name: "Bruno",
  breed: "Labrador",
} satisfies Animal;
```

can produce an excess-property error because the fresh object literal contains an extra property.

However:

```ts
const value = {
  name: "Bruno",
  breed: "Labrador",
};

const animal = value satisfies Animal;
```

works because `value` is structurally compatible with `Animal`.

The distinction is:

```text
Fresh object literal
        ↓
excess property checking may occur

Existing value
        ↓
structural compatibility is checked
```

---

# 10. Structural Typing

TypeScript uses structural typing.

This means that compatibility is primarily determined by the object's shape.

```ts
type Animal = {
  name: string;
};

const dog = {
  name: "Bruno",
  breed: "Labrador",
};

const animal: Animal = dog;
```

This works because `dog` contains everything required by `Animal`.

`Animal` requires:

```ts
{
  name: string;
}
```

and `dog` has that property.

The extra `breed` property does not prevent structural compatibility when using an existing value.

---

# 11. `satisfies` vs Type Annotation

### Type annotation

```ts
const config: Config = {
  mode: "development",
  port: 3000,
};
```

Meaning:

```text
Treat this variable as Config.
```

The variable's static type becomes `Config`.

### `satisfies`

```ts
const config = {
  mode: "development",
  port: 3000,
} satisfies Config;
```

Meaning:

```text
Check this value against Config,
while keeping the expression's inferred type.
```

Mental model:

```text
: Config
↓
"Treat this variable as Config"

satisfies Config
↓
"Check this value against Config"
```

---

# 12. `as` — Type Assertions

A type assertion tells TypeScript:

> Treat this value as this type.

Example:

```ts
type Animal = {
  name: string;
};

const value: unknown = {
  name: "Bruno",
  breed: "Labrador",
};

const animal = value as Animal;
```

Before assertion:

```ts
typeof value;
// unknown
```

After assertion:

```ts
typeof animal;
// Animal
```

This changes TypeScript's **static view** of the value.

It does not transform the runtime value.

---

# 13. Type Assertions Do Not Perform Runtime Conversion

This:

```ts
const animal = value as Animal;
```

does not turn the runtime object into an Animal object.

The underlying JavaScript value is still the same object.

Therefore:

```text
as
→ changes static type
→ does not change runtime value
→ does not perform runtime validation
```

---

# 14. Dangerous Type Assertions

TypeScript allows assertions in situations where the types are sufficiently related.

You can also force incompatible assertions through `unknown`.

```ts
const value = {
  name: "Bruno",
  breed: "Labrador",
} as unknown as number;
```

TypeScript now treats the value as:

```ts
number;
```

But at runtime it is still an object.

This can lead to runtime bugs.

Mental model:

```text
as
→ "Trust me, I know the type."

unknown → type assertion → desired type
→ escape hatch
```

Use assertions when you genuinely know something TypeScript cannot determine, rather than simply using them to silence an error.

---

# 15. `satisfies` vs `as`

| Feature                          | `satisfies`            | `as`                                            |
| -------------------------------- | ---------------------- | ----------------------------------------------- |
| Compile-time compatibility check | Yes                    | No, it is an assertion                          |
| Runtime validation               | No                     | No                                              |
| Replaces static type             | No                     | Yes                                             |
| Preserves inferred type          | Yes                    | No                                              |
| Main purpose                     | Validate compatibility | Tell TypeScript what type to treat the value as |

Important:

```text
satisfies
→ "Check this"

as
→ "Treat this as"
```

Neither performs runtime validation.

---

# 16. `typeof` in a Type Position

JavaScript already has a runtime `typeof`.

TypeScript also allows `typeof` to be used in a **type position**.

Example:

```ts
const user = {
  name: "Avishek",
  age: 30,
};

type User = typeof user;
```

Now `User` is derived from the value.

Effectively:

```ts
type User = {
  name: string;
  age: number;
};
```

Mental model:

```text
runtime value
      ↓
    typeof
      ↓
TypeScript type
```

This is useful when the value itself is the source of truth.

---

# 17. `typeof` + `keyof`

Consider:

```ts
const statuses = {
  pending: 1,
  success: 2,
  failed: 3,
} as const;
```

We can derive the keys:

```ts
type Status = keyof typeof statuses;
```

Result:

```ts
"pending" | "success" | "failed";
```

We can also derive the values:

```ts
type StatusCode = (typeof statuses)[Status];
```

Result:

```ts
1 | 2 | 3;
```

The logic is:

```text
statuses
   ↓
typeof statuses
   ↓
object type
   ↓
keyof
   ↓
"pending" | "success" | "failed"
   ↓
indexed access
   ↓
1 | 2 | 3
```

---

# 18. Contextual Typing

Contextual typing occurs when the **surrounding context provides a type for an expression**.

Example:

```ts
const numbers = [1, 2, 3];

numbers.map((value) => {
  return value * 2;
});
```

`numbers` is:

```ts
number[]
```

`map()` expects a callback whose first parameter is a number.

Therefore:

```ts
value;
```

is contextually typed as:

```ts
number;
```

Mental model:

```text
numbers
   ↓
number[]
   ↓
map expects callback
   ↓
(value) => ...
   ↓
value = number
```

---

# 19. Contextual Typing with Object Properties

Example:

```ts
type Config = {
  onSuccess: (message: string) => void;
};

const config: Config = {
  onSuccess: (message) => {
    console.log(message.toUpperCase());
  },
};
```

TypeScript knows:

```ts
message;
```

is:

```ts
string;
```

because the expected type of `onSuccess` is:

```ts
(message: string) => void
```

Flow:

```text
Config
 ↓
onSuccess
 ↓
(message: string) => void
 ↓
(message) => ...
 ↓
message = string
```

---

# 20. Contextual Typing of Function Parameters and Return Values

Example:

```ts
type Handler = (value: number) => string;

const handler: Handler = (value) => {
  return value.toString();
};
```

TypeScript knows:

```ts
value;
```

is:

```ts
number;
```

and the function must return:

```ts
string;
```

So contextual typing can provide information for:

```text
parameters
+
return type expectation
```

---

# 21. Contextual Typing vs No Context

Compare:

```ts
const numbers = [1, 2, 3];

numbers.map((value) => value * 2);
```

Here:

```ts
value;
```

is:

```ts
number;
```

because `map()` provides the context.

Now:

```ts
const callback = (value) => value * 2;
```

There is no contextual type for `value`.

With `noImplicitAny: true`, TypeScript reports:

```text
Parameter 'value' implicitly has an 'any' type.
```

Conceptually:

```text
Context available
→ infer from context

No context
→ cannot infer parameter type
```

---

# 22. Contextual Typing Can Affect Literals

Context can also influence how literals are inferred.

Example:

```ts
type Status = "development" | "production";

let status: Status = "development";
```

The expected type is:

```ts
"development" | "production";
```

Therefore these assignments are valid:

```ts
status = "development";
status = "production";
```

but:

```ts
status = "testing";
// error
```

The contextual type constrains the value.

---

# 23. Combining `as const` and `satisfies`

This is a useful pattern.

```ts
type Method = "GET" | "POST" | "DELETE";

type Action = {
  method: Method;
  path: string;
  enable: boolean;
};
```

We can write:

```ts
const createUser = {
  method: "POST",
  enable: true,
  path: "/users",
} as const satisfies Action;
```

This gives us two useful behaviors:

```text
as const
→ preserve exact literals
→ readonly

satisfies Action
→ verify structure
```

The inferred type keeps:

```ts
{
  readonly method: "POST";
  readonly enable: true;
  readonly path: "/users";
}
```

while TypeScript also verifies that the value is compatible with:

```ts
Action;
```

---

# 24. Why `as const` Placement Matters

Consider:

```ts
const endPoints = {
  createUser: {
    method: "POST",
    enable: true,
    path: "/users",
  } satisfies Action,
} as const;
```

The `path` property can be contextually typed by:

```ts
path: string;
```

from `Action`.

Therefore the information can become:

```ts
readonly path: string
```

rather than:

```ts
readonly path: "/users"
```

The outer `as const` does not recover literal information that has already been widened.

By contrast:

```ts
const createUser = {
  method: "POST",
  enable: true,
  path: "/users",
} as const satisfies Action;
```

preserves the literal structure at the expression.

---

# 25. Day 1 + Day 2 Combined Pattern

One of the most useful patterns we practiced was extracting information from a value.

Example:

```ts
type Method = "GET" | "POST" | "DELETE";

type Action = {
  method: Method;
  path: string;
  enable: boolean;
};

const endPoints = {
  createUser: {
    method: "POST",
    enable: true,
    path: "/users",
  } as const satisfies Action,

  getUser: {
    method: "GET",
    enable: true,
    path: "/users/:id",
  } as const satisfies Action,

  deleteUser: {
    method: "DELETE",
    enable: false,
    path: "/users/:id",
  } as const satisfies Action,
} as const;
```

We can derive the endpoint object type:

```ts
type EndPoints = typeof endPoints;
```

Then:

```ts
keyof EndPoints
```

produces:

```ts
"createUser" | "getUser" | "deleteUser";
```

---

# 26. Filtering Keys Using Mapped + Conditional Types

We previously learned this pattern on Day 1.

```ts
type ExtractKey<T> = {
  [P in keyof T]: T[P] extends boolean ? P : never;
}[keyof T];
```

For:

```ts
type FeatureFlags = {
  darkMode: boolean;
  betaAccess: boolean;
  environment: string;
  version: string;
  retryCount: number;
};
```

the result is:

```ts
type BooleanFeatureFlagKey = ExtractKey<FeatureFlags>;
```

which becomes:

```ts
"darkMode" | "betaAccess";
```

Mental model:

```text
keyof T
   ↓
iterate every key
   ↓
T[P]
   ↓
is value boolean?
   │
   ├── yes → P
   │
   └── no  → never
   ↓
extract union
```

---

# 27. Selecting Properties

We also created:

```ts
type SelectProperties<T, K extends keyof T> = {
  [P in K]: T[P];
};
```

Example:

```ts
type Product = {
  id: number;
  name: string;
  price: number;
};
```

Then:

```ts
type NumericProperties = SelectProperties<Product, "id" | "price">;
```

becomes:

```ts
{
  id: number;
  price: number;
}
```

Important:

```ts
[P in K]: T[P]
```

uses `P`, the **current key being iterated**.

Using:

```ts
T[K];
```

instead refers to the value types for the entire key union.

---

# 28. Generic Key/Value Relationship

A key pattern from Day 1 and Day 2 is:

```ts
function getConfigType<K extends keyof Config>(
  config: Config,
  key: K,
): Config[K] {
  return config[key];
}
```

Why `K` is important:

Without `K`:

```ts
function getConfigType(
  config: Config,
  key: keyof Config,
): Config[keyof Config] {
  return config[key];
}
```

the return type becomes the union of **all possible values**.

```text
Config[keyof Config]
        ↓
string | number | boolean | ...
```

Even if the caller passes `"port"`, the function's declared return type is still the whole union.

With `K`:

```text
K extends keyof Config
        ↓
K captures the specific key
        ↓
Config[K]
        ↓
value type belonging to that key
```

Example:

```ts
getConfigType(config, "port");
// number

getConfigType(config, "environment");
// "development" | "production"

getConfigType(config, "debug");
// boolean
```

The key distinction is:

```text
keyof Config
→ what keys are allowed?

K extends keyof Config
→ which specific allowed key was passed?

Config[K]
→ what value type belongs to that key?
```

---

# 29. `T[P]` vs `T[K]` Inside Mapped Types

Suppose:

```ts
type SelectProperties<T, K extends keyof T> = {
  [P in K]: T[P];
};
```

Here:

```text
[P in K]
```

iterates over the keys in `K`.

At each iteration, `P` represents the **current key**.

Therefore:

```ts
T[P];
```

means:

> Give me the value type belonging to this current key.

If you use:

```ts
T[K];
```

you ask for the value types of the **entire union of keys**.

Example:

```text
K = "id" | "price"

T[K]
→ number | number
```

More importantly, when the selected keys have different value types:

```text
K = "id" | "name"

T[K]
→ number | string
```

while:

```ts
[P in K]: T[P]
```

keeps each individual key paired with its own value type.

---

# 30. Extracting Enabled Endpoint Names

For our endpoint collection:

```ts
type EndPoints = typeof endPoints;
```

we can filter endpoint names by their `enable` property:

```ts
type EnabledEndPoints = {
  [K in keyof EndPoints]: EndPoints[K]["enable"] extends true ? K : never;
}[keyof EndPoints];
```

The result is:

```ts
"createUser" | "getUser";
```

because:

```text
createUser → enable: true
getUser    → enable: true
deleteUser → enable: false
```

Flow:

```text
typeof endPoints
       ↓
endpoint object type
       ↓
keyof EndPoints
       ↓
"createUser" | "getUser" | "deleteUser"
       ↓
iterate K
       ↓
EndPoints[K]["enable"]
       ↓
true / false
       ↓
true → keep K
false → never
       ↓
[keyof EndPoints]
       ↓
"createUser" | "getUser"
```

---

# 31. Common Pitfalls from Day 2

## Pitfall 1 — Assuming `const` makes objects readonly

```ts
const obj = {
  status: "success",
};
```

This is still mutable:

```ts
obj.status = "failed";
```

Use `as const` when you need readonly literal values.

---

## Pitfall 2 — Assuming `satisfies` preserves every literal

```ts
const config = {
  path: "/users",
} satisfies {
  path: string;
};
```

`satisfies` does not automatically guarantee:

```ts
"/users";
```

as the property type.

Normal contextual inference can widen it to:

```ts
string;
```

Use `as const` when the exact literal matters.

---

## Pitfall 3 — Thinking `satisfies` validates at runtime

It does not.

```text
satisfies
→ compile-time only
```

Runtime validation requires actual runtime logic or a validation library.

---

## Pitfall 4 — Confusing `as` with conversion

```ts
value as number;
```

does not convert the value into a number.

It only changes TypeScript's static understanding.

---

## Pitfall 5 — Losing key/value correlation

This:

```ts
keyof Config
```

gives all allowed keys.

But to preserve the connection between a **specific key** and its **specific value type**, use:

```ts
K extends keyof Config
```

and:

```ts
Config[K];
```

---

# 32. Final Day 2 Mental Model

```text
                 INFERENCE
                    │
       ┌────────────┼─────────────┐
       │            │             │
   widening     contextual     literal
       │          typing        types
       │            │             │
      let       surrounding     "hello"
       │         expected          │
    string        type          as const
                                  │
                            "hello" + readonly

       ┌──────────────────────────────┐
       │                              │
    satisfies                       as
       │                              │
  check compatibility          assertion
       │                              │
 preserve inference            change static view
       │                              │
 no runtime check              no runtime check

                  typeof
                    │
              value → type
                    │
              keyof → keys
                    │
              T[K] → value type
                    │
             mapped/conditional
                    │
              filter and derive
```

Day 2 is fundamentally about understanding **where TypeScript gets type information from**:

```text
the value itself
+
the variable declaration
+
the surrounding context
+
explicit assertions/constraints
```

Once this becomes intuitive, advanced generic inference and conditional-type programming become much easier.
