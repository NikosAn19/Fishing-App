import axios, { AxiosError } from 'axios';

// Interfaces για να ξέρει η TypeScript τι δεδομένα περιμένουμε
interface MatrixLoginResponse {
  access_token: string;
  home_server: string;
  user_id: string;
  device_id: string;
}

interface MatrixUserResponse {
  name: string; // Το πλήρες ID του χρήστη (π.χ. @kostas:localhost)
  admin: boolean;
}

export class MatrixService {
  private readonly matrixUrl: string;
  private readonly adminUser: string;
  private readonly adminPass: string;
  private readonly serverName: string;

  constructor() {
    // Καλό είναι αυτά να τα παίρνεις από process.env στο μέλλον
    this.matrixUrl = 'http://localhost:8008'; 
    this.adminUser = 'psaraki_admin';         // Το Admin username που έφτιαξες
    this.adminPass = 'pergaminos007'; // Το password που έβαλες
    this.serverName = 'localhost';            // Στο production θα είναι το domain σου
  }

  /**
   * 1. Κάνει Login ως Admin για να πάρει το Access Token
   */
  private async getAdminAccessToken(): Promise<string | null> {
    try {
      const response = await axios.post<MatrixLoginResponse>(
        `${this.matrixUrl}/_matrix/client/r0/login`,
        {
          type: 'm.login.password',
          identifier: {
            type: 'm.id.user',
            user: this.adminUser,
          },
          password: this.adminPass,
        }
      );
      return response.data.access_token;
    } catch (error) {
      console.error('❌ Matrix Admin Login Failed:', this.handleAxiosError(error));
      return null;
    }
  }

  /**
   * 2. Δημιουργεί νέο χρήστη στο Matrix
   * @param username Το username του χρήστη (π.χ. "nikos")
   * @param password Ο κωδικός του χρήστη
   */
  public async createChatUser(username: string, password: string): Promise<string | null> {
    const adminToken = await this.getAdminAccessToken();

    if (!adminToken) {
      console.error('❌ Cannot create user: Admin token missing');
      return null;
    }

    // Κατασκευή του πλήρους User ID: @username:servername
    const fullUserId = `@${username}:${this.serverName}`;

    try {
      // Χρήση του Synapse Admin API
      const response = await axios.put<MatrixUserResponse>(
        `${this.matrixUrl}/_synapse/admin/v2/users/${fullUserId}`,
        {
          password: password,
          displayname: username,
          admin: false, // Ο απλός χρήστης δεν είναι admin
          deactivated: false
        },
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(`✅ Matrix User Created: ${response.data.name}`);
      return response.data.name;

    } catch (error) {
      // Αν ο χρήστης υπάρχει ήδη, μπορεί να θες να το διαχειριστείς διαφορετικά
      console.error(`❌ Failed to create Matrix user ${username}:`, this.handleAxiosError(error));
      return null;
    }
  }

  // Helper για καθαρότερα error messages
  private handleAxiosError(error: any): string {
    if (axios.isAxiosError(error)) {
      return error.response?.data?.error || error.message;
    }
    return 'Unknown error';
  }
}

async function runTest() {
    const matrixService = new MatrixService();
    
    console.log("🔄 Δοκιμή δημιουργίας χρήστη...");
    const result = await matrixService.createChatUser('typescript_user', 'superpass123');
    
    if (result) {
        console.log("🎉 Επιτυχία! Το User ID είναι:", result);
    } else {
        console.log("⚠️ Κάτι πήγε στραβά.");
    }
}

runTest();