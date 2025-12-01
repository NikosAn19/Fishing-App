import axios, { AxiosInstance, AxiosError } from 'axios';
import fs from 'fs';
import path from 'path';

// Interfaces for Matrix API responses
interface MatrixLoginResponse {
  access_token: string;
  home_server: string;
  user_id: string;
  device_id: string;
}

const TOKEN_FILE_PATH = path.join(process.cwd(), 'matrix_admin_token.json');

export class MatrixClient {
  private static instance: MatrixClient;
  private axiosInstance: AxiosInstance;
  private matrixUrl: string;
  private adminUser: string;
  private adminPass: string;
  private adminToken: string | null = null;

  private constructor() {
    console.log("🏗️ MatrixClient: Constructor called");
    // Configuration - In production, use process.env
    this.matrixUrl = 'http://localhost:8008';
    this.adminUser = 'psaraki_app_admin';
    this.adminPass = 'pergaminos007';

    this.axiosInstance = axios.create({
      baseURL: this.matrixUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Try to load token on startup
    this.loadToken();
  }

  public static getInstance(): MatrixClient {
    if (!MatrixClient.instance) {
      console.log("🆕 MatrixClient: Creating new instance");
      MatrixClient.instance = new MatrixClient();
    }
    return MatrixClient.instance;
  }

  private loadToken() {
      try {
          if (fs.existsSync(TOKEN_FILE_PATH)) {
              const data = fs.readFileSync(TOKEN_FILE_PATH, 'utf-8');
              const json = JSON.parse(data);
              if (json.access_token) {
                  this.adminToken = json.access_token;
                  console.log("📂 MatrixClient: Loaded token from file");
              }
          }
      } catch (e) {
          console.error("⚠️ Failed to load token from file:", e);
      }
  }

  private saveToken(token: string) {
      try {
          fs.writeFileSync(TOKEN_FILE_PATH, JSON.stringify({ access_token: token }), 'utf-8');
          console.log("💾 MatrixClient: Saved token to file");
      } catch (e) {
          console.error("⚠️ Failed to save token to file:", e);
      }
  }

  /**
   * Authenticates as the Admin user to get an access token.
   * Caches the token for subsequent requests.
   */
  public async getAdminAccessToken(): Promise<string> {
    if (this.adminToken) {
      // console.log("🔑 MatrixClient: Using cached admin token");
      return this.adminToken;
    }

    console.log("🔐 MatrixClient: Fetching new admin token...");
    
    let attempts = 0;
    const maxAttempts = 5;
    let delay = 2000; // Start with 2 seconds

    while (attempts < maxAttempts) {
      try {
        const response = await this.axiosInstance.post<MatrixLoginResponse>(
          '/_matrix/client/r0/login',
          {
            type: 'm.login.password',
            identifier: {
              type: 'm.id.user',
              user: this.adminUser,
            },
            password: this.adminPass,
          }
        );

        this.adminToken = response.data.access_token;
        this.saveToken(this.adminToken); // Save to file
        console.log("✅ MatrixClient: Token obtained and cached");
        return this.adminToken;
      } catch (error: any) {
        attempts++;
        // If 403 Forbidden (Invalid password) or 401, don't retry, just throw
        if (axios.isAxiosError(error) && (error.response?.status === 403 || error.response?.status === 401)) {
             console.error('❌ Matrix Admin Login Failed (Invalid Credentials):', this.handleAxiosError(error));
             throw new Error('Invalid Matrix Credentials');
        }

        if (axios.isAxiosError(error) && error.response?.status === 429) {
           const retryAfterMs = error.response.data?.retry_after_ms || delay;
           console.warn(`⚠️ Matrix Rate Limit (Login). Waiting ${retryAfterMs}ms before retry ${attempts}/${maxAttempts}...`);
           await new Promise(resolve => setTimeout(resolve, retryAfterMs));
           delay *= 2; // Exponential backoff fallback
        } else {
           console.error('❌ Matrix Admin Login Failed:', this.handleAxiosError(error));
           // For other errors, maybe retry? Or throw? Let's retry network errors
           await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    throw new Error('Failed to authenticate with Matrix Server after multiple retries');
  }

  /**
   * Makes an authenticated request to the Matrix API.
   * Automatically injects the Admin Access Token.
   */
  public async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    data?: any
  ): Promise<T> {
    let token = await this.getAdminAccessToken();
    let attempts = 0;
    const maxAttempts = 5;
    let delay = 2000;

    while (attempts < maxAttempts) {
      try {
        const response = await this.axiosInstance.request<T>({
          method,
          url,
          data,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return response.data;
      } catch (error: any) {
        attempts++;

        // If token is invalid (401), clear it and retry ONCE (but don't count as a normal attempt if successful)
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            console.warn("⚠️ Matrix Token Invalid/Expired. Refreshing...");
            this.adminToken = null; 
            try { if (fs.existsSync(TOKEN_FILE_PATH)) fs.unlinkSync(TOKEN_FILE_PATH); } catch {}
            
            token = await this.getAdminAccessToken(); // Get new token
            // Continue loop to retry with new token
            continue;
        }

        // Handle Rate Limit (429)
        if (axios.isAxiosError(error) && error.response?.status === 429) {
           const retryAfterMs = error.response.data?.retry_after_ms || delay;
           console.warn(`⚠️ Matrix Rate Limit (Request). Waiting ${retryAfterMs}ms before retry ${attempts}/${maxAttempts}...`);
           await new Promise(resolve => setTimeout(resolve, retryAfterMs));
           delay *= 2;
           continue;
        }

        // If we reached max attempts, throw
        if (attempts >= maxAttempts) {
            throw new Error(this.handleAxiosError(error));
        }

        // For other errors, maybe wait a bit and retry?
        console.warn(`⚠️ Matrix Request Failed (Attempt ${attempts}/${maxAttempts}):`, this.handleAxiosError(error));
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('Request failed after multiple retries');
  }

  public getMatrixUrl(): string {
    return this.matrixUrl;
  }

  public getServerName(): string {
    return 'localhost'; // In production, this should be your domain
  }

  private handleAxiosError(error: any): string {
    if (axios.isAxiosError(error)) {
      return error.response?.data?.error || error.message;
    }
    return 'Unknown error';
  }
}
