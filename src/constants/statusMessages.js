const { SUCCESS, CREATED, BAD_REQUEST, CONFLICT, SERVER_ERROR } = require('./responseCodes');

const success = (res, body) => res.status(SUCCESS).send(body);

const created = (res, body) => res.status(SUCCESS).send(body);

const missingQueryParam = (res, param) =>
  res.status(BAD_REQUEST).send({ message: `Missing query param: [${param}]` });

const missingBodyParam = (res, param) =>
  res.status(BAD_REQUEST).send({ message: `Missing body param: [${param}]` });

const entityAlreadyExists = (res, type, property, value) =>
  res.status(CONFLICT).send({ message: `${type} with ${property} [${value}] already exists` });

const serverError = (res, error, message) =>
  res.status(SERVER_ERROR).send({ message: `${type} with ${property} [${value}] already exists` });

module.exports = {
  success,
  missingQueryParam,
  missingBodyParam,
  entityAlreadyExists,
  serverError
};
