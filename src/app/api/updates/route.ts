import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import connectMongo from '@/lib/mongoose';
import Update from '@/models/Update';

import FileModel from '@/models/File';

export async function GET() {
    try {
        await connectMongo();
        const updates = await Update.find({}).populate('fileId').sort({ createdAt: -1 });
        return NextResponse.json({ success: true, count: updates.length, data: updates });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
        }

        const formData = await req.formData();
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const file = formData.get('file') as File;

        if (!title || !description) {
            return NextResponse.json({ success: false, message: 'Please provide title and description' }, { status: 400 });
        }

        await connectMongo();

        let fileId: any = undefined;
        if (file && file.size > 0) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const savedFile = await FileModel.create({
                data: buffer,
                contentType: file.type || 'application/octet-stream',
                filename: file.name || 'upload',
            });
            fileId = savedFile._id;
        }

        const newUpdate = await Update.create({
            title,
            description,
            fileId,
        });

        return NextResponse.json({ success: true, data: newUpdate });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

