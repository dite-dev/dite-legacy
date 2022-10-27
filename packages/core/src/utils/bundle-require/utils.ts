import { createRequire } from 'module';
import strip from 'strip-json-comments';

export function jsoncParse(data: string) {
  try {
    return new Function('return ' + strip(data).trim())();
  } catch (_) {
    // Silently ignore any error
    // That's what tsc/jsonc-parser did after all
    return {};
  }
}

export const __require =
  typeof require === 'function' ? require : createRequire(import.meta.url);

export const getRandomId = () => {
  return Math.random().toString(36).substring(2, 15);
};
