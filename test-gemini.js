
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("Missing GEMINI_API_KEY environment variable");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
// Testing with a very standard model to verify connectivity
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

async function run() {
    try {
        const prompt = "Explain how AI works in one sentence.";
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("Success with gemini-flash-latest:");
        console.log(text);
    } catch (error) {
        console.error("Error generating content with gemini-flash-latest:", error);
    }
}

run();
