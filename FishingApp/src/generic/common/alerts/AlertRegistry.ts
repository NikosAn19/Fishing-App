import { AlertMessage } from "./messages";
import { AlertOptions } from "../../../context/AlertContext";

export class AlertRegistry {
  static get(errorOrMessage: any): AlertOptions {
    const message = typeof errorOrMessage === 'string' 
      ? errorOrMessage 
      : (errorOrMessage?.message || '');

    // 1. Check for specific Conflict messages (Backend returns these in English)
    if (message.includes('already sent you a friend request')) {
      return {
        title: 'Ειδοποίηση',
        message: AlertMessage.ALREADY_RECEIVED,
        type: 'info'
      };
    }

    if (message.includes('You are already friends')) {
      return {
        title: 'Ειδοποίηση',
        message: AlertMessage.ALREADY_FRIENDS,
        type: 'info'
      };
    }

    if (message.includes('Request already sent')) {
       return {
        title: 'Ειδοποίηση',
        message: AlertMessage.ALREADY_SENT,
        type: 'info'
      };
    }

    // 2. Check for other known errors
    if (message.includes('User not found')) {
      return {
        title: 'Σφάλμα',
        message: AlertMessage.USER_NOT_FOUND,
        type: 'error'
      };
    }

    // 3. Fallback / Generic
    return {
      title: 'Σφάλμα',
      message: AlertMessage.GENERIC_ERROR,
      type: 'error'
    };
  }

  static success(message: AlertMessage): AlertOptions {
      return {
          title: 'Επιτυχία',
          message: message,
          type: 'success'
      };
  }
  
  static info(message: AlertMessage): AlertOptions {
      return {
          title: 'Πληροφορία',
          message: message,
          type: 'info'
      };
  }
}
