import { receiptResponse } from "@/backend/documents/access";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  const { paymentId } = await params;
  return receiptResponse(paymentId);
}
