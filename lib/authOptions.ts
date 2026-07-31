import GoogleProvider from "next-auth/providers/google";
import { AuthOptions } from "next-auth";
import connectMongo from "@/lib/mongoose";
import User, { IUser } from "@/models/User";

export const authOptions: AuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                try {
                    await connectMongo(); // Ensure DB is connected before any query

                    const email = user?.email || "";
                    const existingUser = await User.findOne({ email: email });
                    const adminEmails = ["nallamala-webad@ds.study.iitm.ac.in", "nallamala-sec@ds.study.iitm.ac.in"];
                    const isAdmin = adminEmails.includes(email);

                    if (!existingUser && user) {
                        await User.create({
                            name: user.name || "User",
                            email: email,
                            image: user.image || "",
                            role: isAdmin ? 'admin' : 'user', // Grant admin to specific emails
                        });
                    } else if (existingUser && isAdmin && existingUser.role !== 'admin') {
                        // Ensure the specific email has admin role even if user existed previously
                        existingUser.role = 'admin';
                        await existingUser.save();
                    }
                } catch (error) {
                    console.error("Error saving user during sign in:", error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token }) {
            // Fetch the role from the database whenever JWT is created or updated
            if (token.email) {
                try {
                    await connectMongo();
                    const dbUser = await User.findOne({ email: token.email }) as IUser;
                    if (dbUser) {
                        token.role = dbUser.role;
                        token.id = dbUser._id.toString();
                    }
                } catch (e) {
                    console.error(e);
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session?.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
            }
            return session;
        }
    },
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: '/signin', // Custom sign-in page if needed
    }
};
