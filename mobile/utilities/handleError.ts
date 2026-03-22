import { Alert, BackHandler } from 'react-native';
import { AlertButton, ErrorType } from '../types';

export const displayError = (message: string, isQuit: boolean, buttons?: AlertButton[]) => {
  if (isQuit) {
    Alert.alert(
      'Error',
      message,
      [{ text: 'Quit', style: 'default', onPress: () => BackHandler.exitApp() }],
    );
  } else {
    Alert.alert(
      'Error',
      message,
      buttons ?? [{ text: 'OK', style: 'default' }],
    );
  }
};

export const logErrorAndSetState = (
  source: string,
  error: ErrorType | null,
  setState: (error: ErrorType | null) => void,
) => {
  if (!error) {
    setState(null);
    return null;
  }
  console.error(`Error while calling ${source}: ${error.message}`);
  setState(error);
};
