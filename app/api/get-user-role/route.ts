import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // Obtener token de Clerk
    const { getToken } = await auth();
    const token = await getToken({ template: "convex" }) || await getToken();

    if (!token) {
      return NextResponse.json({ error: "No authentication token" }, { status: 401 });
    }

    // Consultar Convex usando fetch directo a la API HTTP
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "http://127.0.0.1:3210";
    
    // Usar la API HTTP de Convex
    const response = await fetch(`${convexUrl}/api/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        path: "userProfiles:getByUserId",
        args: { userId },
        format: "json",
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[API/get-user-role] Convex API error:", response.status, errorText);
      return NextResponse.json({ error: "Failed to query Convex" }, { status: 500 });
    }

    const data = await response.json();
    const profile = data?.value || null;

    console.log("[API/get-user-role] Profile from Convex:", JSON.stringify(profile, null, 2));

    return NextResponse.json({ role: profile?.role || null });
  } catch (error: any) {
    console.error("[API/get-user-role] Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

