import { AppError, normalizeError } from "./errors";

/**
 * Minimal `fetch` wrapper — the **standard to adopt** for real API calls.
 *
 * It is intentionally tiny (not a full HTTP client): it parses JSON and turns
 * non-2xx responses and network failures into a normalized `AppError`, so every
 * caller — and the route error boundaries — get a consistent, user-safe shape.
 * The data layer is currently mock/local; adopt this once real endpoints land.
 *
 * @example
 *   const rules = await fetchJson<Rule[]>("/api/rules");
 */
export async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(input, init);
  } catch (error) {
    const normalized = normalizeError(error);
    throw new AppError(normalized.message, {
      code: normalized.code,
      cause: error,
    });
  }

  if (!response.ok) {
    const normalized = normalizeError(response);
    throw new AppError(normalized.message, {
      code: normalized.code,
      status: response.status,
      cause: response,
    });
  }

  // No-content responses (204/205) and empty bodies have nothing to parse.
  if (response.status === 204 || response.status === 205) {
    return undefined as T;
  }

  const text = await response.text();
  if (text.trim() === "") {
    return undefined as T;
  }

  // Guard JSON parsing so a malformed body surfaces as a normalized AppError
  // instead of leaking a raw SyntaxError from response.json().
  try {
    return JSON.parse(text) as T;
  } catch (error) {
    throw new AppError("Received an invalid response from the server.", {
      code: "invalid_json",
      status: response.status,
      cause: error,
    });
  }
}
