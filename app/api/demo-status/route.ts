export const runtime = "edge";

export async function GET() {
  return Response.json({
    available: !!process.env.OPENROUTER_API_KEY,
  });
}
