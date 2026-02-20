import { NextResponse } from "next/server";
import { model } from "@/lib/gemini";

export async function POST(req: Request) {
    try {
        const { prompt, language = 'en', recentPurchases = [] } = await req.json();

        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json(
                { error: "Invalid prompt" },
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

        const systemPrompt = `
      You are a professional AI grocery planner. The user wants to plan their grocery shopping based on a specific request.
      
      User Request: "${prompt}"
      
      Recent Purchase History (for context, you can suggest related or previously bought items if relevant, but prioritize the user's request):
      ${recentPurchases.length > 0 ? JSON.stringify(recentPurchases, null, 2) : "No recent purchases."}
      
      Based on the user's request, provide a list of recommended grocery items to buy.
      
      IMPORTANT: Return the response in ${targetLanguage}.

      For each recommended item, provide a JSON object with the following keys exactly:
      - "name": The name of the grocery item.
      - "quantity": The recommended quantity (as a string or number, e.g., "1", "500", 2).
      - "unit": The unit for the quantity (e.g., "kg", "g", "L", "ml", "pcs", "bunch", "pack").
      - "estimatedPrice": Provide a rough estimated total price for this item quantity based on typical market prices (as a number, e.g., 15000). Use the local currency appropriate for the language, or just a general number if unsure. If the prompt specifies a budget in a currency (like Rupiah), use that currency's typical scale.
      - "reason": A brief reason why this item is recommended based on the user's prompt (e.g., "Rich in protein", "Lasts for a week without fridge").
      
      Example format:
      [
        {
          "name": "Tempeh",
          "quantity": "2",
          "unit": "pcs",
          "estimatedPrice": 10000,
          "reason": "High protein and affordable"
        },
        {
          "name": "Carrots",
          "quantity": "500",
          "unit": "g",
          "estimatedPrice": 12000,
          "reason": "Rich in vitamins, lasts long at room temp"
        }
      ]

      Format the output as a valid JSON array of grocery item objects. Do not include markdown code block syntax. Just the JSON array. Make sure the estimated prices sum up to approximately the budget if a budget is specified.
    `;

        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();

        try {
            const items = JSON.parse(cleanedText);
            console.log("Generated Grocery Plan:", items);
            return NextResponse.json({ items });
        } catch (parseError) {
            console.error("Error parsing JSON from Gemini:", parseError);
            return NextResponse.json(
                { error: "Failed to generate valid grocery plan data" },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error("Error generating grocery plan:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
