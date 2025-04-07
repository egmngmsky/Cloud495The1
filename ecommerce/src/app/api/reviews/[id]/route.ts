import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Review } from '@/models/Review';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import mongoose from 'mongoose';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Kimlik doğrulama kontrolü
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Geçerli bir MongoDB ID'si mi kontrol et
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid review ID format' }, { status: 400 });
    }
    
    // Veritabanına bağlan
    await connectDB();
    
    // İncelemeyi bul
    const review = await Review.findById(params.id);
    
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }
    
    // Kullanıcının kendi incelemesini sildiğinden emin ol
    if (review.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own reviews' },
        { status: 403 }
      );
    }
    
    // İncelemeyi sil
    await Review.findByIdAndDelete(params.id);
    
    return NextResponse.json({
      message: 'Review deleted successfully',
      success: true
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete review', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
} 