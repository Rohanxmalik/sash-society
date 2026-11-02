import { toNextJsHandler } from "better-auth/next-js";
import { authRequestHandler } from "@/backend/auth";

export const { GET, POST } = toNextJsHandler(authRequestHandler);
