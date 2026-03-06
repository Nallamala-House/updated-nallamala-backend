import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import connectMongo from '@/lib/mongoose';
import Update from '@/models/Update';
import FileModel from '@/models/File';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
        }

        await connectMongo();

        const { id } = await params;
        const updateId = id;
        const update = await Update.findById(updateId);

        if (!update) {
            return NextResponse.json({ success: false, message: 'Update not found' }, { status: 404 });
        }

        if (update.fileId) {
            await FileModel.findByIdAndDelete(update.fileId);
        }

        await Update.findByIdAndDelete(updateId);

        return NextResponse.json({ success: true, message: 'Update deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

        const { id } = await params;
        const updateId = id;
        const existingUpdate = await Update.findById(updateId);

        if (!existingUpdate) {
            return NextResponse.json({ success: false, message: 'Update not found' }, { status: 404 });
        }

        let fileId: any = existingUpdate.fileId;
        if (file && file.size > 0) {
            if (fileId) {
                await FileModel.findByIdAndDelete(fileId);
            }
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const savedFile = await FileModel.create({
                data: buffer,
                contentType: file.type || 'application/octet-stream',
                filename: file.name || 'upload',
            });
            fileId = savedFile._id;
        }

        const updatedUpdate = await Update.findByIdAndUpdate(
            updateId,
            { title, description, fileId },
            { new: true }
        );

        return NextResponse.json({ success: true, data: updatedUpdate });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
