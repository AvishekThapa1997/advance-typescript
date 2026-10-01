import { faker } from "@faker-js/faker";

function getProperty<T, K extends keyof T>(data: T, key: K) {
  return data[key];
}

function setProperty<T, K extends keyof T>(data: T, key: K, value: T[K]) {
  data[key] = value;
}

type SelectProperties<T, K extends keyof T> = {
  [Key in K]: T[Key];
};

type ExtractKeys<D, T> = {
  [Key in keyof D]-?: D[Key] extends T ? Key : never;
}[keyof D];

type Product = {
  id: number;
  name: string;
  price: number;
  inStock?: boolean;
};

const product: Product = {
  id: faker.number.int(),
  name: faker.commerce.product(),
  price: faker.number.float({
    min: 500,
    max: 5000,
    fractionDigits: 2,
  }),
  inStock: true,
};
console.log({ product });
const name = getProperty(product, "name");
const price = getProperty(product, "price");
const inStock = getProperty(product, "inStock");
console.log("After Updating Property");

setProperty(product, "inStock", false);
console.log({ product });

type CreateProduct = SelectProperties<Product, "inStock" | "name" | "price">;

type ProductNumberKeys = ExtractKeys<Product, number>;
type ProductStringKeys = ExtractKeys<Product, string>;

type ProductStringKeysObj = SelectProperties<
  Product,
  ExtractKeys<Product, string>
>;
