"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTourStats = exports.deleteTour = exports.toggleFeatured = exports.toggleActive = exports.updateTour = exports.createTour = exports.getTourBySlug = exports.getTourById = exports.getTours = void 0;
const Tour_1 = __importDefault(require("../models/Tour"));
const errorHandler_1 = require("../middleware/errorHandler");
// ==================== LIST ====================
// GET /api/tours
const getTours = async (req, res, next) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Number(req.query.limit) || 20);
        const skip = (page - 1) * limit;
        const filter = {};
        if (req.query.isActive !== undefined)
            filter.isActive = req.query.isActive === 'true';
        if (req.query.isFeatured !== undefined)
            filter.isFeatured = req.query.isFeatured === 'true';
        if (req.query.search) {
            filter.$text = { $search: req.query.search };
        }
        const [tours, total] = await Promise.all([
            Tour_1.default.find(filter)
                .select('heading slug images isActive isFeatured viewCount priceStartingFrom duration createdAt')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Tour_1.default.countDocuments(filter),
        ]);
        res.json({
            success: true,
            data: {
                tours,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit),
                },
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getTours = getTours;
// ==================== GET ONE ====================
// GET /api/tours/:id
const getTourById = async (req, res, next) => {
    try {
        const tour = await Tour_1.default.findById(req.params.id);
        if (!tour)
            throw new errorHandler_1.AppError('Tour not found', 404);
        res.json({ success: true, data: { tour } });
    }
    catch (err) {
        next(err);
    }
};
exports.getTourById = getTourById;
// GET /api/tours/slug/:slug  (public — by English slug)
const getTourBySlug = async (req, res, next) => {
    try {
        const tour = await Tour_1.default.findOne({ 'slug.en': req.params.slug, isActive: true });
        if (!tour)
            throw new errorHandler_1.AppError('Tour not found', 404);
        // Increment view count without triggering full validation
        Tour_1.default.findByIdAndUpdate(tour._id, { $inc: { viewCount: 1 } }).exec();
        res.json({ success: true, data: { tour } });
    }
    catch (err) {
        next(err);
    }
};
exports.getTourBySlug = getTourBySlug;
// ==================== CREATE ====================
// POST /api/tours
const createTour = async (req, res, next) => {
    try {
        const tour = await Tour_1.default.create(req.body);
        res.status(201).json({ success: true, message: 'Tour created', data: { tour } });
    }
    catch (err) {
        next(err);
    }
};
exports.createTour = createTour;
// ==================== UPDATE ====================
// PUT /api/tours/:id
const updateTour = async (req, res, next) => {
    try {
        const tour = await Tour_1.default.findById(req.params.id);
        if (!tour)
            throw new errorHandler_1.AppError('Tour not found', 404);
        // Merge top-level fields; keep immutable counters
        const { viewCount, createdAt, ...updates } = req.body;
        void viewCount;
        void createdAt;
        Object.assign(tour, updates);
        await tour.save();
        res.json({ success: true, message: 'Tour updated', data: { tour } });
    }
    catch (err) {
        next(err);
    }
};
exports.updateTour = updateTour;
// PATCH /api/tours/:id/toggle-active
const toggleActive = async (req, res, next) => {
    try {
        const tour = await Tour_1.default.findById(req.params.id);
        if (!tour)
            throw new errorHandler_1.AppError('Tour not found', 404);
        tour.isActive = !tour.isActive;
        await tour.save({ validateBeforeSave: false });
        res.json({
            success: true,
            message: `Tour ${tour.isActive ? 'activated' : 'deactivated'}`,
            data: { isActive: tour.isActive },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.toggleActive = toggleActive;
// PATCH /api/tours/:id/toggle-featured
const toggleFeatured = async (req, res, next) => {
    try {
        const tour = await Tour_1.default.findById(req.params.id);
        if (!tour)
            throw new errorHandler_1.AppError('Tour not found', 404);
        tour.isFeatured = !tour.isFeatured;
        await tour.save({ validateBeforeSave: false });
        res.json({
            success: true,
            message: `Tour ${tour.isFeatured ? 'featured' : 'unfeatured'}`,
            data: { isFeatured: tour.isFeatured },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.toggleFeatured = toggleFeatured;
// ==================== DELETE ====================
// DELETE /api/tours/:id
const deleteTour = async (req, res, next) => {
    try {
        const tour = await Tour_1.default.findByIdAndDelete(req.params.id);
        if (!tour)
            throw new errorHandler_1.AppError('Tour not found', 404);
        res.json({ success: true, message: 'Tour deleted' });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteTour = deleteTour;
// ==================== STATS ====================
// GET /api/tours/stats  (admin dashboard summary)
const getTourStats = async (_req, res, next) => {
    try {
        const [total, active, featured, topViewed] = await Promise.all([
            Tour_1.default.countDocuments(),
            Tour_1.default.countDocuments({ isActive: true }),
            Tour_1.default.countDocuments({ isFeatured: true }),
            Tour_1.default.find().sort({ viewCount: -1 }).limit(5).select('heading viewCount isActive').lean(),
        ]);
        res.json({
            success: true,
            data: {
                stats: { total, active, inactive: total - active, featured },
                topViewed,
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getTourStats = getTourStats;
//# sourceMappingURL=tourController.js.map