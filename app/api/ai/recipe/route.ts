import { NextResponse } from "next/server";
import { model } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { ingredients } = await req.json();

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { error: "Invalid ingredients list" },
        { status: 400 }
      );
    }

    const prompt = `
      You are a professional chef. I have the following ingredients: ${ingredients.join(", ")}.
      Suggest 3 creative and delicious recipes using these ingredients. 
      You can assume I have basic pantry staples like salt, pepper, oil, and common spices.
      
      For each recipe, provide:
      1. Recipe Name
      2. Difficulty (Easy/Medium/Hard)
      3. Estimated Time
      4. Brief Description
      5. List of Ingredients (including quantities)
      6. Step-by-step Instructions
      
      Format the output as a valid JSON array of recipe objects. Do not include markdown code block syntax. Just the JSON array.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up markdown code blocks if present
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();

    try {
      const recipes = JSON.parse(cleanedText);
      return NextResponse.json({ recipes });
    } catch (parseError) {
      console.error("Error parsing JSON from Gemini:", parseError);
      return NextResponse.json(
        { error: "Failed to generate valid recipe data" },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Error generating recipe:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
