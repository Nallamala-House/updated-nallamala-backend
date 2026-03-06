import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import connectMongo from '@/lib/mongoose';
import Query from '@/models/Query';
import User from '@/models/User';
import mongoose from 'mongoose';

// Helper: Get caller info from session OR trusted proxy headers
async function getCallerInfo(req: NextRequest) {
    // Try session first (works for same-origin / admin panel)
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
        console.log('[Queries] Authenticated via session:', session.user.email, 'role:', session.user.role);
        return {
            email: session.user.email,
            name: session.user.name || "Unknown User",
            role: session.user.role || "user",
            id: (session.user as any).id || "",
        };
    }

    // Fall back to trusted proxy headers (from frontend proxy route)
    // Headers are case-insensitive in HTTP, but Next.js lowercases them
    const secret = req.headers.get('x-internal-secret');
    const expectedSecret = process.env.INTERNAL_API_SECRET;
    if (expectedSecret && secret === expectedSecret) {
        const email = req.headers.get('x-user-email');
        if (email) {
            console.log('[Queries] Authenticated via proxy headers:', email);
            return {
                email,
                name: req.headers.get('x-user-name') || "Unknown User",
                role: req.headers.get('x-user-role') || "user",
                id: req.headers.get('x-user-id') || "",
            };
        }
        console.warn('[Queries] Valid secret but no x-user-email header');
    } else if (secret) {
        console.warn('[Queries] Invalid internal secret provided');
    }

    console.warn('[Queries] No authentication found (no session, no valid proxy headers)');
    return null;
}

// GET all queries (Admin) or User specific (Public)
export async function GET(req: NextRequest) {
    try {
        await connectMongo();
        const caller = await getCallerInfo(req);

        if (!caller?.email) {
            return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
        }

        let queries: any[] = [];
        if (caller?.role === 'admin') {
            queries = await Query.find({}).sort({ updatedAt: -1 });
        } else if (caller?.email) {
            queries = await Query.find({ userEmail: caller.email }).sort({ updatedAt: -1 });
        }

        console.log(`[Queries GET] Found ${queries.length} queries for ${caller.email} (role: ${caller.role})`);
        return NextResponse.json({ success: true, count: queries.length, data: queries });
    } catch (error: any) {
        console.error('[Queries GET] Error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// POST a new query message (User endpoint)
export async function POST(req: NextRequest) {
    try {
        const caller = await getCallerInfo(req);
        if (!caller?.email) {
            return NextResponse.json({ success: false, message: 'You must be logged in to ask a question' }, { status: 401 });
        }

        const { question } = await req.json();

        if (!question) {
            return NextResponse.json({ success: false, message: 'Question is required' }, { status: 400 });
        }

        await connectMongo();

        // Ensure we have a valid userId for Mongoose
        let userId = caller.id;
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            console.log(`[Queries POST] Invalid or missing userId "${userId}", looking up user by email ${caller.email}`);
            const user = await User.findOne({ email: caller.email });
            if (user) {
                userId = user._id.toString();
            } else {
                console.warn(`[Queries POST] User not found by email ${caller.email}, userId will be undefined`);
                userId = undefined as any;
            }
        }

        // Check if a query thread already exists for this user email
        let query = await Query.findOne({ userEmail: caller.email });

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
            console.log(`[Queries POST] Appended message to existing thread for ${caller.email}`);
        } else {
            // Create a brand new thread
            query = await Query.create({
                userId: userId,
                userName: caller.name,
                userEmail: caller.email,
                messages: [newMessage],
                status: 'pending',
            });
            console.log(`[Queries POST] Created new thread for ${caller.email} with userId ${userId}`);
        }

        return NextResponse.json({ success: true, data: query });
    } catch (error: any) {
        console.error('[Queries POST] Error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// PATCH an answer (Admin responding to a query thread)
export async function PATCH(req: NextRequest) {
    try {
        const caller = await getCallerInfo(req);
        if (!caller || caller.role !== 'admin') {
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

        console.log(`[Queries PATCH] Admin responded to query ${id}`);
        return NextResponse.json({ success: true, data: query });
    } catch (error: any) {
        console.error('[Queries PATCH] Error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
