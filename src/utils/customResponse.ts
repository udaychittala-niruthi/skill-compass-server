import type { Response } from "express";

interface Res<T> {
  status: boolean;
  message: string;
  body?: T;
  err?: string;
}

export const sendResponse = <T>(
  res: Response,
  status: boolean,
  message: string,
  code: number = 200,
  body?: T,
  err?: string
) => {
  const response: Res<T> = {
    status,
    message,
    ...(body != undefined && { body }),
    ...(err && { err }),
  };
  return res.status(code).json(response);
};
