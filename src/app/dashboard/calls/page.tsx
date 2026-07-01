import { createClient } from "@/lib/supabase/server";
import { CallsTable } from "./calls-table";

export default async function CallsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_user_id", user.id)
    .single();

  if (!business) return null;

  const { data: calls } = await supabase
    .from("calls")
    .select("*")
    .eq("business_id", business.id)
    .order("started_at", { ascending: false });

  return (
    <div>
      <h1 className="text-xl font-semibold">Aramalar</h1>
      <p className="mt-1 text-sm text-gray-500">
        Gelen tüm çağrıların listesi ve detayları.
      </p>
      
      {calls && calls.length > 0 ? (
        <CallsTable initialCalls={calls} />
      ) : (
        <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-6 text-sm text-center text-gray-500">
          Henüz kayıtlı bir arama yok.
        </div>
      )}
    </div>
  );
}
