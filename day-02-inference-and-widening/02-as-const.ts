const obj = {
  status: "success",
};

const readonlyObj = {
  status: "success",
} as const;

type A = typeof obj.status;
type B = typeof readonlyObj.status;

const colors = ["red", "green", "blue"];

const readonlyColors = ["red", "green", "blue"] as const;

type C = typeof colors;
type D = typeof readonlyColors;

export {};
