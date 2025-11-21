import { Request, Response, NextFunction } from "express";
import FavoriteSpotModel, { FavoriteSpotDoc } from "../models/FavoriteSpot";
import { z } from "zod";

const COORDINATE_TOLERANCE = 0.0001; // ~11 meters

const createFavoriteSpotSchema = z.object({
  name: z.string().min(1).max(100),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
});

// @desc    Get user's favorite spots
// @route   GET /api/favorite-spots
// @access  Private
export async function getFavoriteSpots(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // req.user is guaranteed by requireAuth middleware
    const spots = await FavoriteSpotModel.find({ userId: req.user!._id })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      favoriteSpots: spots.map((spot: any) => ({
        id: spot._id.toString(),
        userId: spot.userId.toString(),
        name: spot.name,
        latitude: spot.latitude,
        longitude: spot.longitude,
        address: spot.address,
        description: spot.description,
        notes: spot.notes,
        createdAt: spot.createdAt.toISOString(),
        updatedAt: spot.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    return next(error);
  }
}

// @desc    Add favorite spot
// @route   POST /api/favorite-spots
// @access  Private
export async function addFavoriteSpot(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const validated = createFavoriteSpotSchema.parse(req.body);

    // Check if spot already exists at this location (within tolerance)
    // req.user is guaranteed by requireAuth middleware
    const existingSpot = await FavoriteSpotModel.findOne({
      userId: req.user!._id,
      latitude: {
        $gte: validated.latitude - COORDINATE_TOLERANCE,
        $lte: validated.latitude + COORDINATE_TOLERANCE,
      },
      longitude: {
        $gte: validated.longitude - COORDINATE_TOLERANCE,
        $lte: validated.longitude + COORDINATE_TOLERANCE,
      },
    });

    if (existingSpot) {
      return res.status(400).json({
        success: false,
        error: "Favorite spot already exists at this location",
      });
    }

    const spot = await FavoriteSpotModel.create({
      userId: req.user!._id,
      ...validated,
    });

    return res.status(201).json({
      success: true,
      favoriteSpot: {
        id: (spot._id as any).toString(),
        userId: (spot.userId as any).toString(),
        name: spot.name,
        latitude: spot.latitude,
        longitude: spot.longitude,
        address: spot.address,
        description: spot.description,
        notes: spot.notes,
        createdAt: spot.createdAt.toISOString(),
        updatedAt: spot.updatedAt.toISOString(),
      },
    });
  } catch (error: any) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        error: error.errors[0]?.message ?? "Invalid request data",
      });
    }
    return next(error);
  }
}

// @desc    Delete favorite spot
// @route   DELETE /api/favorite-spots/:id
// @access  Private
export async function deleteFavoriteSpot(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    // req.user is guaranteed by requireAuth middleware
    const spot = await FavoriteSpotModel.findOne({
      _id: id,
      userId: req.user!._id,
    });

    if (!spot) {
      return res.status(404).json({
        success: false,
        error: "Favorite spot not found",
      });
    }

    await FavoriteSpotModel.deleteOne({ _id: id });

    return res.json({
      success: true,
      message: "Favorite spot deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
}
