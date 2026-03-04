import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IFile extends Document {
    data: Buffer;
    contentType: string;
    filename: string;
    createdAt: Date;
    updatedAt: Date;
}

const fileSchema: Schema<IFile> = new mongoose.Schema({
    data: {
        type: Buffer,
        required: true,
    },
    contentType: {
        type: String,
        required: true,
    },
    filename: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const File: Model<IFile> = mongoose.models.File || mongoose.model<IFile>('File', fileSchema);

export default File;
