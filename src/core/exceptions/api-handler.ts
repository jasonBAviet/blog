import { NextResponse } from "next/server";
import { logger } from "@/src/config/logger";
import { HttpError } from "./http-error";

type ApiHandler<T extends Request = Request> = (req: T, context?: any) => Promise<NextResponse>;

export function withErrorHandler<T extends Request = Request>(handler: ApiHandler<T>): ApiHandler<T> {
  return async (req: T, context?: any) => {
    try {
      return await handler(req, context);
    } catch (error: any) {
      // Log lỗi chi tiết trên server
      logger.error(`API Error at ${req.url}: ${error?.message}`, error);

      // Lỗi nghiệp vụ có status code rõ ràng (validation / not found / conflict ...)
      if (error instanceof HttpError) {
        // Không lộ chi tiết với lỗi hệ thống (5xx)
        const body =
          error.statusCode >= 500
            ? { error: "Lỗi hệ thống, vui lòng thử lại sau" }
            : { error: error.message };
        return NextResponse.json(body, { status: error.statusCode });
      }

      // Lỗi không phân loại được => lỗi hệ thống chung
      return NextResponse.json({ error: "Lỗi hệ thống, vui lòng thử lại sau" }, { status: 500 });
    }
  };
}
