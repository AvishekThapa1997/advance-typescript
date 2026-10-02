type Config = {
  mode: "development" | "production";
  port: number;
};

const config = {
  mode: "development",
  port: 3000,
} satisfies Config;

type Mode = typeof config.mode;

export {};
