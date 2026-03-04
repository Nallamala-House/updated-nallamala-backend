import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IResource extends Document {
    title: string;
    type: 'pdf' | 'video' | 'link';
    url?: string;
    fileId?: mongoose.Types.ObjectId;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

const resourceSchema: Schema<IResource> = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['pdf', 'video', 'link'],
        required: true,
    },
    url: {
        type: String,
    },
    fileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
    },
    description: {
        type: String,
    }
}, { timestamps: true });

const Resource: Model<IResource> = mongoose.models.Resource || mongoose.model<IResource>('Resource', resourceSchema);

export default Resource;
