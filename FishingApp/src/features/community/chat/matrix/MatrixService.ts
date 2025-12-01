import { MatrixAuthManager } from './managers/MatrixAuthManager';
import { MatrixRoomManager } from './managers/MatrixRoomManager';
import { MatrixEventManager } from './managers/MatrixEventManager';

class MatrixService {
  private static instance: MatrixService;
  
  public auth: MatrixAuthManager;
  public rooms: MatrixRoomManager;
  public events: MatrixEventManager;

  private constructor() {
    this.auth = new MatrixAuthManager();
    
    // Pass the client getter to sub-managers so they always access the current client instance
    const getClient = () => this.auth.getClient();
    
    this.rooms = new MatrixRoomManager(getClient);
    this.events = new MatrixEventManager(getClient);
  }

  public static getInstance(): MatrixService {
    if (!MatrixService.instance) {
      MatrixService.instance = new MatrixService();
    }
    return MatrixService.instance;
  }
}

export const matrixService = MatrixService.getInstance();
