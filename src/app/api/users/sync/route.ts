import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongoose';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { name, email, image } = await req.json();

        if (!email) {
            return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
        }

        await connectMongo();

        // Check if user already exists
        let user = await User.findOne({ email });

        if (!user) {
            // Check if email belongs to predefined admins
            const adminEmails = ["nallamala-webad@ds.study.iitm.ac.in", "nallamala-webad@ds.study.ac.in"];
            const isAdmin = adminEmails.includes(email);

            // Create new user
            user = await User.create({
                name: name || "User",
                email: email,
                image: image || "",
                role: isAdmin ? 'admin' : 'user',
            });
        } else {
            // Optionally update their name/image if they change it on Google
            let needsUpdate = false;
            if (name && user.name !== name) {
                user.name = name;
                needsUpdate = true;
            }
            if (image && user.image !== image) {
                user.image = image;
                needsUpdate = true;
            }

            if (needsUpdate) {
                await user.save();
            }
        }

        return NextResponse.json({ success: true, data: user });
    } catch (error: any) {
        console.error("User sync error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
