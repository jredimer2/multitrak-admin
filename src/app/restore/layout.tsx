import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/session";

export default async function RestoreLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  const token = jar.get("session")?.value || null;
  const session = verifySession(token);
  if (!session) {
    redirect("/auth/login?msg=please_sign_in");
  }
  return <>{children}</>;
}