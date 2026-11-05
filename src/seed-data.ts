import { IUser } from './models/User';
import { IActivity } from './models/Activity';
import { IReport } from './models/Report';
import { IReviewWithId } from './models/Review';

import mongoose from 'mongoose';

// Datos iniciales de las cuentas y sus permisos.
// La contraseña de administrador se cifra antes de guardarse.
export const DEFAULT_ADMIN: Partial<IUser> = {
    name: 'Administrador',
    email: 'admin@backoffice.com',
    password: 'admin123',
    role: 'ADMIN',
    bio: 'Administrador principal del Backoffice'
};

export const SEED_USERS: Partial<IUser>[] = [
    DEFAULT_ADMIN,
    {
        name: 'Goblin Games Store',
        email: 'tienda@goblingames.com',
        password: 'sprint1',
        role: 'STORE_HOST',
        bio: 'Tienda especializada en TCG y juegos de mesa'
    },
    {
        name: 'Marc R.',
        email: 'marc@usuario.com',
        password: 'sprint1',
        role: 'USER',
        bio: 'Aficionado al baloncesto y running'
    },
    {
        name: 'Laura S.',
        email: 'laura@usuario.com',
        password: 'sprint1',
        role: 'USER',
        bio: 'Jugadora de cartas coleccionables'
    }
];

// Crea actividades de ejemplo y las relaciona con las cuentas del seed.
export const getSeedActivities = (adminId: string, storeId: string, userId: string): Partial<IActivity>[] => [
    {
        creatorId: userId,
        title: 'Pachanga 3v3 Baloncesto UPC',
        description: 'Buscamos 2 personas más para completar partido casual de basket en las pistas exteriores.',
        category: 'SPORT',
        subcategory: 'BASKETBALL',
        modality: 'CASUAL',
        status: 'OPEN',
        location: {
            type: 'Point',
            coordinates: [2.0003, 41.2755],
            addressName: 'Pistas Campus PMT UPC, Castelldefels',
            isStoreLocation: false
        },
        schedule: {
            startTime: new Date(Date.now() + 86400000), // Empieza dentro de un día.
            endTime: new Date(Date.now() + 93600000)
        },
        capacity: {
            minParticipants: 4,
            maxParticipants: 6
        },
        pricing: {
            price: 0
        },
        participants: [
            {
                userId: userId,
                name: 'Marc R.',
                joinedAt: new Date()
            }
        ]
    },
    {
        creatorId: storeId,
        title: 'Torneo Local One Piece TCG',
        description: 'Torneo semanal en tienda física. Construido a 50 cartas. Premios para el TOP 4.',
        category: 'LEISURE',
        subcategory: 'TCG_BOARDGAMES',
        modality: 'ORGANIZED',
        status: 'OPEN',
        location: {
            type: 'Point',
            coordinates: [2.17, 41.387],
            addressName: 'Carrer Major 15, Goblin Games',
            isStoreLocation: true
        },
        schedule: {
            startTime: new Date(Date.now() + 172800000), // Empieza dentro de dos días.
            endTime: new Date(Date.now() + 187200000)
        },
        capacity: {
            minParticipants: 8,
            maxParticipants: 16
        },
        pricing: {
            price: 5.0,
            prizeInfo: 'Sobres de expansión para los mejores clasificados'
        },
        participants: []
    },
    {
        creatorId: userId,
        title: 'Entrenamiento Running 5K Paseo Marítimo',
        description: 'Salida suave a ritmo de 5:30 min/km por el paseo marítimo.',
        category: 'SPORT',
        subcategory: 'RUNNING',
        modality: 'CASUAL',
        status: 'OPEN',
        location: {
            type: 'Point',
            coordinates: [1.98, 41.265],
            addressName: 'Monumento Rosa dels Vents',
            isStoreLocation: false
        },
        route: {
            distanceKm: 5.2,
            paceTarget: '5:30 min/km',
            path: {
                type: 'LineString',
                coordinates: [
                    [1.98, 41.265],
                    [1.985, 41.267],
                    [1.99, 41.269]
                ]
            }
        },
        schedule: {
            startTime: new Date(Date.now() + 259200000), // Empieza dentro de tres días.
            endTime: new Date(Date.now() + 262800000)
        },
        capacity: {
            minParticipants: 2,
            maxParticipants: 10
        },
        pricing: {
            price: 0
        },
        participants: []
    }
];

// Crea reportes de ejemplo relacionados con las cuentas y actividades generadas.
export const getSeedReports = (reporterId: string, activityId: string): Partial<IReport>[] => [
    {
        reporterId: reporterId,
        targetType: 'ACTIVITY',
        targetId: activityId,
        reason: 'SPAM',
        description: 'Evento publicado de forma duplicada varias veces en el mismo día.',
        status: 'PENDING'
    },
    {
        reporterId: reporterId,
        targetType: 'USER',
        targetId: reporterId,
        reason: 'INAPPROPRIATE',
        description: 'Comportamiento inadecuado en el chat del grupo.',
        status: 'REVIEWED',
        adminNotes: 'En revisión por el equipo de soporte.'
    }
];

// Mínimo 1: Valoraciones
export const SEED_STORE_HOST_ID = '654321098765432109876550';
export const SEED_USER_AUTHOR_ID = '654321098765432109876543';

export const initialReviews: IReviewWithId[] = [
    {
        _id: new mongoose.Types.ObjectId('654321098765432109876601'),
        storeHostId: new mongoose.Types.ObjectId(SEED_STORE_HOST_ID),
        authorId: new mongoose.Types.ObjectId(SEED_USER_AUTHOR_ID),
        comment: 'Excelente atención en la tienda física. Todo impecable y limpio.',
        criteria: [
            { category: 'CUSTOMER_SERVICE', score: 5, comment: 'Trato de diez por parte del personal.' },
            { category: 'CLEANLINESS', score: 5, comment: 'La tienda estaba reluciente.' },
            { category: 'PRODUCT_QUALITY', score: 4, comment: 'Buena variedad de juegos.' }
        ],
        overallScore: 4.7,
        isVerified: true,
        deleted: false,
        deletedAt: null
    },
    {
        _id: new mongoose.Types.ObjectId('654321098765432109876602'),
        storeHostId: new mongoose.Types.ObjectId(SEED_STORE_HOST_ID),
        authorId: new mongoose.Types.ObjectId(SEED_USER_AUTHOR_ID),
        comment: 'Ubicación céntrica pero la atención al cliente puede mejorar.',
        criteria: [
            { category: 'CUSTOMER_SERVICE', score: 3, comment: 'Tardaron un poco en atendernos.' },
            { category: 'LOCATION', score: 5, comment: 'Fácil acceso en transporte público.' },
            { category: 'PRODUCT_QUALITY', score: 4, comment: 'Productos de alta calidad.' }
        ],
        overallScore: 4.0,
        isVerified: false,
        deleted: false,
        deletedAt: null
    }
];
