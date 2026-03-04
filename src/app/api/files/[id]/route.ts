import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/mongoose';
import File from '@/models/File';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectMongo();
        const file = await File.findById(id);

        if (!file) {
            return new Response('File not found', { status: 404 });
        }

        return new Response(file.data as any, {
            headers: {
                'Content-Type': file.contentType,
                'Content-Disposition': `inline; filename="${file.filename}"`,
            },
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

