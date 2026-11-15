import { isAdminEnabled, saveThumbnail } from "@/lib/admin-store";

export async function POST(request: Request) {
  if (!isAdminEnabled()) return Response.json({ error: "Not found" }, { status: 404 });
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new Error("No image received.");
    const url = await saveThumbnail(file, String(form.get("name") ?? ""));
    return Response.json({ url });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
}
