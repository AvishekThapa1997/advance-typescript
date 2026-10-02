type Config = {
  host: string;
  port: number;
  environment: "development" | "production";
  debug: boolean;
};

const config: Config = {
  host: "http://localhost",
  port: 8080,
  environment: "development",
  debug: true,
};

function getConfigType<K extends keyof Config>(
  config: Config,
  key: K,
): Config[K] {
  return config[key];
}

const debugType = getConfigType(config, "environment"); // production | development

type FeatureFlags = {
  darkMode: boolean;
  betaAccess: boolean;
  environment: string;
  version: string;
  retryCount: number;
};

type ExtractKey<T> = {
  [P in keyof T]: T[P] extends boolean ? P : never;
}[keyof T];

type SelectProperties<T, K extends keyof T> = {
  [P in K]: T[P];
};

type BooleanFeatureFlagKey = SelectProperties<
  FeatureFlags,
  ExtractKey<FeatureFlags>
>;

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
  },
} as const;

type EndPoints = typeof endPoints;
type EnabledEndPoints = {
  [K in keyof EndPoints]: EndPoints[K]["enable"] extends true ? K : never;
}[keyof EndPoints];
type CreateUserAction = typeof endPoints.deleteUser;
