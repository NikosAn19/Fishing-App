import { useAlertContext, AlertOptions } from '../../context/AlertContext';

export const useAlert = () => {
  const { showAlert, hideAlert } = useAlertContext();

  return {
    showAlert: (options: AlertOptions) => showAlert(options),
    showSuccess: (title: string, message: string) => showAlert({ title, message, type: 'success' }),
    showError: (title: string, message: string) => showAlert({ title, message, type: 'error' }),
    showInfo: (title: string, message: string) => showAlert({ title, message, type: 'info' }),
    showWarning: (title: string, message: string) => showAlert({ title, message, type: 'warning' }),
    hideAlert
  };
};
