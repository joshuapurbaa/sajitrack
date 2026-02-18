
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("Missing GEMINI_API_KEY environment variable");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

async function run() {
    const ingredients = ["eggs", "rice", "soy sauce"];
    const targetLanguage = "Indonesian";

    const prompt = `
      You are a professional chef. I have the following ingredients: ${ingredients.join(", ")}.
      Suggest 1 creative and delicious recipe using these ingredients. 
      You can assume I have basic pantry staples like salt, pepper, oil, and common spices.
      
      IMPORTANT: Return the response in ${targetLanguage}.

      For the recipe, provide:
      1. Recipe Name
      2. Difficulty (Easy/Medium/Hard)
      3. Estimated Time
      4. Brief Description
      5. List of Ingredients (including quantities)
      6. Step-by-step Instructions
      
      Format the output as a valid JSON array of recipe objects. Do not include markdown code block syntax. Just the JSON array.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("Response in Indonesian:");
        console.log(text);
    } catch (error) {
        console.error("Error generating content:", error);
    }
}

run();
