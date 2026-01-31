"use client";

import { useState } from "react";
import { runMatching } from "./actions";

export function RunMatchingButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const result = await runMatching();
      
      if (result.success) {
        console.log(`✅ Successfully generated and stored new ${result.fruitType}!`);
        console.log("Fruit ID:", result.data.appleId || result.data.orangeId);
        console.log("Communication:", result.data.communication);
      } else {
        console.error("❌ Error:", result.error);
      }
    } catch (error) {
      console.error("❌ Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      className="btn-primary" 
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? "Running..." : "New incoming fruit"}
    </button>
  );
}
