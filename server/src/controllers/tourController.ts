import { Response, NextFunction } from 'express';
import Tour, { ITour } from '../models/Tour';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// ==================== LIST ====================

// GET /api/tours
export const getTours = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page     = Math.max(1, Number(req.query.page)  || 1);
    const limit    = Math.min(100, Number(req.query.limit) || 20);
    const skip     = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (req.query.isActive !== undefined)   filter.isActive   = req.query.isActive   === 'true';
    if (req.query.isFeatured !== undefined) filter.isFeatured = req.query.isFeatured === 'true';

    if (req.query.search) {
      filter.$text = { $search: req.query.search as string };
    }

    const [tours, total] = await Promise.all([
      Tour.find(filter)
        .select('heading slug images isActive isFeatured viewCount priceStartingFrom duration createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Tour.countDocuments(filter),
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
  } catch (err) {
    next(err);
  }
};

// ==================== GET ONE ====================

// GET /api/tours/:id
export const getTourById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) throw new AppError('Tour not found', 404);

    res.json({ success: true, data: { tour } });
  } catch (err) {
    next(err);
  }
};

// GET /api/tours/slug/:slug  (public — by English slug)
export const getTourBySlug = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tour = await Tour.findOne({ 'slug.en': req.params.slug, isActive: true });
    if (!tour) throw new AppError('Tour not found', 404);

    // Increment view count without triggering full validation
    Tour.findByIdAndUpdate(tour._id, { $inc: { viewCount: 1 } }).exec();

    res.json({ success: true, data: { tour } });
  } catch (err) {
    next(err);
  }
};

// ==================== CREATE ====================

// POST /api/tours
export const createTour = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tour = await Tour.create(req.body);
    res.status(201).json({ success: true, message: 'Tour created', data: { tour } });
  } catch (err) {
    next(err);
  }
};

// ==================== UPDATE ====================

// PUT /api/tours/:id
export const updateTour = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) throw new AppError('Tour not found', 404);

    // Merge top-level fields; keep immutable counters
    const { viewCount, createdAt, ...updates } = req.body;
    void viewCount; void createdAt;

    Object.assign(tour, updates);
    await tour.save();

    res.json({ success: true, message: 'Tour updated', data: { tour } });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/tours/:id/toggle-active
export const toggleActive = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) throw new AppError('Tour not found', 404);

    tour.isActive = !tour.isActive;
    await tour.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: `Tour ${tour.isActive ? 'activated' : 'deactivated'}`,
      data: { isActive: tour.isActive },
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/tours/:id/toggle-featured
export const toggleFeatured = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) throw new AppError('Tour not found', 404);

    tour.isFeatured = !tour.isFeatured;
    await tour.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: `Tour ${tour.isFeatured ? 'featured' : 'unfeatured'}`,
      data: { isFeatured: tour.isFeatured },
    });
  } catch (err) {
    next(err);
  }
};

// ==================== DELETE ====================

// DELETE /api/tours/:id
export const deleteTour = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if (!tour) throw new AppError('Tour not found', 404);

    res.json({ success: true, message: 'Tour deleted' });
  } catch (err) {
    next(err);
  }
};

// ==================== STATS ====================

// GET /api/tours/stats  (admin dashboard summary)
export const getTourStats = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [total, active, featured, topViewed] = await Promise.all([
      Tour.countDocuments(),
      Tour.countDocuments({ isActive: true }),
      Tour.countDocuments({ isFeatured: true }),
      Tour.find().sort({ viewCount: -1 }).limit(5).select('heading viewCount isActive').lean(),
    ]);

    res.json({
      success: true,
      data: {
        stats: { total, active, inactive: total - active, featured },
        topViewed,
      },
    });
  } catch (err) {
    next(err);
  }
};
