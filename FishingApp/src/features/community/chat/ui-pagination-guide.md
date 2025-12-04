# TECHNICAL GUIDE: CHAT FETCHING & PAGINATION LOGIC
# Context: React Native (Inverted FlatList) & Matrix SDK

================================================================================
1. THE CONCEPTUAL MODEL
================================================================================

To implement smooth history fetching (scrolling up to see older messages), 
we rely on the **"Inverted List"** pattern.

In a standard UI, "Top" is the start. In a Chat UI, "Bottom" is the start.
Therefore, we invert the coordinate system:

* **Visual Bottom (Newest Message):** Corresponds to `Index 0` (Start of Array).
* **Visual Top (Oldest Message):** Corresponds to `Index N` (End of Array).

### The "Trigger" Zone
When the user scrolls UP towards the visual top, the system interprets this 
as scrolling towards the END of the list. This allows us to use standard 
"Infinite Scroll" logic, but visually reversed.

================================================================================
2. THE TRIGGER MECHANISM (onEndReached)
================================================================================

We do not manually calculate pixel positions. We utilize React Native's 
`FlatList` event system.

### The Listener: `onEndReached`
This event fires automatically when the user's scroll position enters a 
pre-defined "danger zone" near the end (visual top) of the list.

### The Sensitivity: `onEndReachedThreshold`
This value (0 to 1) determines how early the fetch begins.
* **Value 0.5 (Recommended):** The fetch triggers when the user is halfway 
    through the current content.
* **Goal:** To load the next batch of data *before* the user hits the edge, 
    creating the illusion of infinite content.

================================================================================
3. THE FETCHING LOGIC & GUARD CLAUSES
================================================================================

Since the scroll event can fire multiple times per second, we must implement 
strict logic to prevent duplicate requests or crashes.

### The 3-Step Flow:

#### Step 1: The Guard Clauses (Security)
Before talking to the server/Matrix, we run two checks:
1.  **`isLoading` check:** Is a fetch already in progress? If YES, stop immediately. 
    (Prevents double-spending bandwidth).
2.  **`hasMore` check:** Did the Matrix SDK previously signal that history is 
    exhausted? If YES, stop. (Prevents useless API calls).

#### Step 2: The Execution (Matrix SDK)
We lock the process (`isLoading = true`) and call:
`room.getLiveTimeline().paginate(EventTimeline.BACKWARDS, 20)`

#### Step 3: The State Update (The Visual Trick)
1.  Matrix loads new events into memory.
2.  We fetch the *entire* updated list from Matrix.
3.  We update the React State.
4.  **The Magic:** Because the list is `inverted`, React Native appends the 
    new messages to the **End of the Array** (Visual Top). 
    The `FlatList` engine is smart enough to keep the user's current scroll 
    position stable, pushing the new content into the invisible area above.

================================================================================
4. IMPLEMENTATION BLUEPRINT (CODE STRUCTURE)
================================================================================

```javascript
// STATE VARIABLES
const [messages, setMessages] = useState([]);
const [isLoading, setIsLoading] = useState(false);
const [hasMore, setHasMore] = useState(true);

// THE FETCH FUNCTION
const fetchMoreHistory = async () => {
  
  // --- [1] GUARD CLAUSES ---
  if (isLoading) {
    console.log("Already fetching, ignoring request.");
    return;
  }
  if (!hasMore) {
    console.log("No more history exists.");
    return;
  }

  // --- [2] LOCK & EXECUTE ---
  setIsLoading(true);

  try {
    // Request Matrix to load 20 older messages into memory
    const historyExists = await room.getLiveTimeline()
                                    .paginate(EventTimeline.BACKWARDS, 20);
    
    // --- [3] UPDATE DATA ---
    // Retrieve the full updated list from memory
    const allEvents = room.getLiveTimeline().getEvents();
    
    // Format and Reverse (Newest -> Oldest for Inverted List)
    const formatted = formatEvents(allEvents);

    setMessages(formatted); // React updates the list seamlessly
    setHasMore(historyExists); // Update flag for next time

  } catch (error) {
    console.error("Pagination failed", error);
  } finally {
    setIsLoading(false); // Unlock function
  }
};

// THE UI COMPONENT
return (
  <FlatList
    data={messages}
    inverted={true} // <--- THE KEY
    
    // Triggers
    onEndReached={fetchMoreHistory}
    onEndReachedThreshold={0.5}
    
    // Visuals
    renderItem={renderBubble}
    ListFooterComponent={isLoading ? <Loader /> : null}
  />
);
================================================================================ 5. SUMMARY
Direction: Scroll Up = Scroll to End (due to Inversion).

Trigger: onEndReached detects when user gets close to the top.

Safety: Guard clauses prevent chaos during fast scrolling.

UX: FlatList handles the insertion of new items without "jumping", provided the array is appended correctly.