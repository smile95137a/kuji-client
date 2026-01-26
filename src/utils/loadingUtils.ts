export const withLoading = async <T>(fn: () => Promise<T>): Promise<T> => {
  return await fn();
};
