import type { Response } from 'express';
import {
  SUCCESS,
  CREATED,
  BAD_REQUEST,
  DOES_NOT_EXIST,
  CONFLICT,
  SERVER_ERROR,
} from './responseCodes.js';

export const success = (res: Response, body: unknown) => res.status(SUCCESS).send(body);

export const created = (res: Response, body: unknown) => res.status(CREATED).send(body);

export const missingQueryParam = (res: Response, param: string) =>
  res.status(BAD_REQUEST).send({ message: `Missing query param: [${param}]` });

export const missingBodyParam = (res: Response, param: string) =>
  res.status(BAD_REQUEST).send({ message: `Missing body param: [${param}]` });

export const doesNotExist = (res: Response, type: string, property: string, container?: string) =>
  res.status(DOES_NOT_EXIST).send({
    message: `${type} [${property}] does not exist${container ? ` in ${container}` : ''}`,
  });

export const alreadyExists = (
  res: Response,
  type: string,
  property: string,
  value: string,
  container?: string,
) =>
  res.status(CONFLICT).send({
    message: `${type} with ${property} [${value}] already exists${container ? ` in ${container}` : ''}`,
  });

export const serverError = (res: Response, error: unknown, message?: string) =>
  res.status(SERVER_ERROR).send({ message, error });
