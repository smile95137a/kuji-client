export const getErrorMessage = (error: any, fallback = '發生未知錯誤') => {
  console.error('Error:', error);

  return (
    error?.response?.data?.message ||
    error?.message ||
    String(error) ||
    fallback
  );
};
