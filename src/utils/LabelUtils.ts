export const getLabelByValue = (
  options: Array<{ label: string; value: string }>,
  value: string
): string => options.find((item) => item.value === value)?.label || '';
