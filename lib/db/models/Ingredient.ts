
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IIngredient extends Document {
  name: string;
  quantity: number;
  unit: 'kg' | 'g' | 'L' | 'ml' | 'pcs';
  purchaseDate: Date;
  expiryDate?: Date;
  nutrition: {
    calories: number; // per 100g/ml or per unit
    protein: number;
    carbs: number;
    fat: number;
  };
  category: string;
  threshold: number;
}

const IngredientSchema: Schema = new Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  unit: { type: String, enum: ['kg', 'g', 'L', 'ml', 'pcs'], required: true },
  purchaseDate: { type: Date, required: true, default: Date.now },
  expiryDate: { type: Date },
  nutrition: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
  },
  category: { type: String, required: true, default: 'Uncategorized' },
  threshold: { type: Number, default: 1 },
});

// Check if model already exists to prevent overwrite error in dev
const Ingredient: Model<IIngredient> = mongoose.models.Ingredient || mongoose.model<IIngredient>("Ingredient", IngredientSchema);

export default Ingredient;
