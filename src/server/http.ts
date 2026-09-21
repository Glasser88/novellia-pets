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
export const withErrorHandling = <Ctx>(handler: Handler<Ctx>): Handler<Ctx> => {
  const handleWithErrors: Handler<Ctx> = async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (error) {
      return errorResponse(error);
    }
  };
  return handleWithErrors;
};

export const errorResponse = (error: unknown): NextResponse => {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Validation failed",
        issues: error.issues.map((issue) => ({ path: issue.path, message: issue.message })),
      },
      { status: 400 },
    );
  }

  if (error instanceof UnknownRecordTypeError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (error instanceof NotFoundError || error instanceof BadRequestError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  console.error(error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
};

/** Parse and validate a JSON body. Malformed JSON is a 400, not a 500. */
export const parseBody = async <T>(req: Request, schema: ZodType<T>): Promise<T> => {
  let json: unknown;

  try {
    json = await req.json();
  } catch {
    throw new BadRequestError("Request body must be valid JSON");
  }

  return schema.parse(json);
};
