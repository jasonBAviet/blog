// Một logger đơn giản có thể được mở rộng với pino hoặc winston sau này
export const logger = {
  info: (message: string, meta?: any) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta ? meta : "");
  },
  warn: (message: string, meta?: any) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta ? meta : "");
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
    if (error) {
      if (error instanceof Error) {
        console.error(error.stack);
      } else {
        console.error(error);
      }
    }
  },
};
