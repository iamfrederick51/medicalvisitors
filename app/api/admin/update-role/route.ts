import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId: currentUserId } = await auth();
    
    if (!currentUserId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verificar que el usuario actual es admin
    const currentUser = await clerkClient.users.getUser(currentUserId);
    const role = (currentUser.publicMetadata as { role?: string })?.role;
    
    if (role !== "admin") {
      return NextResponse.json({ error: "Only admins can update roles" }, { status: 403 });
    }

    const { userId, newRole } = await req.json();

    if (!userId || !newRole) {
      return NextResponse.json({ error: "userId and newRole are required" }, { status: 400 });
    }

    if (newRole !== "admin" && newRole !== "visitor") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Actualizar publicMetadata en Clerk
    await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        role: newRole,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating role:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

