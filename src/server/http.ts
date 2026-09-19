import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";
import { UnknownRecordTypeError } from "@/shared/recordTypes";
import { BadRequestError, NotFoundError } from "./errors";

type Handler<Ctx> = (req: Request, ctx: Ctx) => Promise<Response>;

/**
 * Wraps a route handler so thrown domain/validation errors become JSON error
 * responses with the right status. Anything unexpected is logged and hidden
 * behind a 500.
 */
export function route<Ctx>(handler: Handler<Ctx>): Handler<Ctx> {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      return errorResponse(err);
    }
  };
}

export function errorResponse(err: unknown): NextResponse {
  if (err instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Validation failed",
        issues: err.issues.map((i) => ({ path: i.path, message: i.message })),
      },
      { status: 400 },
    );
  }
  if (err instanceof UnknownRecordTypeError) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
  if (err instanceof NotFoundError || err instanceof BadRequestError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  console.error(err);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

/** Parse and validate a JSON body. Malformed JSON is a 400, not a 500. */
export async function parseBody<T>(req: Request, schema: ZodType<T>): Promise<T> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    throw new BadRequestError("Request body must be valid JSON");
  }
  return schema.parse(json);
}
