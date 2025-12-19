import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function PostLoginPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/login");
  }

  const role = (user.publicMetadata as { role?: string })?.role;

  if (role === "admin") {
    redirect("/admin");
  }

  redirect("/");
}
