/**
 * Minimal client for our own REST API. Client components use this for writes;
 * pages read through the service layer directly on the server.
 */

/** Shape shared by Zod issues and the API's error responses. */
export interface ApiIssue {
  path: PropertyKey[];
  message: string;
}

/** Validation issues keyed by top-level field name, for showing under inputs. */
export function fieldErrorsFrom(issues: ApiIssue[]): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const field = String(issue.path[0] ?? "");
    if (!errors[field]) errors[field] = issue.message;
  }
  return errors;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly issues: ApiIssue[] = [],
  ) {
    super(message);
    this.name = "ApiError";
  }

  fieldErrors(): Record<string, string> {
    return fieldErrorsFrom(this.issues);
  }
}

export async function api<T>(
  path: string,
  options: { method?: "GET" | "POST" | "PATCH" | "DELETE"; body?: unknown } = {},
): Promise<T> {
  const response = await fetch(path, {
    method: options.method ?? "GET",
    headers: options.body !== undefined ? { "content-type": "application/json" } : undefined,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 204) return undefined as T;

  const json = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(json?.error ?? response.statusText, response.status, json?.issues ?? []);
  }
  return json as T;
}
