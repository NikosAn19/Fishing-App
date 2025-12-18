import AdventureModel, {
  AdventureDoc,
  AdventureStatus,
} from "../../../models/Adventure";
import CatchModel from "../../../models/Catch";
import { AppError } from "../../../middleware/error/AppError";

export class AdventureService {
  // Haversine formula to calculate distance between two coordinates (in km)
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Auto-link catches when adventure status changes to completed
  private async autoLinkCatches(adventure: AdventureDoc): Promise<void> {
    if (adventure.status !== AdventureStatus.COMPLETED) {
      return;
    }

    try {
      // Parse adventure date (YYYY-MM-DD)
      const adventureDate = new Date(adventure.date + "T00:00:00");
      const startOfDay = new Date(adventureDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(adventureDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Find catches on the same date, same user, with location
      const catches = await CatchModel.find({
        userId: adventure.userId,
        capturedAt: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
        "spot.lat": { $exists: true, $ne: null },
        "spot.lon": { $exists: true, $ne: null },
      }).lean();

      const linkedCatchIds: string[] = [];
      const maxDistanceKm = 1; // 1km radius

      for (const catchDoc of catches) {
        if (catchDoc.spot?.lat && catchDoc.spot?.lon) {
          const distance = this.calculateDistance(
            adventure.coordinates.latitude,
            adventure.coordinates.longitude,
            catchDoc.spot.lat,
            catchDoc.spot.lon
          );

          if (distance <= maxDistanceKm) {
            linkedCatchIds.push(catchDoc._id.toString());
          }
        }
      }

      if (linkedCatchIds.length > 0) {
        adventure.catches = linkedCatchIds.map((id) => id as any) as any[];
        console.log(
          `✅ Auto-linked ${linkedCatchIds.length} catches to adventure ${adventure._id}`
        );
      }
    } catch (error) {
      console.warn("⚠️ Failed to auto-link catches:", error);
    }
  }

  public sanitizeAdventure(adventure: AdventureDoc | any) {
    return {
      id: String(adventure._id || adventure.id),
      userId: String(adventure.userId || adventure.userId),
      status: adventure.status,
      coordinates: adventure.coordinates,
      locationName: adventure.locationName,
      date: adventure.date,
      fishingDetails: adventure.fishingDetails,
      participants: adventure.participants?.map((id: any) => String(id)),
      equipment: adventure.equipment,
      catches: adventure.catches?.map((id: any) => String(id)),
      notes: adventure.notes,
      createdAt: adventure.createdAt,
      updatedAt: adventure.updatedAt,
      completedAt: adventure.completedAt,
    };
  }

  public async getAdventures(userId: string, status?: AdventureStatus) {
    const query: any = { userId };
    if (status && Object.values(AdventureStatus).includes(status)) {
      query.status = status;
    }

    const adventures = await AdventureModel.find(query)
      .sort({ date: -1, createdAt: -1 })
      .lean();

    return adventures.map((adv) => this.sanitizeAdventure(adv));
  }

  public async getAdventureById(adventureId: string, userId: string) {
    const adventure = await AdventureModel.findById(adventureId);
    if (!adventure) {
      throw new AppError("Adventure not found", 404);
    }

    if (adventure.userId.toString() !== userId) {
      throw new AppError("Forbidden", 403);
    }

    return this.sanitizeAdventure(adventure);
  }

  public async createAdventure(userId: string, data: any) {
    const adventureData = {
      userId,
      status: AdventureStatus.PLANNED,
      ...data,
    };

    const adventure = await AdventureModel.create(adventureData);
    return this.sanitizeAdventure(adventure);
  }

  public async updateAdventure(adventureId: string, userId: string, data: any) {
    const adventure = await AdventureModel.findById(adventureId);
    if (!adventure) {
      throw new AppError("Adventure not found", 404);
    }

    if (adventure.userId.toString() !== userId) {
      throw new AppError("Forbidden", 403);
    }

    const wasCompleted = adventure.status === AdventureStatus.COMPLETED;
    const willBeCompleted = data.status === AdventureStatus.COMPLETED;

    if (data.status !== undefined) {
      adventure.status = data.status as AdventureStatus;
      if (willBeCompleted && !wasCompleted) {
        adventure.completedAt = new Date();
      }
    }

    // Update other fields
    if (data.coordinates !== undefined) adventure.coordinates = data.coordinates;
    if (data.locationName !== undefined) adventure.locationName = data.locationName;
    if (data.date !== undefined) adventure.date = data.date;
    if (data.fishingDetails !== undefined) adventure.fishingDetails = data.fishingDetails;
    if (data.participants !== undefined) adventure.participants = data.participants;
    if (data.equipment !== undefined) adventure.equipment = data.equipment;
    if (data.catches !== undefined) adventure.catches = data.catches;
    if (data.notes !== undefined) adventure.notes = data.notes;

    await adventure.save();

    if (willBeCompleted && !wasCompleted) {
      await this.autoLinkCatches(adventure);
      await adventure.save();
    }

    return this.sanitizeAdventure(adventure);
  }

  public async deleteAdventure(adventureId: string, userId: string) {
    const adventure = await AdventureModel.findById(adventureId);
    if (!adventure) {
      throw new AppError("Adventure not found", 404);
    }

    if (adventure.userId.toString() !== userId) {
      throw new AppError("Forbidden", 403);
    }

    await AdventureModel.findByIdAndDelete(adventureId);
    return { message: "Adventure deleted successfully" };
  }
}
