// The visitor's 2-letter country, so the phone field defaults to their country
// instead of making them hunt for it. Vercel's geolocation header: free, no
// external API, nothing stored. Null locally, where the header is absent, and
// the field falls back to AE.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const country =
    request.headers.get("x-vercel-ip-country") || request.headers.get("cf-ipcountry") || null;
  return Response.json(
    { country: country && country !== "XX" ? country.toUpperCase() : null },
    { headers: { "cache-control": "no-store" } },
  );
}
