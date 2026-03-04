import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import connectMongo from '@/lib/mongoose';
import Resource from '@/models/Resource';

import FileModel from '@/models/File';

export async function GET() {
    try {
        await connectMongo();
        const resources = await Resource.find({}).populate('fileId').sort({ createdAt: -1 });
        return NextResponse.json({ success: true, count: resources.length, data: resources });
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
        const type = formData.get('type') as 'pdf' | 'video' | 'link';
        const url = formData.get('url') as string;
        const description = formData.get('description') as string;
        const file = formData.get('file') as File;

        if (!title || !type) {
            return NextResponse.json({ success: false, message: 'Title and type are required' }, { status: 400 });
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

        const newResource = await Resource.create({
            title,
            type,
            url: url || undefined,
            fileId,
            description,
        });

        return NextResponse.json({ success: true, data: newResource });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}


export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, message: 'Resource ID is required' }, { status: 400 });
        }

        await connectMongo();
        await Resource.findByIdAndDelete(id);

        return NextResponse.json({ success: true, message: 'Resource deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
