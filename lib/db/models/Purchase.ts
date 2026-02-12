
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPurchase extends Document {
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    unit: string;
  }>;
  totalCost: number;
  storeName?: string;
  date: Date;
}

const PurchaseSchema: Schema = new Schema({
  items: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      unit: { type: String, required: true },
    },
  ],
  totalCost: { type: Number, required: true },
  storeName: { type: String },
  date: { type: Date, required: true, default: Date.now },
});

const Purchase: Model<IPurchase> = mongoose.models.Purchase || mongoose.model<IPurchase>("Purchase", PurchaseSchema);

export default Purchase;
