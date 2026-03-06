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

        let queries: any[] = [];
        if (session?.user?.role === 'admin') {
            queries = await Query.find({}).sort({ updatedAt: -1 });
        } else if (session?.user?.email) {
            queries = await Query.find({ userEmail: session.user.email }).sort({ updatedAt: -1 });
        }

        return NextResponse.json({ success: true, count: queries.length, data: queries });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// POST a new query message (User endpoint)
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ success: false, message: 'You must be logged in to ask a question' }, { status: 401 });
        }

        const { question } = await req.json();

        if (!question) {
            return NextResponse.json({ success: false, message: 'Question is required' }, { status: 400 });
        }

        await connectMongo();

        // Check if a query thread already exists for this user email
        let query = await Query.findOne({ userEmail: session.user.email });

        const newMessage = {
            text: question,
            sender: 'user',
            timestamp: new Date()
        };

        if (query) {
            // Append to existing thread
            query.messages.push(newMessage as any);
            query.status = 'pending'; // Re-open the ticket if it was answered
            await query.save();
        } else {
            // Create a brand new thread
            query = await Query.create({
                userId: session.user.id,
                userName: session.user.name || "Unknown User",
                userEmail: session.user.email,
                messages: [newMessage],
                status: 'pending',
            });
        }

        return NextResponse.json({ success: true, data: query });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// PATCH an answer (Admin responding to a query thread)
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

        const query = await Query.findById(id);

        if (!query) {
            return NextResponse.json({ success: false, message: 'Query thread not found' }, { status: 404 });
        }

        const newResponse = {
            text: answer,
            sender: 'admin',
            timestamp: new Date()
        };

        query.messages.push(newResponse as any);
        query.status = 'answered';
        await query.save();

        return NextResponse.json({ success: true, data: query });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
