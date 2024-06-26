import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import config from "../config";
import { JsonWebTokenError } from "jsonwebtoken";

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode: number = err.statusCode || 500;
  let message: string = err.message || "Something went wrong";
  let errorDetails: any = err;

  if (err.name === "PrismaClientKnownRequestError" && err.code === "P2002") {
    statusCode = 400;
    const fieldName: string[] = err.meta.target;
    const firstLatterUppercase =
      fieldName[0].charAt(0).toUpperCase() + fieldName[0].slice(1);

    message = `${firstLatterUppercase} is alrady exits`;
    errorDetails = {
      issues: {
        field: err.meta.target,
      },
    };
  }

  if (err.name === "PrismaClientKnownRequestError" && err.code === "P2003") {
    console.log({err});
    statusCode = 400;
    const fieldName: string[] = err.meta.modelName;
    message = `${fieldName} not valid.`;
    errorDetails = {
      issues: {
        field: err.meta.field_name,
      },
    };
  }

  else if (err.name === "PrismaClientValidationError") {
    statusCode = 400
    const errorMessage = err?.message;
    const regex = /Argument `(.*)` is missing/;
    const fieldName = errorMessage?.match(regex);
    message = `${fieldName && fieldName[1]} is missing.`;
    errorDetails = config.node_env === "development" ? err : null
  }
  else if (err.name === "NotFoundError" && err.code === "P2025") {
    statusCode = 400
    message = err?.message;
    errorDetails = {
      issu: {
        issues: err.name
      }
    };
  }

  else if (err instanceof ZodError && err.name === "ZodError") {

    statusCode = 400;
    message = "";
    err.issues.map((issu) => {

      if (issu.message.includes("Expected")) {
        const fieldName = issu.path[issu.path.length - 1] as string;
        const firstLatterUppercase = fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
        message = message + firstLatterUppercase + " " + issu.message + ". ";
      }
      else {
        message = message + issu.message + ". ";
      }
      
    });
 
    errorDetails = { issues: err.issues };
  }


  else if (err instanceof JsonWebTokenError) {
    statusCode = 401
    message = "You are not authorized"
    errorDetails = config.node_env === "development" ? err : null
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errorDetails,
    stack: config.node_env === "development" ? err.stack : null,
  });
};

export default globalErrorHandler;
