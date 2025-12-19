import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Endpoint de setup único para hacer admin al email raíz
 * GET /api/setup-admin
 * 
 * Este endpoint busca al usuario por email y lo hace admin
 * Solo funciona para el email configurado como ROOT_ADMIN_EMAIL
 */
export async function GET() {
  try {
    const rootAdminEmail = process.env.ROOT_ADMIN_EMAIL?.toLowerCase() || 
                          process.env.NEXT_PUBLIC_ROOT_ADMIN_EMAIL?.toLowerCase() || 
                          "almontefrederick5@gmail.com";

    console.log(`[setup-admin] Buscando usuario con email: ${rootAdminEmail}`);

    // Obtener el cliente de Clerk (en versiones nuevas es una función async)
    const client = await clerkClient();

    // Buscar usuarios por email
    const users = await client.users.getUserList({
      emailAddress: [rootAdminEmail],
    });

    if (users.data.length === 0) {
      return NextResponse.json(
        { 
          error: `No se encontró ningún usuario con el email: ${rootAdminEmail}`,
          hint: "Asegúrate de haber creado una cuenta con ese email primero en /sign-up"
        },
        { status: 404 }
      );
    }

    const user = users.data[0];
    console.log(`[setup-admin] Usuario encontrado: ${user.id}`);

    // Verificar si ya es admin
    if (user.publicMetadata?.role === "admin") {
      return NextResponse.json({ 
        success: true, 
        message: `El usuario ${rootAdminEmail} ya es admin`,
        userId: user.id
      });
    }

    // Actualizar el publicMetadata del usuario
    await client.users.updateUserMetadata(user.id, {
      publicMetadata: {
        role: "admin",
      },
    });

    console.log(`[setup-admin] ✅ Usuario ${rootAdminEmail} ahora es admin`);

    return NextResponse.json({ 
      success: true, 
      message: `¡El usuario ${rootAdminEmail} ahora es admin!`,
      userId: user.id,
      nextStep: "Cierra sesión y vuelve a iniciar sesión para que los cambios surtan efecto"
    });
  } catch (error: any) {
    console.error("[setup-admin] Error:", error);
    return NextResponse.json(
      { 
        error: error.message || "Error al configurar admin",
        hint: "Asegúrate de que CLERK_SECRET_KEY esté configurado en .env.local"
      },
      { status: 500 }
    );
  }
}

