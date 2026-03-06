import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IMessage {
    text: string;
    sender: 'user' | 'admin';
    timestamp: Date;
}

export interface IQuery extends Document {
    userId: Types.ObjectId;
    userName: string;
    userEmail: string;
    messages: IMessage[];
    status: 'pending' | 'answered';
    createdAt: Date;
    updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
    text: { type: String, required: true },
    sender: { type: String, enum: ['user', 'admin'], required: true },
    timestamp: { type: Date, default: Date.now }
});

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
    messages: [messageSchema],
    status: {
        type: String,
        enum: ['pending', 'answered'],
        default: 'pending',
    },
}, { timestamps: true });

const Query: Model<IQuery> = mongoose.models.Query || mongoose.model<IQuery>('Query', querySchema);

export default Query;
