import { certificateResponse } from "@/backend/documents/access";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ membershipId: string }> }
) {
  const { membershipId } = await params;
  return certificateResponse(membershipId);
}
