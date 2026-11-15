import { connection } from "next/server";

import { isAdminEnabled, readProjects, sanitize, writeProjects } from "@/lib/admin-store";

const notFound = () => Response.json({ error: "Not found" }, { status: 404 });

export async function GET() {
  await connection();
  if (!isAdminEnabled()) return notFound();
  return Response.json(await readProjects());
}

export async function PUT(request: Request) {
  if (!isAdminEnabled()) return notFound();
  try {
    const data = sanitize(await request.json());
    await writeProjects(data);
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
}
