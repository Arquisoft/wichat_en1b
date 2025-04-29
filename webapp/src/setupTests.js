// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

jest.mock('react-i18next', () => {
    const translations = require("../public/locales/en.json");
  
    return {
      useTranslation: () => ({
        t: (key, options = {}) => {
            if (typeof key !== 'string') {
              return '';
            }
          
            const template = key
              .split('.')
              .reduce((obj, part) => obj?.[part], translations);
          
            if (typeof template !== 'string') {
              return key;
            }
          
            return template.replace(/\{\{(.*?)\}\}/g, (_, varName) => options[varName.trim()] || '');
        },
        i18n: {
          changeLanguage: jest.fn((_) => "en"),
          language: "en"
        }
      })
    };
  });