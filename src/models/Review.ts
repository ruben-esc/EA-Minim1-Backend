import mongoose, { Document, Schema } from 'mongoose';

export type ReviewCategory = 'CUSTOMER_SERVICE' | 'CLEANLINESS' | 'PRODUCT_QUALITY' | 'LOCATION';

export interface IReviewCriterion {
    category: ReviewCategory;
    score: number;
    comment?: string;
}

export interface IReview {
    storeHostId: mongoose.Types.ObjectId | string;
    authorId: mongoose.Types.ObjectId | string;
    comment: string;
    criteria: IReviewCriterion[];
    overallScore: number;
    isVerified: boolean;
    deleted: boolean;
    deletedAt?: Date | null;
}

export interface IReviewWithId extends IReview {
    _id?: mongoose.Types.ObjectId | string;
}

export interface IReviewModel extends IReview, Document {}

const ReviewSchema: Schema = new Schema(
    {
        storeHostId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        comment: { type: String, required: true, trim: true },
        criteria: [
            {
                category: {
                    type: String,
                    enum: ['CUSTOMER_SERVICE', 'CLEANLINESS', 'PRODUCT_QUALITY', 'LOCATION'],
                    required: true
                },
                score: { type: Number, required: true, min: 1, max: 5 },
                comment: { type: String, trim: true }
            }
        ],
        overallScore: { type: Number, required: true, min: 1, max: 5 },
        isVerified: { type: Boolean, default: false },
        deleted: { type: Boolean, default: false },
        deletedAt: { type: Date, default: null }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

ReviewSchema.index({ storeHostId: 1, deleted: 1 });

export default mongoose.model<IReviewModel>('Review', ReviewSchema);
