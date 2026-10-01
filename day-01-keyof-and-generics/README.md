# Day 1 — `keyof`, Generic Constraints & Mapped Types

## Overview

Day 1 focused on learning how TypeScript can work with the **structure of an object type**.

The main idea was:

> Instead of manually specifying property names and types, let TypeScript inspect an object type, extract its keys, iterate over those keys, and apply logic to create new types.

The core concepts covered:

- `keyof`
- Indexed access types: `T[K]`
- Generic constraints: `K extends keyof T`
- `extends`
- Mapped types
- `in`
- Conditional types
- `never`
- `readonly`
- `-readonly`
- Optional properties and `-?`
- Filtering keys based on value types
- Combining utility types

---

# 1. `keyof`

`keyof` extracts the keys of an object type.

```ts
type User = {
  id: number;
  name: string;
  isActive: boolean;
};
```

```ts
type UserKeys = keyof User;
```

Result:

```ts
"id" | "name" | "isActive";
```

Think of it as:

```text
Object type
    ↓
keyof
    ↓
union of keys
```

Example:

```ts
keyof User
```

means:

```ts
"id" | "name" | "isActive";
```

---

# 2. Indexed Access Type — `T[K]`

Once we have a key, we can use it to access the corresponding value type.

```ts
type User = {
  id: number;
  name: string;
  isActive: boolean;
};
```

```ts
type UserId = User["id"];
// number

type UserName = User["name"];
// string
```

We can also use a union of keys:

```ts
type UserValue = User["id" | "name"];
```

Result:

```ts
number | string;
```

So:

```ts
T[K];
```

means:

> Give me the value type of property `K` from object type `T`.

---

# 3. `extends` — Generic Constraint

We used `extends` to **restrict** what a generic type is allowed to be.

```ts
function getProperty<T, K extends keyof T>(data: T, key: K) {
  return data[key];
}
```

The important part is:

```ts
K extends keyof T
```

It means:

> `K` must be one of the keys of `T`.

For example:

```ts
type Product = {
  id: number;
  name: string;
  price: number;
};
```

This is valid:

```ts
getProperty(product, "name");
```

This is invalid:

```ts
getProperty(product, "invalid");
```

because:

```ts
"invalid";
```

is not part of:

```ts
keyof Product
```

---

# 4. `extends` vs `in`

This distinction is extremely important.

## `extends`

`extends` is used to **restrict/constrain**.

```ts
K extends keyof T
```

Mental model:

```text
"Is K allowed to be one of these keys?"
```

---

## `in`

`in` is used inside a mapped type to **iterate**.

```ts
type Copy<T> = {
  [Key in keyof T]: T[Key];
};
```

Mental model:

```text
"For every key in keyof T, create a property."
```

So remember:

```text
extends → restrict
in      → iterate
```

---

# 5. Mapped Types

A mapped type allows us to create a new object type by iterating over keys.

```ts
type Copy<T> = {
  [Key in keyof T]: T[Key];
};
```

Given:

```ts
type Product = {
  id: number;
  name: string;
  price: number;
};
```

TypeScript effectively does:

```text
Key = "id"
Key = "name"
Key = "price"
```

and creates:

```ts
{
  id: number;
  name: string;
  price: number;
}
```

The basic structure is:

```ts
{
  [Key in SomeKeys]: SomeValue
}
```

---

# 6. Why `Key` and `K` Are Different

Consider:

```ts
type SelectProperties<T, K extends keyof T> = {
  [Key in K]: T[Key];
};
```

There are two concepts here:

```text
K
```

is the **whole collection of selected keys**.

Example:

```ts
"name" | "price";
```

While:

```text
Key
```

is the **current key being iterated**.

Conceptually:

```text
K = "name" | "price"

        ↓ iteration

Key = "name"
Key = "price"
```

Therefore we use:

```ts
T[Key];
```

rather than:

```ts
T[K];
```

because we want the value corresponding to the **current key**.

---

# 7. Select Properties

We created this utility:

```ts
type SelectProperties<T, K extends keyof T> = {
  [Key in K]: T[Key];
};
```

Given:

```ts
type Product = {
  id: number;
  name: string;
  price: number;
  inStock: boolean;
};
```

We can select specific properties:

```ts
type ProductInfo = SelectProperties<Product, "name" | "price">;
```

Result:

```ts
{
  name: string;
  price: number;
}
```

Logic flow:

```text
Product
   ↓
keyof Product
   ↓
"id" | "name" | "price" | "inStock"
   ↓
select "name" | "price"
   ↓
iterate using Key
   ↓
T[Key]
   ↓
{
  name: string;
  price: number;
}
```

---

# 8. Invalid Keys Are Rejected

Because we have:

```ts
K extends keyof T
```

this is invalid:

```ts
type ProductInfo = SelectProperties<Product, "name" | "invalid">;
```

because:

```ts
"invalid";
```

is not part of:

```ts
keyof Product
```

So:

```ts
K extends keyof T
```

provides the type-safety boundary.

---

# 9. `readonly`

Properties can be marked readonly:

```ts
type Product = {
  readonly id: number;
  name: string;
};
```

This means:

```ts
product.id = 10;
```

is not allowed through that reference.

But:

```ts
product.name = "MacBook";
```

is allowed.

---

# 10. Removing `readonly`

Mapped types can modify property modifiers.

We learned:

```ts
-readonly;
```

Example:

```ts
type Mutable<T> = {
  -readonly [Key in keyof T]: T[Key];
};
```

Given:

```ts
type Product = {
  readonly id: number;
  name: string;
};
```

```ts
type MutableProduct = Mutable<Product>;
```

produces:

```ts
{
  id: number;
  name: string;
}
```

The original `Product` type is unchanged.

`Mutable<Product>` creates a new type.

Important:

```text
readonly
   ↓
-readonly
   ↓
remove readonly modifier
```

---

# 11. Optional Properties

Consider:

```ts
type Product = {
  id: number;
  name: string;
  inStock?: boolean;
};
```

Because `inStock` is optional:

```ts
type InStock = Product["inStock"];
```

can be:

```ts
boolean | undefined;
```

However:

```ts
keyof Product
```

is still:

```ts
"id" | "name" | "inStock";
```

The `undefined` belongs to the **value type**, not the key itself.

---

# 12. `-?` — Removing Optional

Mapped types preserve optional modifiers by default.

For example:

```ts
type Debug<T> = {
  [Key in keyof T]: T[Key];
};
```

If `T` contains:

```ts
inStock?: boolean;
```

the mapped property remains optional.

We can remove the optional modifier using:

```ts
-?
```

Example:

```ts
type RequiredMapped<T> = {
  [Key in keyof T]-?: T[Key];
};
```

So remember:

```text
readonly  → -readonly
optional  → -?
```

---

# 13. Conditional Types

Conditional types allow TypeScript to make a decision at the type level.

Basic structure:

```ts
Condition ? TrueType : FalseType;
```

Example:

```ts
type Result = "id" extends "id" ? "YES" : "NO";
```

Result:

```ts
"YES";
```

Another:

```ts
type Result = "name" extends "id" ? "YES" : "NO";
```

Result:

```ts
"NO";
```

Mental model:

```text
condition
   ↓
true  → first type
false → second type
```

---

# 14. `never`

`never` represents a type that should contribute no possible value.

It becomes especially useful when filtering unions.

Example:

```ts
type Result = "id" | never;
```

simplifies to:

```ts
"id";
```

Therefore:

```ts
never;
```

is useful as the "remove this" result when building type-level filters.

---

# 15. Filtering Keys

We can combine:

- `keyof`
- mapped types
- conditional types
- `never`
- indexed access

to filter keys.

Example:

```ts
type Keys = "id" | "name";
```

We might want to remove `"id"`.

A direct conditional does not iterate over individual members:

```ts
type Result = Keys extends "id" ? never : Keys;
```

This checks the union as a whole.

Instead, mapped types let us evaluate each key separately:

```ts
type Result = {
  [Key in Keys]: Key extends "id" ? never : Key;
};
```

Result:

```ts
{
  id: never;
  name: "name";
}
```

Then:

```ts
[keyof ...]
```

can extract the values.

---

# 16. `[keyof T]` After a Mapped Type

This is one of the most important patterns from Day 1.

Suppose:

```ts
type Test<T> = {
  [Key in keyof T]: Key;
};
```

For:

```ts
type User = {
  id: number;
  name: string;
};
```

we get:

```ts
{
  id: "id";
  name: "name";
}
```

Now:

```ts
Test<User>[keyof User]
```

extracts the values:

```ts
"id" | "name";
```

So the pattern:

```ts
type Something<T> = {
  [Key in keyof T]: SomeLogic<Key>;
}[keyof T];
```

means:

```text
1. Get all keys
       ↓
2. Iterate over every key
       ↓
3. Apply logic to each key
       ↓
4. Produce values
       ↓
5. Extract all those values
       ↓
6. Get a union
```

This is the foundation of many advanced TypeScript utility types.

---

# 17. Extract Keys by Value Type

We built:

```ts
type ExtractKeys<D, T> = {
  [Key in keyof D]-?: D[Key] extends T ? Key : never;
}[keyof D];
```

This answers:

> "Which keys of object `D` have values assignable to type `T`?"

Example:

```ts
type Product = {
  id: number;
  name: string;
  price: number;
  inStock?: boolean;
};
```

Then:

```ts
type ProductNumberKeys = ExtractKeys<Product, number>;
```

Result:

```ts
"id" | "price";
```

And:

```ts
type ProductStringKeys = ExtractKeys<Product, string>;
```

Result:

```ts
"name";
```

The logic flow is:

```text
Product
   ↓
keyof Product
   ↓
iterate each Key
   ↓
D[Key]
   ↓
does D[Key] extend T?
   ↓
YES → keep Key
NO  → never
   ↓
extract values using [keyof D]
   ↓
final key union
```

---

# 18. Why `-?` Was Needed

Suppose:

```ts
type Product = {
  id: number;
  name: string;
  price: number;
  inStock?: boolean;
};
```

Without `-?`:

```ts
type ExtractKeys<D, T> = {
  [Key in keyof D]: D[Key] extends T ? Key : never;
}[keyof D];
```

The optional property remains optional inside the mapped type.

That can cause `undefined` to appear when we extract the values.

Therefore we use:

```ts
[Key in keyof D]-?
```

to remove the optional modifier while performing the filtering.

---

# 19. Combining Utility Types

Instead of creating one huge utility, we can create small utilities and compose them.

We already have:

```ts
type SelectProperties<T, K extends keyof T> = {
  [Key in K]: T[Key];
};
```

and:

```ts
type ExtractKeys<D, T> = {
  [Key in keyof D]-?: D[Key] extends T ? Key : never;
}[keyof D];
```

Now we can combine them:

```ts
type StringProperties<T> = SelectProperties<T, ExtractKeys<T, string>>;
```

For:

```ts
type Product = {
  id: number;
  name: string;
  price: number;
  inStock?: boolean;
};
```

we get:

```ts
type ProductStringProperties = StringProperties<Product>;
```

Result:

```ts
{
  name: string;
}
```

The important idea is **composition**.

We don't need to solve everything in one type.

Instead:

```text
ExtractKeys
    ↓
find the relevant keys
    ↓
SelectProperties
    ↓
build the resulting object
```

---

# 20. General Type-Level Logic Flow

A lot of advanced TypeScript problems can be approached using this sequence:

```text
             OBJECT TYPE
                  │
                  ▼
               keyof
                  │
                  ▼
             KEY UNION
                  │
                  ▼
             iterate with `in`
                  │
                  ▼
              current Key
                  │
                  ▼
                T[Key]
                  │
                  ▼
          apply conditional logic
                  │
          ┌───────┴────────┐
          ▼                ▼
        keep              remove
          │                │
          ▼                ▼
         Key              never
          │
          ▼
     [keyof T]
          │
          ▼
      final union
```

For object construction:

```text
OBJECT TYPE
    ↓
Extract relevant keys
    ↓
Select those keys
    ↓
Create new object type
```

This is the mental model to remember.

---

# 21. Important Syntax Cheat Sheet

| Syntax              | Meaning                         |
| ------------------- | ------------------------------- |
| `keyof T`           | Get keys of `T`                 |
| `T[K]`              | Get value type at key `K`       |
| `K extends keyof T` | Restrict `K` to valid keys      |
| `[Key in keyof T]`  | Iterate over keys               |
| `Condition ? A : B` | Conditional type                |
| `never`             | Remove/no possible value        |
| `-readonly`         | Remove readonly modifier        |
| `-?`                | Remove optional modifier        |
| `[keyof T]`         | Extract values from mapped type |

---

# 22. The Most Important Mental Models

### `keyof`

> "Give me the keys."

```ts
keyof Product
```

↓

```ts
"id" | "name" | "price" | "inStock";
```

---

### `extends`

> "Is this allowed / does this satisfy the constraint?"

```ts
K extends keyof T
```

↓

```text
K must be a valid key
```

---

### `in`

> "Iterate over these keys."

```ts
[Key in keyof T]
```

↓

```text
Key = first key
Key = second key
Key = third key
...
```

---

### `T[Key]`

> "What is the value type of the current key?"

```ts
T[Key];
```

---

### `never`

> "Don't keep this result."

```ts
condition ? Key : never;
```

---

### `[keyof T]`

> "After creating the mapped object, give me all its values."

This is how we turn:

```ts
{
  id: "id";
  name: never;
  price: "price";
}
```

into:

```ts
"id" | never | "price";
```

and finally:

```ts
"id" | "price";
```

---

# 23. Day 1 Core Pattern

The most important pattern from today is:

```ts
type FilterKeys<T, Condition> = {
  [Key in keyof T]-?: T[Key] extends Condition ? Key : never;
}[keyof T];
```

Read it almost like English:

> For every key in `T`, check whether its value type matches `Condition`. If it does, keep the key; otherwise discard it.

And when we want an object instead of a key union:

```ts
type FilterProperties<T, Condition> = SelectProperties<
  T,
  FilterKeys<T, Condition>
>;
```

The overall approach becomes:

```text
Extract the keys
      ↓
Filter the keys
      ↓
Select those keys
      ↓
Build the new object
```

---

# 24. What We Deliberately Deferred

We encountered one advanced problem:

> How do we reliably detect whether a property is `readonly`?

We previously used an `Equal<X, Y>` helper for this.

However, the internals of `Equal` involve deeper conditional/type-level programming.

We are intentionally **not learning that today**.

It belongs naturally with:

- `infer`
- conditional type programming
- distributive conditional types
- type-level equality

which we'll cover later in the plan.

So the Day 1 takeaway is:

> We know `readonly` can be removed with `-readonly`, but deep readonly detection is deferred.

---

# Day 1 Summary

Today we moved from basic generic constraints into the foundation of advanced TypeScript type programming.

The progression was:

```text
keyof
  ↓
T[K]
  ↓
K extends keyof T
  ↓
mapped types
  ↓
in
  ↓
conditional types
  ↓
never
  ↓
filtering keys
  ↓
-?
  ↓
filter keys by value type
  ↓
compose utility types
```

The most important pattern to remember is:

```ts
[Key in keyof T]
```

means:

> **Iterate over every key**

and:

```ts
T[Key];
```

means:

> **Look at the value type of the current key**

and:

```ts
T[Key] extends SomeType
  ? Key
  : never
```

means:

> **Keep the key if its value type matches; otherwise remove it.**

Finally:

```ts
[keyof T]
```

means:

> **Extract the resulting values from the mapped type.**

This combination is the foundation for many of TypeScript's built-in utility types and advanced type-level patterns.
