
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRecipe extends Document {
  title: string;
  ingredientsUsed: string[];
  missingIngredients: string[];
  steps: string[];
  prepTime: string;
  cookTime: string;
  nutritionSummary: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  createdAt: Date;
}

const RecipeSchema: Schema = new Schema({
  title: { type: String, required: true },
  ingredientsUsed: [{ type: String }],
  missingIngredients: [{ type: String }],
  steps: [{ type: String, required: true }],
  prepTime: { type: String },
  cookTime: { type: String },
  nutritionSummary: {
    calories: { type: Number },
    protein: { type: Number },
    carbs: { type: Number },
    fat: { type: Number },
  },
  createdAt: { type: Date, default: Date.now },
});

const Recipe: Model<IRecipe> = mongoose.models.Recipe || mongoose.model<IRecipe>("Recipe", RecipeSchema);

export default Recipe;
