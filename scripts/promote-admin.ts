/**
 * Promote a Supabase Auth user to admin (editorial access).
 *
 *   npx tsx scripts/promote-admin.ts you@email.com
 */
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config();
import { createClient } from "@supabase/supabase-js";

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    console.error("Usage: npx tsx scripts/promote-admin.ts you@email.com");
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required");
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: list, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (listError) throw listError;

  const user = list.users.find((u) => u.email?.toLowerCase() === email);
  if (!user) {
    console.error(`No auth user found for ${email}. Sign up at /sign-up first.`);
    process.exit(1);
  }

  const { error: metaError } = await supabase.auth.admin.updateUserById(
    user.id,
    {
      app_metadata: {
        ...user.app_metadata,
        role: "admin",
        subscription_tier: "admin",
      },
    },
  );
  if (metaError) throw metaError;

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email,
    role: "admin",
    subscription_tier: "admin",
    updated_at: new Date().toISOString(),
  });
  if (profileError) throw profileError;

  console.log(`Promoted ${email} (${user.id}) to admin.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
