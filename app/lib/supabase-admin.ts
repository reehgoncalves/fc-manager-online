export function getSupabaseAdmin() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!url || !serviceKey) {
    return null;
  }

  return {
    async query(table: string, params: Record<string, string> = {}) {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = `${url}/rest/v1/${table}${queryString ? `?${queryString}` : ""}`;
      const response = await fetch(endpoint, {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) return null;
      return response.json();
    },
  };
}

