import { NextRequest, NextResponse } from 'next/server';
import { generatePDFReport } from '@/lib/ereplika';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, prayer_debt, goals, statistics } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: 'Missing user_id' },
        { status: 400 }
      );
    }

    const pdfBlob = await generatePDFReport({
      user_id,
      prayer_debt,
      goals,
      statistics,
    });

    if (!pdfBlob) {
      return NextResponse.json(
        { error: 'Failed to generate PDF' },
        { status: 500 }
      );
    }

    return new NextResponse(pdfBlob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="report-${user_id}-${Date.now()}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

