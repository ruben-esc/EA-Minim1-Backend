import mongoose from 'mongoose';
import Review, { IReview } from '../models/Review';
import User from '../models/User';

export interface ReviewQueryParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    isVerified?: boolean;
    storeHostId?: string;
    showDeleted?: boolean;
    userRole?: string;
}

export const createReview = async (authorId: string, data: Omit<IReview, 'authorId' | 'overallScore' | 'deleted'>) => {
    const hostExists = await User.exists({ _id: data.storeHostId, role: 'STORE_HOST', deleted: false });
    if (!hostExists) {
        throw new Error('STORE_HOST_NOT_FOUND');
    }

    const sum = data.criteria.reduce((acc, curr) => acc + curr.score, 0);
    const overallScore = Number((sum / data.criteria.length).toFixed(1));

    const review = new Review({
        ...data,
        authorId,
        overallScore
    });

    return review.save();
};

export const getReviewById = (reviewId: string, userRole?: string) => {
    const filter: Record<string, unknown> = { _id: reviewId };
    if (userRole !== 'ADMIN') {
        filter.deleted = false;
        filter.deletedAt = null;
    }
    return Review.findOne(filter).populate('authorId', 'name email avatarUrl').populate('storeHostId', 'name email');
};

export const getAllReviewsPaginated = async (params: ReviewQueryParams) => {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 10);
    const skip = (page - 1) * limit;

    const sortBy = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder === 'asc' ? 1 : -1;

    const filter: Record<string, unknown> = {};

    if (params.userRole !== 'ADMIN' || params.showDeleted !== true) {
        filter.deleted = false;
        filter.deletedAt = null;
    }

    if (params.storeHostId) {
        filter.storeHostId = params.storeHostId;
    }

    if (params.search) {
        filter.comment = { $regex: params.search, $options: 'i' };
    }

    if (params.isVerified !== undefined) {
        filter.isVerified = params.isVerified;
    }

    const [reviews, totalCount] = await Promise.all([
        Review.find(filter)
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit)
            .populate('authorId', 'name email avatarUrl'),
        Review.countDocuments(filter)
    ]);

    return {
        data: reviews,
        totalDocs: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page
    };
};

export const getStoreHostSummary = async (storeHostId: string) => {
    const objectId = new mongoose.Types.ObjectId(storeHostId);
    const stats = await Review.aggregate([
        { $match: { storeHostId: objectId, deleted: false } },
        {
            $group: {
                _id: '$storeHostId',
                averageOverall: { $avg: '$overallScore' },
                totalReviews: { $sum: 1 },
                verifiedCount: {
                    $sum: { $cond: [{ $eq: ['$isVerified', true] }, 1, 0] }
                }
            }
        }
    ]);

    if (!stats || stats.length === 0) {
        return { averageOverall: 0, totalReviews: 0, verifiedCount: 0 };
    }

    return {
        averageOverall: Number(stats[0].averageOverall.toFixed(2)),
        totalReviews: stats[0].totalReviews,
        verifiedCount: stats[0].verifiedCount
    };
};

export const updateReview = async (reviewId: string, userId: string, userRole: string, data: Partial<IReview>) => {
    const review = await Review.findOne({ _id: reviewId, deleted: false });
    if (!review) return null;

    if (userRole !== 'ADMIN' && String(review.authorId) !== userId) {
        throw new Error('FORBIDDEN');
    }

    if (data.criteria && data.criteria.length > 0) {
        const sum = data.criteria.reduce((acc, curr) => acc + curr.score, 0);
        data.overallScore = Number((sum / data.criteria.length).toFixed(1));
    }

    Object.assign(review, data);
    return review.save();
};

export const softDeleteReview = async (reviewId: string, userId: string, userRole: string) => {
    const review = await Review.findOne({ _id: reviewId, deleted: false });
    if (!review) return null;

    if (userRole !== 'ADMIN' && String(review.authorId) !== userId) {
        throw new Error('FORBIDDEN');
    }

    review.deleted = true;
    review.deletedAt = new Date();
    return review.save();
};

export const hardDeleteReview = async (reviewId: string) => {
    return Review.findByIdAndDelete(reviewId);
};

export default {
    createReview,
    getReviewById,
    getAllReviewsPaginated,
    getStoreHostSummary,
    updateReview,
    softDeleteReview,
    hardDeleteReview
};
