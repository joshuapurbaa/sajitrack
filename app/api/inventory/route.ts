
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Ingredient from '@/lib/db/models/Ingredient';

export async function GET() {
  await dbConnect();
  try {
    const ingredients = await Ingredient.find({}).sort({ name: 1 });
    return NextResponse.json({ success: true, data: ingredients });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await dbConnect();
  try {
    const body = await request.json();
    const ingredient = await Ingredient.create(body);
    return NextResponse.json({ success: true, data: ingredient }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to add item' }, { status: 400 });
  }
}
