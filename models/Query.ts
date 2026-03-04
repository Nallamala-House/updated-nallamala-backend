import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IQuery extends Document {
    userId: Types.ObjectId;
    userName: string;
    userEmail: string;
    question: string;
    answer?: string;
    status: 'pending' | 'answered';
    createdAt: Date;
    updatedAt: Date;
}

const querySchema: Schema<IQuery> = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    userName: {
        type: String,
        required: true,
    },
    userEmail: {
        type: String,
        required: true,
    },
    question: {
        type: String,
        required: true,
    },
    answer: {
        type: String,
        default: null,
    },
    status: {
        type: String,
        enum: ['pending', 'answered'],
        default: 'pending',
    },
}, { timestamps: true });

const Query: Model<IQuery> = mongoose.models.Query || mongoose.model<IQuery>('Query', querySchema);

export default Query;
