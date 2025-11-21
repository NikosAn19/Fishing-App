import { Request, Response, NextFunction } from "express";
import AdventureModel, {
  AdventureDoc,
  AdventureStatus,
} from "../models/Adventure";
import CatchModel from "../models/Catch";
import { z } from "zod";

const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

const fishingDetailsSchema = z.object({
  technique: z.string().optional(),
  lures: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

const equipmentSchema = z.object({
  name: z.string().min(1),
  type: z.string().optional(),
  notes: z.string().optional(),
});

const createAdventureSchema = z.object({
  coordinates: coordinatesSchema,
  locationName: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  fishingDetails: fishingDetailsSchema.optional(),
  participants: z.array(z.string()).optional(),
  equipment: z.array(equipmentSchema).optional(),
  notes: z.string().optional(),
});

const updateAdventureSchema = z.object({
  status: z.enum(["planned", "completed", "cancelled"]).optional(),
  coordinates: coordinatesSchema.optional(),
  locationName: z.string().optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  fishingDetails: fishingDetailsSchema.optional(),
  participants: z.array(z.string()).optional(),
  equipment: z.array(equipmentSchema).optional(),
  catches: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

// Haversine formula to calculate distance between two coordinates (in km)
function calculateDistance(
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
async function autoLinkCatches(adventure: AdventureDoc): Promise<void> {
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
        const distance = calculateDistance(
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
    // Don't throw - this is non-critical
  }
}

function sanitizeAdventure(adventure: AdventureDoc | any) {
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

export async function getAdventures(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const userId = (req.user as any)._id;
    const status = req.query.status as AdventureStatus | undefined;

    const query: any = { userId };
    if (status && Object.values(AdventureStatus).includes(status)) {
      query.status = status;
    }

    const adventures = await AdventureModel.find(query)
      .sort({ date: -1, createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      adventures: adventures.map((adv) => sanitizeAdventure(adv)),
    });
  } catch (error) {
    return next(error);
  }
}

export async function getAdventure(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const adventureId = req.params.id;
    const adventure = await AdventureModel.findById(adventureId);

    if (!adventure) {
      return res.status(404).json({
        success: false,
        error: "Adventure not found",
      });
    }

    // Check if user owns the adventure
    const userId = (req.user as any)._id;
    if (adventure.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
      });
    }

    return res.json({
      success: true,
      adventure: sanitizeAdventure(adventure),
    });
  } catch (error) {
    return next(error);
  }
}

export async function createAdventure(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const body = createAdventureSchema.parse(req.body);
    const userId = (req.user as any)._id;

    const adventureData = {
      userId,
      status: AdventureStatus.PLANNED,
      coordinates: body.coordinates,
      locationName: body.locationName,
      date: body.date,
      fishingDetails: body.fishingDetails,
      participants: body.participants?.map((id) => id as any) as any[],
      equipment: body.equipment,
      notes: body.notes,
    };

    const adventure = await AdventureModel.create(adventureData);

    return res.status(201).json({
      success: true,
      adventure: sanitizeAdventure(adventure),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: error.issues[0]?.message || "Invalid request",
      });
    }
    return next(error);
  }
}

export async function updateAdventure(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const adventureId = req.params.id;
    const body = updateAdventureSchema.parse(req.body);
    const userId = (req.user as any)._id;

    const adventure = await AdventureModel.findById(adventureId);

    if (!adventure) {
      return res.status(404).json({
        success: false,
        error: "Adventure not found",
      });
    }

    // Check if user owns the adventure
    if (adventure.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
      });
    }

    // Track if status is changing to completed
    const wasCompleted = adventure.status === AdventureStatus.COMPLETED;
    const willBeCompleted = body.status === AdventureStatus.COMPLETED;

    // Update fields
    if (body.status !== undefined) {
      adventure.status = body.status as AdventureStatus;
      if (willBeCompleted && !wasCompleted) {
        adventure.completedAt = new Date();
      }
    }
    if (body.coordinates !== undefined) {
      adventure.coordinates = body.coordinates;
    }
    if (body.locationName !== undefined) {
      adventure.locationName = body.locationName;
    }
    if (body.date !== undefined) {
      adventure.date = body.date;
    }
    if (body.fishingDetails !== undefined) {
      adventure.fishingDetails = body.fishingDetails;
    }
    if (body.participants !== undefined) {
      adventure.participants = body.participants.map(
        (id) => id as any
      ) as any[];
    }
    if (body.equipment !== undefined) {
      adventure.equipment = body.equipment;
    }
    if (body.catches !== undefined) {
      adventure.catches = body.catches.map((id) => id as any) as any[];
    }
    if (body.notes !== undefined) {
      adventure.notes = body.notes;
    }

    await adventure.save();

    // Auto-link catches if status changed to completed
    if (willBeCompleted && !wasCompleted) {
      await autoLinkCatches(adventure);
      await adventure.save(); // Save again after auto-linking
    }

    return res.json({
      success: true,
      adventure: sanitizeAdventure(adventure),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: error.issues[0]?.message || "Invalid request",
      });
    }
    return next(error);
  }
}

export async function deleteAdventure(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const adventureId = req.params.id;
    const userId = (req.user as any)._id;

    const adventure = await AdventureModel.findById(adventureId);

    if (!adventure) {
      return res.status(404).json({
        success: false,
        error: "Adventure not found",
      });
    }

    // Check if user owns the adventure
    if (adventure.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
      });
    }

    await AdventureModel.findByIdAndDelete(adventureId);

    return res.json({
      success: true,
      message: "Adventure deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
}
