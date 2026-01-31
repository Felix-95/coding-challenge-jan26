// SurrealDB HTTP client for Next.js
// Using REST API for compatibility with Node.js runtime

const SURREAL_URL = process.env.SURREALDB_URL || "http://localhost:8000";
const SURREAL_USER = process.env.SURREALDB_USER || "root";
const SURREAL_PASSWORD = process.env.SURREALDB_PASSWORD || "root";
const SURREAL_NS = process.env.SURREALDB_NS || "matchmaking";
const SURREAL_DB = process.env.SURREALDB_DB || "fruits";

const SURREAL_AUTH = "Basic " + Buffer.from(`${SURREAL_USER}:${SURREAL_PASSWORD}`).toString("base64");

interface SurrealResponse<T = unknown> {
  result: T;
  status: string;
  time: string;
}

class SurrealDBClient {
  private headers: HeadersInit;

  constructor() {
    this.headers = {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": SURREAL_AUTH,
      "surreal-ns": SURREAL_NS,
      "surreal-db": SURREAL_DB,
    };
  }

  async query<T = unknown>(sql: string): Promise<SurrealResponse<T>[]> {
    const response = await fetch(`${SURREAL_URL}/sql`, {
      method: "POST",
      headers: this.headers,
      body: sql,
      cache: "no-store", // Don't cache database queries
    });

    if (!response.ok) {
      throw new Error(`SurrealDB query failed: ${response.statusText}`);
    }

    return await response.json();
  }

  async create<T = unknown>(table: string, data: unknown): Promise<T> {
    // Strip null values recursively - SurrealDB expects fields to be omitted rather than null
    const cleanData = this.stripNulls(data);
    const sql = `INSERT INTO ${table} ${JSON.stringify(cleanData)};`;
    const results = await this.query<T[]>(sql);

    // Check for query-level errors (HTTP was OK but query failed)
    if (results[0]?.status === "ERR") {
      throw new Error(`SurrealDB create failed: ${results[0].result}`);
    }

    // Extract the result from the response
    if (results[0]?.result && Array.isArray(results[0].result)) {
      return results[0].result[0] as T;
    }

    return results[0]?.result as T;
  }

  private stripNulls(obj: unknown): unknown {
    if (obj === null || obj === undefined) {
      return undefined;
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => this.stripNulls(item));
    }
    if (typeof obj === "object") {
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        const stripped = this.stripNulls(value);
        if (stripped !== undefined) {
          result[key] = stripped;
        }
      }
      return result;
    }
    return obj;
  }
}

let db: SurrealDBClient | null = null;

export async function getDb(): Promise<SurrealDBClient> {
  if (!db) {
    db = new SurrealDBClient();
  }
  return db;
}
