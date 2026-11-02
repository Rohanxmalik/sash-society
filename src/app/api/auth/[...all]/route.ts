import { toNextJsHandler } from "better-auth/next-js";
import { authRequestHandler } from "@/lib/auth";

export const { GET, POST } = toNextJsHandler(authRequestHandler);
