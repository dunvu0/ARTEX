export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly params?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const scheduleCodes = new Set([
  "nameRequired", "timezoneInvalid", "typeInvalid", "startTimeInvalid", "endTimeInvalid",
  "startDateInvalid", "endDateInvalid", "endDateBeforeStart", "endTimeBeforeStart",
  "weekdaysInvalid", "weekdaysRequired", "taskIdsInvalid",
].map((code) => `schedule.${code}`));

// Translate only a recognized contract; old servers and malformed/new codes stay raw.
export function apiErrorMessage(
  error: unknown,
  translate: (code: string, params?: Record<string, string | number>) => string,
): string {
  if (error instanceof ApiError) {
    if (error.code && scheduleCodes.has(error.code)) return translate(error.code);
    if (error.code === "schedule.tooManyTasks") {
      const limit = error.params?.limit;
      if (typeof limit === "number" && Number.isSafeInteger(limit) && limit >= 0) {
        return translate(error.code, { limit });
      }
    }
  }
  return error instanceof Error ? error.message : String(error);
}
