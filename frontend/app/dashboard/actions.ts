"use server";

import { revalidatePath } from "next/cache";

/**
 * Server action to trigger matching by generating a new fruit
 */
export async function runMatching() {
  try {
    // Randomly choose between apple or orange
    const fruitType = Math.random() > 0.5 ? "apple" : "orange";
    const endpoint = fruitType === "apple" 
      ? "get-incoming-apple" 
      : "get-incoming-orange";

    const response = await fetch(
      `http://127.0.0.1:54321/functions/v1/${endpoint}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to call edge function: ${response.statusText}`);
    }

    const data = await response.json();

    // Revalidate the dashboard to show updated counts
    revalidatePath("/dashboard");

    return {
      success: true,
      data,
      fruitType,
    };
  } catch (error) {
    console.error("Error running matching:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
