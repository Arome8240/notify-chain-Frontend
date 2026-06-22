import { toast } from "@/src/components/ui/use-toast";
import { normalizeError, type NormalizedError } from "./errors";
import { logger } from "./logger";

/**
 * Handle an operational (non-fatal) error in one call: normalize it, log it,
 * and show the user a toast. Use this inside `catch` blocks of user-triggered
 * actions (saving, deleting, future API calls) so the user always gets feedback
 * and the failure is logged consistently.
 *
 * Returns the normalized error in case the caller wants the safe message.
 */
export function notifyError(
  error: unknown,
  context?: Record<string, unknown>
): NormalizedError {
  const normalized = normalizeError(error);

  logger.error(normalized.message, error, context);

  toast({
    variant: "error",
    title: "Something went wrong",
    description: normalized.message,
  });

  return normalized;
}
