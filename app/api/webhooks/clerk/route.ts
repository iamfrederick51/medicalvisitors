import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convexClient = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local");
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occurred", {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, public_metadata } = evt.data;
    
    // Sincronizar usuario a Convex
    // IMPORTANTE: Rol por defecto es "visitor" para usuarios nuevos
    try {
      await convexClient.mutation(api.userProfiles.syncFromClerk, {
        userId: id,
        email: email_addresses[0]?.email_address || "",
        name: first_name && last_name ? `${first_name} ${last_name}` : first_name || last_name || undefined,
        // Si el usuario ya tiene rol en Clerk, usarlo; si no, será "visitor" por defecto
        role: (public_metadata as { role?: string })?.role,
      });
    } catch (error) {
      console.error("Error syncing user to Convex:", error);
    }
  }

  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, public_metadata } = evt.data;
    
    // Actualizar usuario en Convex
    try {
      await convexClient.mutation(api.userProfiles.syncFromClerk, {
        userId: id,
        email: email_addresses[0]?.email_address || "",
        name: first_name && last_name ? `${first_name} ${last_name}` : first_name || last_name || undefined,
        role: (public_metadata as { role?: string })?.role,
      });
    } catch (error) {
      console.error("Error updating user in Convex:", error);
    }
  }

  return new Response("", { status: 200 });
}

