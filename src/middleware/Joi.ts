import Joi, { ObjectSchema } from 'joi';
import { NextFunction, Request, Response } from 'express';

import { IUser } from '../models/User';
import { IActivity } from '../models/Activity';
import { IReport } from '../models/Report';
import { IReview } from '../models/Review';

// Función que valida los datos del body.
// stripUnknown: true elimina automáticamente campos de sistema (_id, createdAt, etc.) sin lanzar error 422.
export const ValidateJoi = (schema: ObjectSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedBody = await schema.validateAsync(req.body, {
                abortEarly: false,
                stripUnknown: true
            });
            req.body = validatedBody; // Asigna valores por defecto y tipos saneados (ej: Date)
            next();
        } catch (error) {
            next(error);
        }
    };
};

// Un id de MongoDB tiene 24 caracteres hexadecimales
const OBJECT_ID = /^[0-9a-fA-F]{24}$/;

// Comprueba el id que llega en los parámetros de la URL
export const ValidateId = (paramName: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const id = req.params[paramName];

        if (typeof id !== 'string' || !OBJECT_ID.test(id)) {
            return res.status(400).json({ message: `${paramName} no es un id válido` });
        }

        next();
    };
};

// ============================================================================
// ESQUEMAS DE VALIDACIÓN DE LA APLICACIÓN
// ============================================================================
export const Schemas = {
    // ------------------------------------------------------------------------
    // AUTENTICACIÓN Y USUARIOS
    // ------------------------------------------------------------------------
    auth: {
        register: Joi.object({
            name: Joi.string().min(2).required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(6).required(),
            role: Joi.string().valid('USER', 'STORE_HOST', 'ADMIN').default('USER')
        }),
        login: Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().required()
        })
    },

    user: {
        create: Joi.object<IUser>({
            name: Joi.string().min(2).required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(6).required(),
            role: Joi.string().valid('USER', 'STORE_HOST', 'ADMIN').default('USER'),
            avatarUrl: Joi.string().uri().optional(),
            bio: Joi.string().max(500).optional(),
            isBanned: Joi.boolean().optional()
        }),
        update: Joi.object<IUser>({
            name: Joi.string().min(2).optional(),
            email: Joi.string().email().optional(),
            password: Joi.string().min(6).optional(),
            role: Joi.string().valid('USER', 'STORE_HOST', 'ADMIN').optional(),
            avatarUrl: Joi.string().uri().allow('').optional(),
            bio: Joi.string().max(500).allow('').optional(),
            isBanned: Joi.boolean().optional()
        }).min(1)
    },

    // ------------------------------------------------------------------------
    // ACTIVIDADES (DEPORTE Y OCIO)
    // ------------------------------------------------------------------------
    activity: {
        create: Joi.object<IActivity>({
            creatorId: Joi.string().regex(OBJECT_ID).optional(),
            title: Joi.string().required().example('Pachanga 3v3 Baloncesto'),
            description: Joi.string().required().example('Quedada casual para jugar unos partidos'),
            category: Joi.string().valid('SPORT', 'LEISURE').required(),
            subcategory: Joi.string().valid('BASKETBALL', 'RUNNING', 'ARCADE', 'TCG_BOARDGAMES').required(),
            modality: Joi.string().valid('CASUAL', 'ORGANIZED').default('CASUAL'),
            status: Joi.string().valid('OPEN', 'FULL', 'COMPLETED', 'CANCELLED').default('OPEN'),

            location: Joi.object({
                type: Joi.string().valid('Point').default('Point'),
                coordinates: Joi.array().items(Joi.number()).length(2).optional().example([2.0003, 41.2755]),
                addressName: Joi.string().required().example('Pistas UPC Castelldefels'),
                isStoreLocation: Joi.boolean().default(false)
            }).required(),

            route: Joi.object({
                distanceKm: Joi.number().min(0).optional(),
                paceTarget: Joi.string().allow('').optional(),
                path: Joi.object({
                    type: Joi.string().valid('LineString').default('LineString'),
                    coordinates: Joi.array().items(Joi.array().items(Joi.number()).length(2)).min(2).optional()
                })
                    .allow(null)
                    .optional()
            })
                .allow(null)
                .optional(),

            schedule: Joi.object({
                startTime: Joi.date().required(),
                endTime: Joi.date().greater(Joi.ref('startTime')).required()
            }).required(),

            capacity: Joi.object({
                minParticipants: Joi.number().min(1).default(2),
                maxParticipants: Joi.number().min(1).required()
            }).required(),

            pricing: Joi.object({
                price: Joi.number().min(0).default(0),
                prizeInfo: Joi.string().allow('').optional()
            }).default({ price: 0 }),

            participants: Joi.array()
                .items(
                    Joi.object({
                        userId: Joi.string().regex(OBJECT_ID).required(),
                        name: Joi.string().required(),
                        avatarUrl: Joi.string().allow('').optional(),
                        joinedAt: Joi.date().optional()
                    })
                )
                .optional()
        }),

        update: Joi.object<IActivity>({
            creatorId: Joi.string().regex(OBJECT_ID).optional(),
            title: Joi.string().optional(),
            description: Joi.string().optional(),
            category: Joi.string().valid('SPORT', 'LEISURE').optional(),
            subcategory: Joi.string().valid('BASKETBALL', 'RUNNING', 'ARCADE', 'TCG_BOARDGAMES').optional(),
            modality: Joi.string().valid('CASUAL', 'ORGANIZED').optional(),
            status: Joi.string().valid('OPEN', 'FULL', 'COMPLETED', 'CANCELLED').optional(),

            location: Joi.object({
                type: Joi.string().valid('Point').default('Point'),
                coordinates: Joi.array().items(Joi.number()).length(2).optional(),
                addressName: Joi.string().optional(),
                isStoreLocation: Joi.boolean().optional()
            }).optional(),

            route: Joi.object({
                distanceKm: Joi.number().min(0).optional(),
                paceTarget: Joi.string().allow('').optional(),
                path: Joi.object({
                    type: Joi.string().valid('LineString').default('LineString'),
                    coordinates: Joi.array().items(Joi.array().items(Joi.number()).length(2)).min(2).optional()
                })
                    .allow(null)
                    .optional()
            })
                .allow(null)
                .optional(),

            schedule: Joi.object({
                startTime: Joi.date().optional(),
                endTime: Joi.date().optional()
            }).optional(),

            capacity: Joi.object({
                minParticipants: Joi.number().min(1).optional(),
                maxParticipants: Joi.number().min(1).optional()
            }).optional(),

            pricing: Joi.object({
                price: Joi.number().min(0).optional(),
                prizeInfo: Joi.string().allow('').optional()
            }).optional(),

            participants: Joi.array().optional()
        }).min(1)
    },

    // ------------------------------------------------------------------------
    // REPORTES DE MODERACIÓN
    // ------------------------------------------------------------------------
    report: {
        create: Joi.object<IReport>({
            targetType: Joi.string().valid('ACTIVITY', 'USER').required(),
            targetId: Joi.string().regex(OBJECT_ID).required(),
            reason: Joi.string().valid('SPAM', 'INAPPROPRIATE', 'NO_SHOW', 'FAKE_LOCATION', 'OTHER').required(),
            description: Joi.string().min(5).max(1000).required()
        }),
        auth: {
            register: Joi.object({
                name: Joi.string().min(2).required(),
                email: Joi.string().email().required(),
                password: Joi.string().min(6).required()
            }),
            login: Joi.object({
                email: Joi.string().email().required(),
                password: Joi.string().required()
            })
        },

        user: {
            create: Joi.object({
                name: Joi.string().min(2).required(),
                email: Joi.string().email().required(),
                password: Joi.string().min(6).required(),
                role: Joi.string().valid('USER', 'ADMIN').default('USER')
            }),
            update: Joi.object({
                name: Joi.string().min(2),
                email: Joi.string().email(),
                password: Joi.string().min(6),
                role: Joi.string().valid('USER', 'ADMIN')
            }).min(1)
        },

        update: Joi.object<Partial<IReport>>({
            status: Joi.string().valid('PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED').optional(),
            adminNotes: Joi.string().max(500).allow('').optional(),
            reason: Joi.string().valid('SPAM', 'INAPPROPRIATE', 'NO_SHOW', 'FAKE_LOCATION', 'OTHER').optional(),
            description: Joi.string().min(5).max(1000).optional()
        }).min(1)
    },

    // ------------------------------------------------------------------------
    // REVIEWS
    // ------------------------------------------------------------------------

    review: {
        create: Joi.object({
            storeHostId: Joi.string().regex(OBJECT_ID).required(),
            comment: Joi.string().min(5).max(1000).required(),
            criteria: Joi.array()
                .items(
                    Joi.object({
                        category: Joi.string().valid('CUSTOMER_SERVICE', 'CLEANLINESS', 'PRODUCT_QUALITY', 'LOCATION').required(),
                        score: Joi.number().min(1).max(5).required(),
                        comment: Joi.string().allow('').optional()
                    })
                )
                .min(1)
                .required(),
            isVerified: Joi.boolean().optional()
        }),
        update: Joi.object({
            comment: Joi.string().min(5).max(1000).optional(),
            criteria: Joi.array()
                .items(
                    Joi.object({
                        category: Joi.string().valid('CUSTOMER_SERVICE', 'CLEANLINESS', 'PRODUCT_QUALITY', 'LOCATION').required(),
                        score: Joi.number().min(1).max(5).required(),
                        comment: Joi.string().allow('').optional()
                    })
                )
                .min(1)
                .optional(),
            isVerified: Joi.boolean().optional()
        }).min(1)
    }
};
