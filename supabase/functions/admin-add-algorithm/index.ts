import { getDb } from "../_shared/db.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    // Validate required fields
    if (!body.key || !body.name || !body.version || !body.description) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields",
          required: ["key", "name", "version", "description"],
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const db = await getDb();

    // Check if algorithm with this key already exists
    const existing = await db.query(
      `SELECT * FROM matching_algorithm WHERE key = '${body.key}';`
    );

    if (existing[0]?.result && existing[0].result.length > 0) {
      return new Response(
        JSON.stringify({
          error: "Algorithm with this key already exists",
          existing: existing[0].result[0],
        }),
        {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create the algorithm record
    const algorithm = await db.create("matching_algorithm", {
      key: body.key,
      name: body.name,
      version: body.version,
      description: body.description,
      status: body.status || "active",
      defaultConfig: body.defaultConfig,
    });

    return new Response(
      JSON.stringify({
        message: "Algorithm registered successfully",
        algorithm,
      }),
      {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to add algorithm",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
