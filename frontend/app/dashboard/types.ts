// Fruit data types matching SurrealDB schema

export type ShineFactor = "dull" | "neutral" | "shiny" | "extraShiny";

export interface FruitAttributes {
  size: number | null;
  weight: number | null;
  hasStem: boolean | null;
  hasLeaf: boolean | null;
  hasWorm: boolean | null;
  shineFactor: ShineFactor | null;
  hasChemicals: boolean | null;
}

export interface NumberRange {
  min?: number;
  max?: number;
}

export interface FruitPreferences {
  size?: NumberRange;
  weight?: NumberRange;
  hasStem?: boolean;
  hasLeaf?: boolean;
  hasWorm?: boolean;
  shineFactor?: ShineFactor | ShineFactor[];
  hasChemicals?: boolean;
}

export interface Apple {
  id: string;
  type: "apple";
  attributes: FruitAttributes;
  preferences: FruitPreferences;
}

export interface Orange {
  id: string;
  type: "orange";
  attributes: FruitAttributes;
  preferences: FruitPreferences;
}

export type Fruit = Apple | Orange;
