// SurrealDB HTTP client using REST API
// The JSR SDK has compatibility issues with Deno runtime, so we use HTTP directly
// Using host.docker.internal to access host machine from Docker container

const SURREAL_URL = Deno.env.get("SURREALDB_URL") || "http://host.docker.internal:8000";
const SURREAL_USER = Deno.env.get("SURREALDB_USER") || "root";
const SURREAL_PASSWORD = Deno.env.get("SURREALDB_PASSWORD") || "root";
const SURREAL_NS = Deno.env.get("SURREALDB_NS") || "matchmaking";
const SURREAL_DB = Deno.env.get("SURREALDB_DB") || "fruits";

const SURREAL_AUTH = "Basic " + btoa(`${SURREAL_USER}:${SURREAL_PASSWORD}`);

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

  /**
   * Create a record with proper handling of record references.
   * Fields listed in recordFields will be treated as record references (not quoted as strings).
   */
  async createWithRecords<T = unknown>(
    table: string,
    data: Record<string, unknown>,
    recordFields: string[]
  ): Promise<T> {
    // Build field assignments manually to handle record references
    const assignments: string[] = [];

    for (const [key, value] of Object.entries(data)) {
      if (value === null || value === undefined) {
        continue; // Skip null/undefined values
      }

      if (recordFields.includes(key)) {
        // Record reference - don't quote it
        assignments.push(`${key}: ${value}`);
      } else if (typeof value === "string") {
        // String - escape and quote
        assignments.push(`${key}: "${value.replace(/"/g, '\\"')}"`);
      } else if (typeof value === "object") {
        // Object/array - JSON stringify
        assignments.push(`${key}: ${JSON.stringify(value)}`);
      } else {
        // Number, boolean, etc - use as is
        assignments.push(`${key}: ${value}`);
      }
    }

    const sql = `INSERT INTO ${table} { ${assignments.join(", ")} };`;
    const results = await this.query<T[]>(sql);

    // Check for query-level errors
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
