import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId: currentUserId } = await auth();
    
    if (!currentUserId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verificar que el usuario actual es admin
    const currentUser = await clerkClient.users.getUser(currentUserId);
    const role = (currentUser.publicMetadata as { role?: string })?.role;
    
    if (role !== "admin") {
      return NextResponse.json({ error: "Only admins can list users" }, { status: 403 });
    }

    // Obtener todos los usuarios de Clerk (aumentar límite si es necesario)
    const users = await clerkClient.users.getUserList({
      limit: 500,
    });

    // Formatear usuarios
    const formattedUsers = users.data.map((user) => ({
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      fullName: user.fullName || "",
      role: (user.publicMetadata as { role?: string })?.role || "visitor",
      createdAt: user.createdAt,
      imageUrl: user.imageUrl,
    }));

    return NextResponse.json({ users: formattedUsers });
  } catch (error: any) {
    console.error("Error listing users:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

