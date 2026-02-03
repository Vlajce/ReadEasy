interface MongoDuplicateError {
  code: number;
  keyPattern: Record<string, number>;
  keyValue: Record<string, string>;
}

export const isMongoDuplicateError = (
  err: unknown,
): err is MongoDuplicateError => {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as Record<string, unknown>).code === 11000 &&
    "keyPattern" in err &&
    "keyValue" in err
  );
};
