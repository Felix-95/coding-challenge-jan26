import { getDb } from "./db.ts";
import seedDataJson from "../../../data/raw_apples_and_oranges.json" with { type: "json" };

interface Fruit {
  type: "apple" | "orange";
  attributes: {
    size: number | null;
    weight: number | null;
    hasStem: boolean | null;
    hasLeaf: boolean | null;
    hasWorm: boolean | null;
    shineFactor: string | null;
    hasChemicals: boolean | null;
  };
  preferences: Record<string, unknown>;
}

export async function loadSeedData(clearExisting: boolean = false) {
  const db = await getDb();

  // Load seed data from imported JSON module
  const fruits: Fruit[] = seedDataJson as Fruit[];

  // Separate apples and oranges
  const apples = fruits.filter((f) => f.type === "apple");
  const oranges = fruits.filter((f) => f.type === "orange");

  // Clear existing data if requested
  if (clearExisting) {
    await db.query("DELETE apples;");
    await db.query("DELETE oranges;");
  }

  // Insert apples
  for (const apple of apples) {
    await db.create("apples", {
      type: apple.type,
      attributes: apple.attributes,
      preferences: apple.preferences,
    });
  }

  // Insert oranges
  for (const orange of oranges) {
    await db.create("oranges", {
      type: orange.type,
      attributes: orange.attributes,
      preferences: orange.preferences,
    });
  }

  return {
    applesLoaded: apples.length,
    orangesLoaded: oranges.length,
    totalLoaded: fruits.length,
  };
}
