import { NextResponse } from "next/server";
import { model } from "@/lib/gemini";

export async function POST(req: Request) {
  try {

    const { ingredients, language = 'en' } = await req.json();

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { error: "Invalid ingredients list" },
        { status: 400 }
      );
    }

    const languageMap: Record<string, string> = {
      en: "English",
      es: "Spanish",
      fr: "French",
      de: "German",
      id: "Indonesian",
    };

    const targetLanguage = languageMap[language] || "English";


    const prompt = `
      You are a professional chef. I have the following ingredients: ${ingredients.join(", ")}.
      Suggest 3 creative and delicious recipes using these ingredients. 
      You can assume I have basic pantry staples like salt, pepper, oil, and common spices.
      
      IMPORTANT: Return the response in ${targetLanguage}.

      For each recipe, provide a JSON object with the following keys exactly:
      - "name": Recipe Name
      - "difficulty": Difficulty (Easy/Medium/Hard)
      - "time": Estimated Time
      - "description": Brief Description
      - "ingredients": JSON Array of strings (including quantities)
      - "instructions": JSON Array of strings (step-by-step instructions)
      
      Example format:
      [
        {
          "name": "Spicy Fried Rice",
          "difficulty": "Easy",
          "time": "15 mins",
          "description": "A quick and spicy fried rice.",
          "ingredients": ["2 cups rice", "1 egg", "1 tbsp soy sauce"],
          "instructions": ["Heat oil", "Fry egg", "Add rice and soy sauce"]
        }
      ]

      Format the output as a valid JSON array of recipe objects. Do not include markdown code block syntax. Just the JSON array.
    `;



    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up markdown code blocks if present
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();

    try {
      const recipes = JSON.parse(cleanedText);
      console.log("Generated Recipes:", recipes);
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
