import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // Obtener el cliente de Clerk
    const client = await clerkClient();

    // Obtener el usuario de Clerk
    const user = await client.users.getUser(userId);
    const userEmail = user.primaryEmailAddress?.emailAddress?.toLowerCase() || "";
    
    // Obtener el email raíz desde las variables de entorno
    const rootAdminEmail = process.env.ROOT_ADMIN_EMAIL?.toLowerCase() || 
                          process.env.NEXT_PUBLIC_ROOT_ADMIN_EMAIL?.toLowerCase() || 
                          "almontefrederick5@gmail.com";

    // Verificar que el email coincide
    if (userEmail !== rootAdminEmail) {
      return NextResponse.json(
        { error: `Solo el email ${rootAdminEmail} puede usar esta función.` },
        { status: 403 }
      );
    }

    // Actualizar el publicMetadata del usuario
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: "admin",
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Rol actualizado a admin correctamente" 
    });
  } catch (error: any) {
    console.error("Error promoting user to admin:", error);
    return NextResponse.json(
      { error: error.message || "Error al actualizar el rol" },
      { status: 500 }
    );
  }
}

