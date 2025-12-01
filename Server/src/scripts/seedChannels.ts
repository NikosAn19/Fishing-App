import ChatRoom from "../models/ChatRoom";
import { MatrixRoomService } from "../services/matrix/MatrixRoomService";
import { createAdminUser } from "./createAdminUser";

const matrixRoomService = new MatrixRoomService();

const REGIONS = [
  { id: 1, name_gr: "Αττική", slug: "attiki", region_code: "ATT" },
  { id: 2, name_gr: "Μακεδονία", slug: "makedonia", region_code: "MAK" },
  { id: 3, name_gr: "Θράκη", slug: "thraki", region_code: "THR" },
  { id: 4, name_gr: "Θεσσαλία", slug: "thessalia", region_code: "THE" },
  { id: 5, name_gr: "Ήπειρος", slug: "ipiros", region_code: "IPI" },
  { id: 6, name_gr: "Στερεά Ελλάδα", slug: "sterea-ellada", region_code: "STE" },
  { id: 7, name_gr: "Πελοπόννησος", slug: "peloponnisos", region_code: "PEL" },
  { id: 8, name_gr: "Εύβοια", slug: "evia", region_code: "EVI" },
  { id: 9, name_gr: "Κρήτη", slug: "kriti", region_code: "KRI" },
  { id: 10, name_gr: "Ιόνια Νησιά", slug: "ionia-nisia", region_code: "ION" },
  { id: 11, name_gr: "Κυκλάδες", slug: "kyklades", region_code: "KYK" },
  { id: 12, name_gr: "Δωδεκάνησα", slug: "dodekanisa", region_code: "DOD" },
  { id: 13, name_gr: "Βόρειο Αιγαίο", slug: "voreio-aigaio", region_code: "NAE" }
];

export async function seedChannels() {
  console.log("🌱 Seeding channels...");
  
  // Ensure admin user exists
  const adminUser = await createAdminUser();
  if (!adminUser || !adminUser.matrix?.userId) {
      console.error("❌ Cannot seed channels: Admin user not available or missing Matrix ID.");
      return;
  }

  const TECHNIQUES = [
    { name: "Spinning", slug: "spinning" },
    { name: "Casting", slug: "casting" },
    { name: "LRF", slug: "lrf" },
    { name: "Eging", slug: "eging" },
    { name: "Άλλες τεχνικές", slug: "alles-texnikes" }
  ];

  for (const region of REGIONS) {
    for (const technique of TECHNIQUES) {
      try {
        const roomSlug = `${region.slug}-${technique.slug}`;
        const roomName = `${region.name_gr} - ${technique.name}`;
        
        const existingRoom = await ChatRoom.findOne({ slug: roomSlug });
        
        if (existingRoom) {
          // console.log(`ℹ️ Channel already exists: ${roomName} (${roomSlug})`);
          continue;
        }

        console.log(`Creating channel: ${roomName}...`);

        // Create in Matrix
        const roomId = await matrixRoomService.createPublicRoom(
          adminUser.matrix.userId,
          roomName,
          `Chat channel for ${technique.name} in ${region.name_gr}`
        );

        if (roomId) {
          // Create in MongoDB
          await ChatRoom.create({
            matrixRoomId: roomId,
            type: 'public',
            name: roomName, // Full name in DB: "Attiki - Spinning"
            slug: roomSlug,
            region_code: region.region_code,
            participants: [adminUser._id],
            createdBy: adminUser._id,
          });
          console.log(`✅ Created channel: ${roomName} (${roomId})`);
        } else {
            console.error(`❌ Failed to create Matrix room for ${roomName}`);
        }

      } catch (error) {
        console.error(`❌ Error seeding channel ${region.name_gr} - ${technique.name}:`, error);
      }
      
      // Add a delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  console.log("🌱 Channel seeding completed.");
}
