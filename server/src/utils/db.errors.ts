export const isMongoDuplicateError = (
  err: unknown,
): err is { code: number } => {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as Record<string, unknown>).code === 11000
  );
};
