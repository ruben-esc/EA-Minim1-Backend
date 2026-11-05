import express from 'express';
import controller from '../controllers/Review';
import { ValidateId, ValidateJoi, Schemas } from '../middleware/Joi';
import VerifyToken, { OptionalVerifyToken, RequireAdmin } from '../middleware/VerifyToken';

const router = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     ReviewCriterion:
 *       type: object
 *       required:
 *         - category
 *         - score
 *       properties:
 *         category:
 *           type: string
 *           enum: [CUSTOMER_SERVICE, CLEANLINESS, PRODUCT_QUALITY, LOCATION]
 *         score:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *         comment:
 *           type: string
 *     Review:
 *       type: object
 *       required:
 *         - storeHostId
 *         - comment
 *         - criteria
 *       properties:
 *         _id:
 *           type: string
 *           readOnly: true
 *         storeHostId:
 *           type: string
 *         authorId:
 *           type: string
 *           readOnly: true
 *         comment:
 *           type: string
 *         criteria:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ReviewCriterion'
 *         overallScore:
 *           type: number
 *           readOnly: true
 *         isVerified:
 *           type: boolean
 *           default: false
 *         deleted:
 *           type: boolean
 *           readOnly: true
 *           default: false
 *     ReviewUpdateInput:
 *       type: object
 *       properties:
 *         comment:
 *           type: string
 *         criteria:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ReviewCriterion'
 *         isVerified:
 *           type: boolean
 */

/**
 * @openapi
 * /reviews:
 *   post:
 *     tags: [Reviews]
 *     summary: Crea una nueva valoración multicriterio (Usuario autenticado)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Review'
 *     responses:
 *       201:
 *         description: Valoración creada exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Anfitrión no encontrado
 *   get:
 *     tags: [Reviews]
 *     summary: Lista valoraciones paginadas con filtros de texto y verificación
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: isVerified
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: storeHostId
 *         schema:
 *           type: string
 *       - in: query
 *         name: showDeleted
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: Listado devuelto con éxito
 */
router.post('/', VerifyToken, ValidateJoi(Schemas.review.create), controller.createReview);
router.get('/', OptionalVerifyToken, controller.readAllPaginated);

/**
 * @openapi
 * /reviews/summary/{storeHostId}:
 *   get:
 *     tags: [Reviews]
 *     summary: Obtiene el resumen estadístico de un anfitrión calculado en MongoDB
 *     parameters:
 *       - in: path
 *         name: storeHostId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resumen estadístico calculado mediante agregación
 */
router.get('/summary/:storeHostId', ValidateId('storeHostId'), controller.getStoreHostSummary);

/**
 * @openapi
 * /reviews/{reviewId}:
 *   get:
 *     tags: [Reviews]
 *     summary: Obtiene una valoración por ID
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalle devuelto
 *       404:
 *         description: No encontrada
 *   put:
 *     tags: [Reviews]
 *     summary: Actualiza una valoración (Autor o Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReviewUpdateInput'
 *     responses:
 *       200:
 *         description: Actualizada con éxito
 *       403:
 *         description: Prohibido
 *       404:
 *         description: No encontrada
 *   delete:
 *     tags: [Reviews]
 *     summary: Borrado físico definitivo (Solo Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Eliminada permanentemente
 *       403:
 *         description: Requiere rol ADMIN
 *       404:
 *         description: No encontrada
 */
router.get('/:reviewId', OptionalVerifyToken, ValidateId('reviewId'), controller.readReview);
router.put('/:reviewId', VerifyToken, ValidateId('reviewId'), ValidateJoi(Schemas.review.update), controller.updateReview);
router.delete('/:reviewId', VerifyToken, RequireAdmin, ValidateId('reviewId'), controller.hardDeleteReview);

/**
 * @openapi
 * /reviews/{reviewId}/soft-delete:
 *   patch:
 *     tags: [Reviews]
 *     summary: Borrado lógico de una valoración (Autor o Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Archivada lógicamente
 *       403:
 *         description: Prohibido
 *       404:
 *         description: No encontrada
 */
router.patch('/:reviewId/soft-delete', VerifyToken, ValidateId('reviewId'), controller.softDeleteReview);

export default router;
