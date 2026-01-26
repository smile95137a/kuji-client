export const applySettledResult = <T>(
  result: PromiseSettledResult<{ data: T }>,
  setData: (data: T) => void,
  label: string,
  fallback: T
) => {
  if (result.status === 'fulfilled') {
    const data = result.value?.data;
    setData((data ?? fallback) as T);
  } else {
    console.error(`載入 ${label} 失敗:`, result.reason);
    setData(fallback);
  }
};
