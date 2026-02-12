
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Ingredient from "@/lib/db/models/Ingredient";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const { id } = await params;
  try {
    const body = await request.json();
    const ingredient = await Ingredient.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!ingredient) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: ingredient });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update item" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const { id } = await params;
  try {
    const deletedIngredient = await Ingredient.findByIdAndDelete(id);
    if (!deletedIngredient) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete item" },
      { status: 400 }
    );
  }
}
