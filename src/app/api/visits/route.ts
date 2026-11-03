import { recordVisitResponse, visitTotalResponse } from "@/backend/visits/routes";

export function GET() {
  return visitTotalResponse();
}

export function POST(request: Request) {
  return recordVisitResponse(request);
}
