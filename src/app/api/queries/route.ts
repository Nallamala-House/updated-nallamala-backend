import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import connectMongo from '@/lib/mongoose';
import Query from '@/models/Query';

// GET all queries (Admin) or User specific (Public)
export async function GET(req: NextRequest) {
    try {
        await connectMongo();
        const session = await getServerSession(authOptions);

        let queries = [];
        if (session?.user?.role === 'admin') {
            queries = await Query.find({}).sort({ createdAt: -1 });
        } else {
            queries = await Query.find({ status: 'answered' }).sort({ createdAt: -1 });
        }

        return NextResponse.json({ success: true, count: queries.length, data: queries });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// POST a new query (User endpoint, usually used on the frontend site)
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ success: false, message: 'You must be logged in to ask a question' }, { status: 401 });
        }

        const { question } = await req.json();

        if (!question) {
            return NextResponse.json({ success: false, message: 'Question is required' }, { status: 400 });
        }

        await connectMongo();
        const newQuery = await Query.create({
            userId: session.user.id,
            userName: session.user.name || "Unknown User",
            userEmail: session.user.email || "Unknown Email",
            question,
            status: 'pending',
        });

        return NextResponse.json({ success: true, data: newQuery });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// PATCH an answer (Admin responding to a query)
export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
        }

        const { id, answer } = await req.json();

        if (!id || !answer) {
            return NextResponse.json({ success: false, message: 'ID and answer are required' }, { status: 400 });
        }

        await connectMongo();
        const query = await Query.findByIdAndUpdate(
            id,
            { answer, status: 'answered' },
            { new: true }
        );

        if (!query) {
            return NextResponse.json({ success: false, message: 'Query not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: query });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
