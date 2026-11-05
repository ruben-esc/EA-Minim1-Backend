import { NextFunction, Request, Response } from 'express';
import ReviewService from '../services/ReviewService';

const createReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const review = await ReviewService.createReview(req.user!.id, req.body);
        res.status(201).json({ review });
    } catch (error: any) {
        if (error.message === 'STORE_HOST_NOT_FOUND') {
            return res.status(404).json({ message: 'El anfitrión de tienda especificado no existe' });
        }
        next(error);
    }
};

const readReview = async (req: Request<{ reviewId: string }>, res: Response, next: NextFunction) => {
    try {
        const review = await ReviewService.getReviewById(req.params.reviewId, req.user?.role);
        if (review) {
            res.status(200).json({ review });
        } else {
            res.status(404).json({ message: 'not found' });
        }
    } catch (error) {
        next(error);
    }
};

const readAllPaginated = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await ReviewService.getAllReviewsPaginated({
            page: Number(req.query.page),
            limit: Number(req.query.limit),
            sortBy: req.query.sortBy as string,
            sortOrder: req.query.sortOrder as 'asc' | 'desc',
            search: req.query.search as string,
            isVerified: req.query.isVerified === 'true' ? true : req.query.isVerified === 'false' ? false : undefined,
            storeHostId: req.query.storeHostId as string,
            showDeleted: req.query.showDeleted === 'true',
            userRole: req.user?.role
        });
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

const getStoreHostSummary = async (req: Request<{ storeHostId: string }>, res: Response, next: NextFunction) => {
    try {
        const summary = await ReviewService.getStoreHostSummary(req.params.storeHostId);
        res.status(200).json({ summary });
    } catch (error) {
        next(error);
    }
};

const updateReview = async (req: Request<{ reviewId: string }>, res: Response, next: NextFunction) => {
    try {
        const review = await ReviewService.updateReview(req.params.reviewId, req.user!.id, req.user!.role, req.body);
        if (review) {
            res.status(200).json({ review });
        } else {
            res.status(404).json({ message: 'not found' });
        }
    } catch (error: any) {
        if (error.message === 'FORBIDDEN') {
            return res.status(403).json({ message: 'No tienes permiso para modificar esta valoración' });
        }
        next(error);
    }
};

const softDeleteReview = async (req: Request<{ reviewId: string }>, res: Response, next: NextFunction) => {
    try {
        const result = await ReviewService.softDeleteReview(req.params.reviewId, req.user!.id, req.user!.role);
        if (result) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'not found' });
        }
    } catch (error: any) {
        if (error.message === 'FORBIDDEN') {
            return res.status(403).json({ message: 'No tienes permiso para eliminar esta valoración' });
        }
        next(error);
    }
};

const hardDeleteReview = async (req: Request<{ reviewId: string }>, res: Response, next: NextFunction) => {
    try {
        const review = await ReviewService.hardDeleteReview(req.params.reviewId);
        if (review) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'not found' });
        }
    } catch (error) {
        next(error);
    }
};

export default {
    createReview,
    readReview,
    readAllPaginated,
    getStoreHostSummary,
    updateReview,
    softDeleteReview,
    hardDeleteReview
};
