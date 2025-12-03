// Profile menu related types

export enum ProfileMenuItemType {
  MY_PROFILE = "MY_PROFILE",
  MY_ADVENTURES = "MY_ADVENTURES",
  NOTIFICATIONS = "NOTIFICATIONS",
  SETTINGS = "SETTINGS",
  LOGOUT = "LOGOUT",
}

export enum ProfileMenuItemLabel {
  MY_PROFILE = "Το Προφίλ μου",
  MY_ADVENTURES = "Οι Εξορμήσεις μου",
  NOTIFICATIONS = "Ειδοποιήσεις",
  SETTINGS = "Ρυθμίσεις",
  LOGOUT = "Αποσύνδεση",
}

export interface ProfileMenuItem {
  type: ProfileMenuItemType;
  label: ProfileMenuItemLabel;
  icon: string; // Ionicons name
  route: string; // expo-router path
}

export const PROFILE_MENU_ITEMS: ProfileMenuItem[] = [
  {
    type: ProfileMenuItemType.MY_PROFILE,
    label: ProfileMenuItemLabel.MY_PROFILE,
    icon: "person-circle-outline",
    route: "/profile",
  },
  {
    type: ProfileMenuItemType.MY_ADVENTURES,
    label: ProfileMenuItemLabel.MY_ADVENTURES,
    icon: "compass-outline",
    route: "/adventures",
  },
  {
    type: ProfileMenuItemType.NOTIFICATIONS,
    label: ProfileMenuItemLabel.NOTIFICATIONS,
    icon: "notifications-outline",
    route: "/notifications",
  },
  {
    type: ProfileMenuItemType.SETTINGS,
    label: ProfileMenuItemLabel.SETTINGS,
    icon: "settings-outline",
    route: "/settings",
  },
  {
    type: ProfileMenuItemType.LOGOUT,
    label: ProfileMenuItemLabel.LOGOUT,
    icon: "log-out-outline",
    route: "/",
  },
];
