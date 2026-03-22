import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { AuthContextObject, ResponseType } from '../types';

const useAuthContext = (): ResponseType => {
  const context = useContext(AuthContext);

  if (!context) {
    return {
      data: null,
      error: {
        message: 'useAuthContext must be used inside AuthContextProvider',
        isFatal: true,
      },
    };
  }

  return {
    data: context,
    error: context.authError,
  };
};

export default useAuthContext;
