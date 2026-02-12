
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Purchase from '@/lib/db/models/Purchase';

export async function GET() {
  await dbConnect();
  try {
    const purchases = await Purchase.find({}).sort({ date: -1 }).limit(50);
    return NextResponse.json({ success: true, data: purchases });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await dbConnect();
  try {
    const body = await request.json();
    const purchase = await Purchase.create(body);
    return NextResponse.json({ success: true, data: purchase }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 400 });
  }
}
