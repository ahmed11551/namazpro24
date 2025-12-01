import { NextRequest, NextResponse } from 'next/server';

// GET /api/v1/goals - получить все цели пользователя
export async function GET(request: NextRequest) {
  try {
    // В реальном приложении здесь будет получение из БД
    return NextResponse.json({
      goals: [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch goals' },
      { status: 500 }
    );
  }
}

// POST /api/v1/goals - создать новую цель
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Валидация
    if (!body.category || !body.target_count) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // В реальном приложении здесь будет сохранение в БД
    const newGoal = {
      id: Date.now().toString(),
      ...body,
      progress: 0,
      status: 'active',
      created_at: new Date().toISOString(),
    };

    return NextResponse.json({ goal: newGoal }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create goal' },
      { status: 500 }
    );
  }
}

