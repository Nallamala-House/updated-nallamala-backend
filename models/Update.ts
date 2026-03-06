import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IUpdate extends Document {
    title: string;
    description: string;
    fileId?: mongoose.Types.ObjectId;
    badgeText?: string;
    statusText?: string;
    secondaryTitle?: string;
    buttonText?: string;
    buttonLink?: string;
    links?: { text: string; url: string }[];
    additionalImages?: { fileId: mongoose.Types.ObjectId; description?: string }[];
    createdAt: Date;
    updatedAt: Date;
}

const updateSchema: Schema<IUpdate> = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    fileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
    },
    badgeText: {
        type: String,
        default: 'Update',
    },
    statusText: {
        type: String,
    },
    secondaryTitle: {
        type: String,
    },
    buttonText: {
        type: String,
    },
    buttonLink: {
        type: String,
    },
    links: [{
        text: String,
        url: String,
    }],
    additionalImages: [{
        fileId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'File',
        },
        description: String,
    }],
}, { timestamps: true });

const Update: Model<IUpdate> = mongoose.models.Update || mongoose.model<IUpdate>('Update', updateSchema);

export default Update;
