export const cellWidth = (base: number, md?: number, lg?: number): string[] => {
  const classes: string[] = [];

  if (typeof base === 'number') {
    classes.push(`report-table__cell--w-${base}`);
  }
  if (typeof md === 'number') {
    classes.push(`report-table__cell--w-md-${md}`);
  }
  if (typeof lg === 'number') {
    classes.push(`report-table__cell--w-lg-${lg}`);
  }

  return classes;
};
