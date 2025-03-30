import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"; // Corrected import path
import dbConnect from '@/lib/dbConnect';
import User from '@/models/user'; // Corrected import path casing
import mongoose from 'mongoose';

export async function PUT(request) {
  // 1. Get Session/User ID
  const session = await getServerSession(authOptions); 
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  // 2. Get new name from request body
  let body;
  try {
    body = await request.json();
  } catch (e) {
     return NextResponse.json({ success: false, error: 'Invalid request body.' }, { status: 400 });
  }
  const { name } = body;

  // 3. Validate the name
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ success: false, error: 'Invalid name provided.' }, { status: 400 });
  }
  const trimmedName = name.trim();

  // 4. Update database
  try {
    await dbConnect();

    // Ensure userId is a valid ObjectId if necessary (depends on adapter/schema)
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        console.error("Invalid user ID format in session:", userId);
        return NextResponse.json({ success: false, error: 'Internal server error: Invalid user session.' }, { status: 500 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { name: trimmedName },
      { new: true, runValidators: true } // Return the updated document and run schema validators
    );

    if (!updatedUser) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
    }

    console.log(`User ${userId} updated name to: ${trimmedName}`);
    // Return only necessary info, avoid sending back the full user object unless needed
    return NextResponse.json({ success: true, message: 'Profile updated successfully.', name: updatedUser.name });

  } catch (error) {
    console.error(`Error updating profile for user ${userId}:`, error);
    if (error.name === 'ValidationError') {
        return NextResponse.json({ success: false, error: `Validation failed: ${error.message}` }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Server error while updating profile.' }, { status: 500 });
  }
}
