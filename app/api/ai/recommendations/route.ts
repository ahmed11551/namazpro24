import { NextRequest, NextResponse } from 'next/server';
import { generateRecommendations, analyzeTrends } from '@/lib/ai-recommendations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_profile } = body;

    if (!user_profile) {
      return NextResponse.json(
        { error: 'Missing user_profile' },
        { status: 400 }
      );
    }

    const recommendations = generateRecommendations(user_profile);
    const trends = analyzeTrends(user_profile);

    return NextResponse.json({
      recommendations,
      trends,
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}

