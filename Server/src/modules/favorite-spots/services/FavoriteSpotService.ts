import FavoriteSpotModel, { FavoriteSpotDoc } from "../../../models/FavoriteSpot";
import { AppError } from "../../../middleware/error/AppError";

const COORDINATE_TOLERANCE = 0.0001; // ~11 meters

export class FavoriteSpotService {
  public async getFavoriteSpots(userId: string) {
    const spots = await FavoriteSpotModel.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return spots.map((spot: any) => ({
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
    }));
  }

  public async addFavoriteSpot(userId: string, data: any) {
    // Check if spot already exists at this location (within tolerance)
    const existingSpot = await FavoriteSpotModel.findOne({
      userId,
      latitude: {
        $gte: data.latitude - COORDINATE_TOLERANCE,
        $lte: data.latitude + COORDINATE_TOLERANCE,
      },
      longitude: {
        $gte: data.longitude - COORDINATE_TOLERANCE,
        $lte: data.longitude + COORDINATE_TOLERANCE,
      },
    });

    if (existingSpot) {
      throw new AppError("Favorite spot already exists at this location", 400);
    }

    const spot = await FavoriteSpotModel.create({
      userId,
      ...data,
    });

    return {
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
    };
  }

  public async deleteFavoriteSpot(id: string, userId: string) {
    const spot = await FavoriteSpotModel.findOne({
      _id: id,
      userId,
    });

    if (!spot) {
      throw new AppError("Favorite spot not found", 404);
    }

    await FavoriteSpotModel.deleteOne({ _id: id });
    return { message: "Favorite spot deleted successfully" };
  }
}
