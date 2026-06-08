import 'react-i18next';

import login from '../public/locales/en/login.json';
import signup from '../public/locales/en/signup.json';
import chat from '../public/locales/en/chat.json';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'login';
    resources: {
      login: typeof login;
      signup: typeof signup;
      chat: typeof chat;
    };
  }
}