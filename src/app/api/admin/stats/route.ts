import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import connectMongo from '@/lib/mongoose';
import User from '@/models/User';
import Update from '@/models/Update';
import Query from '@/models/Query';
import Resource from '@/models/Resource';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
        }

        await connectMongo();

        const [userCount, updateCount, queryCount, resourceCount] = await Promise.all([
            User.countDocuments(),
            Update.countDocuments(),
            Query.countDocuments(),
            Resource.countDocuments(),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                users: userCount,
                updates: updateCount,
                queries: queryCount,
                resources: resourceCount,
            }
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
