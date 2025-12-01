================================================================================
PROJECT: PSARAKI APP - CHAT MODULE ARCHITECTURE
================================================================================
Date: 2025
Components: React Native (Expo), Node.js (Express), MongoDB, Matrix (Synapse), PostgreSQL
Docker Setup: Synapse & Postgres running in containers

================================================================================
1. HIGH-LEVEL ARCHITECTURE (THE HYBRID MODEL)
================================================================================
The application uses a hybrid architecture to separate Business Logic from 
Communication Logic.

A. THE BRAIN (Node.js + MongoDB)
   - Handles User Auth, Profiles, Friendships, and Chat Management.
   - Acts as the "Orchestrator" for the Matrix Server.
   - Stores references (Room IDs) but NOT the actual messages.

B. THE CARRIER (Matrix Synapse + PostgreSQL)
   - Handles Real-time Messaging, History, Encryption, and Presence.
   - Runs in a Docker Container alongside the main server.
   - Accessed directly by the Frontend for messaging (for performance).
   - Accessed by Node.js via Admin API for administrative tasks.

================================================================================
2. COMPONENT RESPONSIBILITIES
================================================================================

| Component        | Responsibility                                      |
|------------------|-----------------------------------------------------|
| Node.js Server   | - User Registration (creates Matrix user).          |
|                  | - Room Creation (Personal & Group).                 |
|                  | - Storing Room Metadata (Participants, Names).      |
|                  | - Managing Permissions (Kick/Ban).                  |
|------------------|-----------------------------------------------------|
| Matrix Server    | - Message Delivery & Storage.                       |
| (Synapse)        | - Image/Media Uploads.                              |
|                  | - Real-time Syncing & Push Notifications.           |
|------------------|-----------------------------------------------------|
| Frontend App     | - Asks Node.js to find/create a chat.               |
| (React Native)   | - Connects DIRECTLY to Matrix to send messages.     |
|                  | - Displays chat UI using Matrix SDK.                |

================================================================================
3. DATABASE SCHEMA STRATEGY (MongoDB)
================================================================================
The Node.js server acts as the directory. It maps internal users to Matrix IDs.

A. User Schema (MongoDB)
------------------------
{
  _id: ObjectId(...),
  username: "nikos_fisher",
  email: "...",
  matrix: {
    userId: "@nikos_fisher:localhost",  // Link to Matrix User
    deviceId: "...",
    isSynced: true
  }
}

B. Chat/Room Schema (MongoDB)
-----------------------------
{
  _id: ObjectId(...),
  type: "private" | "group",
  participants: [ObjectId(UserA), ObjectId(UserB)], 
  matrixRoomId: "!randomID:localhost", // <-- CRITICAL LINK
  createdAt: Date,
  lastMessageTimestamp: Date
}

================================================================================
4. CORE WORKFLOWS & USE CASES
================================================================================

USE CASE 1: USER REGISTRATION
------------------------------------------------------------
Goal: User signs up for "Psaraki" and gets a Chat ID automatically.

1. [App] sends POST /register to [Node.js].
2. [Node.js] creates user in MongoDB.
3. [Node.js] uses Admin Credentials to call Matrix API:
   -> "Register new user: @user:localhost"
4. [Matrix] confirms creation.
5. [Node.js] updates MongoDB user with `matrix.userId`.
6. [Node.js] returns Success to [App].

USE CASE 2: STARTING A PERSONAL CHAT
------------------------------------------------------------
Goal: User A wants to message User B for the first time.

1. [App] calls [Node.js]: POST /chats/start { recipient: UserB_ID }
2. [Node.js] checks MongoDB: Does a chat exist between A & B?
   IF YES: Returns existing `matrixRoomId`.
   IF NO:
     a. [Node.js] calls Matrix API: "Create private room (invite A & B)".
     b. [Matrix] returns new `!roomID`.
     c. [Node.js] creates new Chat Document in MongoDB with this ID.
     d. Returns `!roomID` to [App].

USE CASE 3: SENDING A MESSAGE
------------------------------------------------------------
Goal: Real-time communication.

1. [App] receives `!roomID` from the previous step.
2. [App] uses Matrix SDK to join/open room `!roomID`.
3. [App] sends message DIRECTLY to [Matrix Server].
   (Node.js is NOT involved here to save resources).
4. [Matrix] delivers message to User B's App.

USE CASE 4: CREATING A PUBLIC CHANNEL (e.g., "General Chat")
------------------------------------------------------------
Goal: Admin creates a community channel.

1. [Admin] requests "Create Channel" on Dashboard.
2. [Node.js] calls Matrix API to create a Public Room.
3. [Node.js] saves room details in MongoDB (Collection: Communities).
4. Users fetch the list from [Node.js] and join via Matrix SDK.

================================================================================
5. DEVOPS & SETUP SUMMARY
================================================================================
- The Matrix Server (Synapse) and Database (Postgres) run via Docker Compose.
- The Node.js server runs natively (or in its own container).
- Network: Internal Docker network links Synapse to Postgres.
- Auth: Node.js uses a `Shared Secret` to act as Admin on Synapse.

Critical Configs:
- Synapse Port: 8008 (Exposed to host).
- Mobile App Base URL: http://<YOUR_PC_IP>:8008 (NOT localhost).