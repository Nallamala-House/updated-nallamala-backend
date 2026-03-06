import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import connectMongo from '@/lib/mongoose';
import Update from '@/models/Update';

import FileModel from '@/models/File';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        await connectMongo();
        const updates = await Update.find({}).populate('fileId').sort({ createdAt: -1 });
        return NextResponse.json(
            { success: true, count: updates.length, data: updates },
            {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                    'Pragma': 'no-cache',
                },
            }
        );
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

        // New customization fields
        const badgeText = formData.get('badgeText') as string;
        const statusText = formData.get('statusText') as string;
        const secondaryTitle = formData.get('secondaryTitle') as string;
        const buttonText = formData.get('buttonText') as string;
        const buttonLink = formData.get('buttonLink') as string;
        const linksJson = formData.get('links') as string;
        const additionalImagesJson = formData.get('additionalImages') as string;

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

        // Parse links
        let links = [];
        if (linksJson) {
            try {
                links = JSON.parse(linksJson);
            } catch (e) {
                console.error("Failed to parse links:", e);
            }
        }

        // Parse additional images and their descriptions
        // Note: For now, we assume additionalImagesJson contains an array of { description: string, tempId: string }
        // and files are sent with keys like `additionalFile_${tempId}`
        let additionalImages = [];
        if (additionalImagesJson) {
            try {
                const imgData = JSON.parse(additionalImagesJson);
                for (const item of imgData) {
                    const imgFile = formData.get(`additionalFile_${item.tempId}`) as File;
                    if (imgFile && imgFile.size > 0) {
                        const bytes = await imgFile.arrayBuffer();
                        const buffer = Buffer.from(bytes);
                        const savedFile = await FileModel.create({
                            data: buffer,
                            contentType: imgFile.type || 'application/octet-stream',
                            filename: imgFile.name || 'upload',
                        });
                        additionalImages.push({
                            fileId: savedFile._id,
                            description: item.description
                        });
                    }
                }
            } catch (e) {
                console.error("Failed to parse additional images:", e);
            }
        }

        const newUpdate = await Update.create({
            title,
            description,
            fileId,
            badgeText,
            statusText,
            secondaryTitle,
            buttonText,
            buttonLink,
            links,
            additionalImages
        });

        return NextResponse.json({ success: true, data: newUpdate });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

