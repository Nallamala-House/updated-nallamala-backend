import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IUpdate extends Document {
    title: string;
    description: string;
    fileId?: mongoose.Types.ObjectId;
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
}, { timestamps: true });

const Update: Model<IUpdate> = mongoose.models.Update || mongoose.model<IUpdate>('Update', updateSchema);

export default Update;
