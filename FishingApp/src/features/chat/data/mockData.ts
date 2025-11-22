import { ChannelGroup, Message } from "../types";

export const MOCK_CHANNELS: ChannelGroup[] = [
  {
    region: "Μακεδονία",
    channels: [
      {
        id: "mac-spinning",
        name: "Spinning",
        region: "Μακεδονία",
        category: "Spinning",
        unreadCount: 3,
        lastMessage: {
          text: "Πήρε κανείς τίποτα σήμερα;",
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        },
      },
      {
        id: "mac-casting",
        name: "Casting",
        region: "Μακεδονία",
        category: "Casting",
        lastMessage: {
          text: "Έχει πολύ κύμα στο Ποσείδι.",
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        },
      },
      {
        id: "mac-eging",
        name: "Eging",
        region: "Μακεδονία",
        category: "Eging",
      },
    ],
  },
  {
    region: "Αττική",
    channels: [
      {
        id: "att-spinning",
        name: "Spinning",
        region: "Αττική",
        category: "Spinning",
        unreadCount: 12,
        lastMessage: {
          text: "Πάμε Λαύριο αύριο;",
          timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
        },
      },
      {
        id: "att-lrf",
        name: "LRF",
        region: "Αττική",
        category: "LRF",
      },
      {
        id: "att-shore",
        name: "Shore Jigging",
        region: "Αττική",
        category: "Shore Jigging",
        lastMessage: {
          text: "Βγήκε ένα μαγιάτικο 5kg!",
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        },
      },
    ],
  },
  {
    region: "Κρήτη",
    channels: [
      {
        id: "crt-general",
        name: "Γενική Συζήτηση",
        region: "Κρήτη",
        category: "General",
      },
    ],
  },
];

export const MOCK_MESSAGES: Message[] = [
  {
    id: "1",
    text: "Καλησπέρα στην παρέα! Έχει πάει κανείς Χαλκιδική;",
    senderId: "user2",
    senderName: "Γιώργος Ψ.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "2",
    text: "Ήμουν εγώ χθες, είχε πολύ αέρα αλλά βγήκαν κάτι λαβράκια.",
    senderId: "user3",
    senderName: "Νίκος Κ.",
    timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
  },
  {
    id: "3",
    text: "Σε ποιο μέρος;",
    senderId: "user2",
    senderName: "Γιώργος Ψ.",
    timestamp: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
  },
  {
    id: "4",
    text: "Κασσάνδρα μεριά, από έξω.",
    senderId: "user3",
    senderName: "Νίκος Κ.",
    timestamp: new Date(Date.now() - 1000 * 60 * 48).toISOString(),
  },
  {
    id: "5",
    text: "Ωραίος! Θα δοκιμάσω αύριο πρωί.",
    senderId: "me", // Current user
    senderName: "Εγώ",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
];
