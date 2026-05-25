import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IResource extends Document {
    title: string;
    type: 'pdf' | 'video' | 'link';
    url?: string;
    fileId?: mongoose.Types.ObjectId;
    description?: string;
    
    // Categorization section
    section: 'notes' | 'pyqs' | 'documents';
    
    // Notes fields
    stream?: 'Data Science' | 'Electronics';
    level?: 'Foundation' | 'Diploma' | 'Degree';
    subject?: string;
    resourceType?: 'notes' | 'books';
    
    // PYQs fields
    streamLevel?: string;
    year?: string;
    term?: string;
    examType?: string;
    
    // Documents fields
    subCategory?: string;

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
    },
    section: {
        type: String,
        enum: ['notes', 'pyqs', 'documents'],
        default: 'documents',
        required: true,
    },
    stream: {
        type: String,
        enum: ['Data Science', 'Electronics'],
    },
    level: {
        type: String,
        enum: ['Foundation', 'Diploma', 'Degree'],
    },
    subject: {
        type: String,
    },
    resourceType: {
        type: String,
        enum: ['notes', 'books'],
    },
    streamLevel: {
        type: String,
    },
    year: {
        type: String,
    },
    term: {
        type: String,
    },
    examType: {
        type: String,
    },
    subCategory: {
        type: String,
    }
}, { timestamps: true });

const Resource: Model<IResource> = mongoose.models.Resource || mongoose.model<IResource>('Resource', resourceSchema);

export default Resource;
