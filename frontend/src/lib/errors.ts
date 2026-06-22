/**
 * Framework-agnostic error normalization.
 *
 * Converts anything thrown (an `Error`, a fetch `Response`, an axios-like error,
 * a string, or an unknown value) into a single `NormalizedError` shape with a
 * **user-safe message**. It never surfaces stack traces or internal details to
 * the UI — the original value is kept under `cause` strictly for logging.
 */

export interface NormalizedError {
  /** Safe, human-readable message to show the user. */
  message: string;
  /** Machine-readable code (HTTP status or app code) when known. */
  code?: string;
  /** HTTP status when the error originated from a response. */
  status?: number;
  /** Original error — for logging only, never render this to users. */
  cause?: unknown;
}

const GENERIC_MESSAGE = "Something went wrong. Please try again.";

const STATUS_MESSAGES: Record<number, string> = {
  400: "The request was invalid. Please check your input and try again.",
  401: "Your session has expired. Please sign in again.",
  403: "You don't have permission to do that.",
  404: "We couldn't find what you were looking for.",
  408: "The request timed out. Please try again.",
  409: "That action conflicts with the current state. Refresh and try again.",
  422: "Some of the information provided is invalid.",
  429: "Too many requests. Please slow down and try again shortly.",
  500: "Something went wrong on our end. Please try again.",
  502: "The service is temporarily unavailable. Please try again.",
  503: "The service is temporarily unavailable. Please try again.",
  504: "The request timed out. Please try again.",
};

function messageForStatus(status: number): string {
  if (STATUS_MESSAGES[status]) return STATUS_MESSAGES[status];
  if (status >= 500) return STATUS_MESSAGES[500];
  if (status >= 400) return "The request could not be completed.";
  return GENERIC_MESSAGE;
}

/**
 * An error whose `message` is deliberately safe to show to end users. Throw
 * this when you want a specific, user-facing message (e.g. validation);
 * anything else is collapsed to a generic message by `normalizeError`.
 */
export class AppError extends Error {
  readonly code?: string;
  readonly status?: number;
  readonly isUserFacing = true;

  constructor(
    message: string,
    options?: { code?: string; status?: number; cause?: unknown }
  ) {
    super(message);
    this.name = "AppError";
    this.code = options?.code;
    this.status = options?.status;
    if (options?.cause !== undefined) this.cause = options.cause;
  }
}

type AxiosLikeError = {
  response?: { status?: number };
  message?: string;
};

function isAxiosLike(error: unknown): error is AxiosLikeError {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as AxiosLikeError).response === "object"
  );
}

export function normalizeError(error: unknown): NormalizedError {
  // Messages we explicitly marked as user-facing.
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      status: error.status,
      cause: error.cause ?? error,
    };
  }

  // A fetch Response (non-2xx passed straight in).
  if (typeof Response !== "undefined" && error instanceof Response) {
    return {
      message: messageForStatus(error.status),
      code: String(error.status),
      status: error.status,
      cause: error,
    };
  }

  // axios-style error with a `.response.status`.
  if (isAxiosLike(error)) {
    const status = error.response?.status;
    if (typeof status === "number") {
      return {
        message: messageForStatus(status),
        code: String(status),
        status,
        cause: error,
      };
    }
  }

  // fetch throws a TypeError on network/connection failure.
  if (error instanceof TypeError) {
    return {
      message: "Network error. Check your connection and try again.",
      code: "network_error",
      cause: error,
    };
  }

  // Any other Error: keep it generic so internal messages don't leak.
  if (error instanceof Error) {
    return { message: GENERIC_MESSAGE, code: error.name, cause: error };
  }

  return { message: GENERIC_MESSAGE, cause: error };
}

/** Convenience: the user-safe message for any thrown value. */
export function getErrorMessage(error: unknown): string {
  return normalizeError(error).message;
}
