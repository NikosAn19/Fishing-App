import mongoose, { Schema, InferSchemaType } from "mongoose";

/** Απλό snapshot για caching/ιστορικό.
 */
const WeatherSnapshotSchema = new Schema(
  {
    spotKey: { type: String, index: true },     // π.χ. "37.97,23.72"
    ts: { type: Date, index: true },            // timestamp της πρόγνωσης (UTC)
    payload: { type: Schema.Types.Mixed, required: true }, // unified JSON που επιστρέφουμε
    meta: { type: Schema.Types.Mixed }          // π.χ. source hashes
  },
  { timestamps: true }
);

WeatherSnapshotSchema.index({ spotKey: 1, ts: -1 });

export type WeatherSnapshot = InferSchemaType<typeof WeatherSnapshotSchema>;
export default mongoose.model("weather_snapshots", WeatherSnapshotSchema);
