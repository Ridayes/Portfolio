import { isAdminEnabled, saveBehanceCover } from "@/lib/admin-store";

export async function POST(request: Request) {
  if (!isAdminEnabled()) return Response.json({ error: "Not found" }, { status: 404 });
  try {
    const { url, name } = (await request.json()) as { url?: string; name?: string };
    const saved = await saveBehanceCover(String(url ?? ""), String(name ?? ""));
    return Response.json({ url: saved });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
}
