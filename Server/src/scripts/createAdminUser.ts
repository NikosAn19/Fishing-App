import User from "../models/User";
import { MatrixUserService } from "../modules/chat/services/matrix/MatrixUserService";
import { hashPassword } from "../utils/password";
import crypto from "crypto";

const matrixUserService = new MatrixUserService();

export const ADMIN_USERNAME = "psaraki_app_admin";
export const ADMIN_EMAIL = "admin@psaraki.com";
const ADMIN_PASSWORD = "pergaminos007";

export async function createAdminUser() {
  try {
    console.log("Checking for admin user...");
    let adminUser = await User.findOne({ email: ADMIN_EMAIL });

    if (!adminUser) {
      console.log("Admin user not found. Creating...");
      const passwordHash = await hashPassword(ADMIN_PASSWORD);

      adminUser = await User.create({
        email: ADMIN_EMAIL,
        passwordHash,
        displayName: "Psaraki Admin",
      });

      // Create Matrix User
      try {
        // Use the same password as the app user for the admin matrix user
        // This is required because MatrixClient is hardcoded to use this password
        const matrixPassword = ADMIN_PASSWORD;
        // Ensure username is matrix-safe
        const matrixUsername = ADMIN_USERNAME.toLowerCase();

        const matrixUserId = await matrixUserService.createMatrixUser(matrixUsername, matrixPassword, true);

        if (matrixUserId) {
          adminUser.matrix = {
            userId: matrixUserId,
            password: matrixPassword,
            isSynced: true,
          };
          await adminUser.save();
          console.log(`✅ Admin user created: ${adminUser.email} (Matrix: ${matrixUserId})`);
        } else {
            console.error("❌ Failed to create Matrix user for admin. Admin user created in DB but not linked.");
        }
      } catch (matrixError) {
        console.error("❌ Failed to create Matrix user for admin:", matrixError);
      }
    } else {
        console.log("✅ Admin user already exists.");
        
        // Force update Matrix password to ensure it matches what MatrixClient expects
        try {
            const matrixUsername = ADMIN_USERNAME.toLowerCase();
            const matrixPassword = ADMIN_PASSWORD;
            // Re-create/Update user with correct password and admin privileges
            await matrixUserService.createMatrixUser(matrixUsername, matrixPassword, true);
            console.log("✅ Admin user Matrix password synced.");
            
            // Update DB if needed
            if (!adminUser.matrix?.userId || adminUser.matrix.password !== matrixPassword) {
                 const serverName = matrixUserService['client'].getServerName(); // Accessing private client for server name or just construct it
                 const fullUserId = `@${matrixUsername}:localhost`; // Assuming localhost for now, or fetch from config
                 
                 adminUser.matrix = {
                    userId: fullUserId,
                    password: matrixPassword,
                    isSynced: true,
                 };
                 await adminUser.save();
            }
        } catch (e) {
            console.error("⚠️ Failed to sync admin matrix password:", e);
        }
    }
    
    return adminUser;
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    return null;
  }
}
