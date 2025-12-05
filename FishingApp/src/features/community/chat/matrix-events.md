# TECHNICAL REFERENCE: MATRIX SDK EVENT TYPES
# Project: Psaraki App
# Context: Chat Features & Room Management

================================================================================
1. OVERVIEW
================================================================================
In the Matrix Protocol, every action—from sending a message to changing a 
room name—is an "Event". All events share a common structure but differ in 
their `type` and `content` fields.

This document lists the essential event types required for the Psaraki App.

================================================================================
2. MESSAGE EVENTS (The Chat Log)
================================================================================
**Top Level Type:** `m.room.message`

These events carry the actual conversation content. The specific kind of 
message is defined by the `msgtype` field inside the `content` object.

| msgtype       | Description                                      | Usage in Psaraki App             |
| :---          | :---                                             | :---                             |
| **m.text** | Standard text message.                           | General chatting.                |
| **m.image** | Image file.                                      | User photos of catches/fish.     |
| **m.location**| Geolocation data (geo URI).                      | **CRITICAL:** Sharing fishing spots. |
| **m.video** | Video file.                                      | Fishing technique videos.        |
| **m.audio** | Audio file.                                      | Voice messages.                  |
| **m.file** | Generic file upload.                             | Sharing PDFs/guides.             |
| **m.notice** | Bot/System message.                              | Automated alerts (e.g., "Weather warning"). |
| **m.emote** | Action message (starts with /me).                | e.g., "* User casts a line".     |

================================================================================
3. ROOM STATE EVENTS (Configuration & Metadata)
================================================================================
These events define the "state" of the room (channel). They persist and 
describe the room's current properties.

| Event Type           | Description                                      |
| :---                 | :---                                             |
| **m.room.name** | The display name of the room (e.g., "Attiki").   |
| **m.room.topic** | The description/header of the room.              |
| **m.room.avatar** | The icon/image of the room.                      |
| **m.room.member** | **CRITICAL:** Tracks users joining, leaving, inviting, or being banned. Used to calculate the member count.|
| **m.room.create** | The first event sent when a room is created.     |
| **m.room.power_levels**| Defines permissions (Admin, Moderator, User).  |
| **m.room.join_rules**| Defines if the room is Public or Invite-only.    |

================================================================================
4. INTERACTION & EPHEMERAL EVENTS (Live UX)
================================================================================
These events provide "live" feedback to users. They are often ephemeral 
(not always stored in long-term history).

| Event Type           | Description                                      |
| :---                 | :---                                             |
| **m.typing** | Sent when a user is typing. Used to show "User is typing..." indicators. |
| **m.receipt** | **Read Receipts.** Indicates how far a user has read in the timeline (The "Checkmark" ✅). |
| **m.reaction** | Emoji reactions attached to a specific message ID (e.g., Like, Heart). |
| **m.room.redaction** | Sent when a user deletes/undoes a message. The SDK handles hiding the original message automatically. |

================================================================================
5. VOIP EVENTS (Optional / Future Use)
================================================================================
If we implement video calling in the future, these events handle the signaling.

| Event Type           | Description                                      |
| :---                 | :---                                             |
| **m.call.invite** | Initiates a call.                                |
| **m.call.answer** | Answers an incoming call.                        |
| **m.call.hangup** | Ends a call.                                     |

================================================================================
6. DATA STRUCTURE EXAMPLE (JSON)
================================================================================
This is how a Location Event (Fishing Spot) looks when the SDK receives it.

```json
{
  "type": "m.room.message",
  "sender": "@takis:matrix.psaraki.gr",
  "event_id": "$143275982_event_id",
  "origin_server_ts": 1632849200000,
  "content": {
    "msgtype": "m.location",
    "body": "Found a great Sea Bream spot here!",
    "geo_uri": "geo:37.9838,23.7275;u=10", 
    "info": {
      "thumbnail_url": "mxc://matrix.psaraki.gr/xyz123",
      "h": 300,
      "w": 400
    }
  }
}