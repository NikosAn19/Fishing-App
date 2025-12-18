import CatchModel from "../../../models/Catch";
import { AppError } from "../../../middleware/error/AppError";

const CDN_BASE = process.env.CDN_BASE || 'https://pub-6152823702fd4064a507eac85c165f45.r2.dev';

export class CatchService {
  private fixPhotoUrl(photo: any) {
    if (!photo) return photo;
    const fixed = { ...photo };
    if (fixed.key && CDN_BASE) {
      const cleanKey = fixed.key.replace(/^\/+/, '');
      fixed.url = `${CDN_BASE.replace(/\/+$/, '')}/${cleanKey}`;
    }
    return fixed;
  }

  private toDTO(doc: any) {
    return {
      id: String(doc._id),
      species: doc.species,
      weight: doc.weight,
      length: doc.length,
      notes: doc.notes,
      photo: this.fixPhotoUrl(doc.photo),
      spot: doc.spot,
      capturedAt: doc.capturedAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      userId: doc.userId ? String(doc.userId) : undefined,
    };
  }

  public async listCatches(page: number, limit: number, userId?: string) {
    const query: any = {};
    if (userId) query.userId = userId;

    const [items, total] = await Promise.all([
      CatchModel.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      CatchModel.countDocuments(query),
    ]);

    return {
      page,
      limit,
      total,
      items: items.map((doc) => this.toDTO(doc)),
    };
  }

  public async createCatch(userId: string, data: any) {
    const species = (data.species ?? data.fishType)?.trim();
    if (!species) throw new AppError("Species is required", 400);

    const capturedAt =
      typeof data.capturedAt === "string" || typeof data.capturedAt === "number"
        ? new Date(data.capturedAt)
        : data.capturedAt || null;

    const catchData = {
      ...data,
      userId,
      species,
      weight: typeof data.weight === "number" ? Number(data.weight.toFixed(3)) : data.weight ?? null,
      length: typeof data.length === "number" ? Number(data.length.toFixed(1)) : data.length ?? null,
      capturedAt,
    };

    const doc = await CatchModel.create(catchData);
    return this.toDTO(doc);
  }

  public async getCatchById(id: string) {
    const doc = await CatchModel.findById(id).lean();
    if (!doc) throw new AppError("Catch not found", 404);
    return this.toDTO(doc);
  }

  public async updateCatch(id: string, userId: string, data: any) {
    const updates: any = { ...data };

    if (!updates.species && updates.fishType) {
      updates.species = (updates.fishType as string).trim();
      delete updates.fishType;
    }

    if (typeof data.capturedAt === "string" || typeof data.capturedAt === "number") {
      updates.capturedAt = new Date(data.capturedAt);
    }

    const doc = await CatchModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: updates },
      { new: true }
    ).lean();

    if (!doc) throw new AppError("Catch not found or unauthorized", 404);
    return this.toDTO(doc);
  }

  public async deleteCatch(id: string, userId: string) {
    const result = await CatchModel.deleteOne({ _id: id, userId });
    if (result.deletedCount === 0) throw new AppError("Catch not found or unauthorized", 404);
    return { ok: true, id };
  }
}
