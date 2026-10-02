type Animal = {
  name: string;
};

const value = {
  name: "Bruno",
  breed: "Labrador",
};

// const animal = value as Animal;
const animal = <Animal>value;

type A = typeof value;
type B = typeof animal;
