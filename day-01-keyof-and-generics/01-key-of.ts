import { faker } from "@faker-js/faker";
type User = {
  readonly id: number;
  name: string;
  isActive: boolean;
  email: string;
};

type UserKeys = keyof User;

let key: UserKeys;

key = "id";
key = "name";

// Try these one at a time:
key = "email";
key = "isActive";

function getValue(obj: User, key: keyof User) {
  return obj[key];
}

const result = getValue(
  { id: 1, name: "Avishek", email: "abc@gmail.com", isActive: true },
  "id",
);
console.log(result);

type AppConfig = {
  apiUrl: string;
  retryCount: number;
  enableLogging: boolean;
  environment: "development" | "production";
};

type ConfigKey = keyof AppConfig;

let configKeys: ConfigKey;

configKeys = "apiUrl";
configKeys = "enableLogging";
// configKeys = "timeout"; give error

type ConfigValue = AppConfig[ConfigKey];

type Product = {
  readonly id: string;
  title: string;
  price: string;
  inStock: boolean;
};

const product: Product = {
  id: faker.string.nanoid(),
  title: faker.commerce.product(),
  price: faker.commerce.price(),
  inStock: true,
};

function getObjectProperty<T, K extends keyof T>(data: T, key: K): T[K] {
  return data[key];
}

// function setObjectProperty<T, K extends keyof T>(data: T, key: K, value: T[K]) {
//   data[key] = value;
// }

function getProductProperty<K extends keyof Product>(product: Product, key: K) {
  return getObjectProperty(product, key);
}

function setProductProperty<K extends MutableKey<Product>>(
  data: Product,
  key: K,
  value: Product[K],
) {
  setObjectProperty<Product, K>(data, key, value);
}

const prodVal = getProductProperty(product, "inStock");
console.log({ prodVal });

setProductProperty(product, "inStock", false);
console.log(product);

type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

type MutableProduct = Mutable<Product>;

const mutableProduct: MutableProduct = {
  id: faker.string.nanoid(),
  title: faker.commerce.productName(),
  price: faker.commerce.price(),
  inStock: false,
};

const immutProduct: Product = mutableProduct;

// type Test = {
//   [P in keyof User]: P;
// }[keyof User];

// type Test = {
//   [P in keyof User]: P;
// };

// type Result = Test[keyof User];

type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
    ? true
    : false;

type IsReadonly<T, K extends keyof T> =
  Equal<Pick<T, K>, { -readonly [P in K]: T[P] }> extends true ? false : true;

type A = IsReadonly<User, "id">;
type B = IsReadonly<User, "name">;
type C = IsReadonly<User, "email">;
type D = IsReadonly<User, "isActive">;

type MutableKey<T> = {
  [P in keyof T]: IsReadonly<T, P> extends true ? never : P;
}[keyof T];

type UserMutableKey = MutableKey<User>;

function setObjectProperty<T, K extends MutableKey<T>>(
  data: T,
  key: K,
  value: T[K],
) {
  data[key] = value;
}
