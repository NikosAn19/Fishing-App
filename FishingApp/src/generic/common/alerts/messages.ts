export enum AlertMessage {
  // Success
  FRIEND_REQUEST_SENT = "Το αίτημα φιλίας στάλθηκε επιτυχώς!",
  
  // Info / Conflicts
  ALREADY_SENT = "Το αίτημα έχει ήδη σταλεί.",
  ALREADY_FRIENDS = "Είστε ήδη φίλοι με αυτόν τον χρήστη!",
  ALREADY_RECEIVED = "Αυτός ο χρήστης σας έχει στείλει ήδη αίτημα. Ελέγξτε τις ειδοποιήσεις σας.",
  WAIT_FOR_INFO = "Παρακαλώ περιμένετε, οι πληροφορίες χρήστη φορτώνονται...",
  
  // Errors
  GENERIC_ERROR = "Παρουσιάστηκε σφάλμα. Προσπαθήστε ξανά αργότερα.",
  USER_NOT_FOUND = "Ο χρήστης δεν βρέθηκε.",
  CHAT_START_FAILED = "Αποτυχία έναρξης συνομιλίας."
}
