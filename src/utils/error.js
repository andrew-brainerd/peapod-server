const getError = ({ name, message, statusCode }) => `[${name} | ${statusCode}: ${message}]`;

module.exports = {
  getError
};
