const statuses = {
  pending: 1,
  success: 2,
  failed: 3,
} as const;

type Status = keyof typeof statuses;
type StatusCode = (typeof statuses)[Status];
