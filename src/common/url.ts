export const formatUrlParams = (options: Record<string, string | number>): string => {
  if (!options || Object.keys(options).length === 0) return '';
  return `?${Object.keys(options)
    .map(o => `${o}=${options[o]}`)
    .join('&')}`;
};

export const isDefined = (value: unknown): boolean => {
  if (typeof value === 'string') {
    return value !== 'undefined';
  }
  return !!value;
};
