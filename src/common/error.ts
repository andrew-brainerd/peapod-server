interface ErrorInfo {
  name?: string;
  message?: string;
  statusCode?: number;
}

export const getError = ({ name, message, statusCode }: ErrorInfo): string =>
  name && message && statusCode ? ` [${name} | ${statusCode}: ${message}]` : '';
