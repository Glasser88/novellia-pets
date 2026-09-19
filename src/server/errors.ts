/**
 * Domain errors thrown by services. The HTTP layer maps them to status codes
 * in one place (src/server/http.ts) so route handlers never hand-write them.
 */
export class NotFoundError extends Error {
  readonly status = 404;

  constructor(entity: string, id: string) {
    super(`${entity} ${id} not found`);
    this.name = "NotFoundError";
  }
}

export class BadRequestError extends Error {
  readonly status = 400;

  constructor(message: string) {
    super(message);
    this.name = "BadRequestError";
  }
}
