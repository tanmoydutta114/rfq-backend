import express, { NextFunction, Request, Response } from "express";
// import { HttpError, sendErrorResponse } from "./utils/HttpError";
import admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import cors from "cors";
import { get, set } from "lodash";
import { ZodArray, ZodEffects, ZodObject, ZodRecord, z } from "zod";
// import { companyController } from "./controllers/companyController";
import { Log } from "./utils/Log";
import { ApiUtility } from "./utils/ApiUtility";
import { HttpError, sendErrorResponse } from "./utils/HttpError";
import { HttpStatusCode } from "./utils/HttpStatusCodes";
import { ICheckPermSchemaParams, ZRoleFetchReqBody } from "./utils/types";
import { rolesController } from "./controllers/rolesController";

const app = express();
app.use(cors());
app.use(express.json());

app.set("port", process.env.PORT || 8080);

app.get("/", (req, res) => {
  res.send(`Hello from cloud run!`);
});

app.get(
  "/roles",
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({
    zodValidation: [{ zodSchema: ZRoleFetchReqBody }],
  }),
  callableWrapper(rolesController.getRoles)
);

function checkPermissionAndReqSchema<T>(params: ICheckPermSchemaParams) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (params.expectedProps) {
        if (params.expectedProps.body?.length) {
          for (const bodyProp of params.expectedProps.body) {
            if (get(req.body, bodyProp) === undefined) {
              throw new HttpError(
                HttpStatusCode.BAD_REQUEST,
                "Invalid request",
                {
                  message: `${bodyProp} is missing from request body properties`,
                }
              );
            }
          }
        }
        if (params.expectedProps.params?.length) {
          for (const paramProp of params.expectedProps.params) {
            if (!get(req.params, paramProp)) {
              throw new HttpError(
                HttpStatusCode.BAD_REQUEST,
                "Invalid request",
                {
                  message: `${paramProp} is missing from request url params`,
                }
              );
            }
          }
        }
        if (params.expectedProps?.query?.length) {
          for (const queryProp of params.expectedProps.query) {
            if (!get(req.query, queryProp)) {
              throw new HttpError(
                HttpStatusCode.BAD_REQUEST,
                "Invalid request",
                {
                  message: `${queryProp} is missing from request url query`,
                }
              );
            }
          }
        }
      }
      if (params.zodValidation) {
        for (const validation of params.zodValidation) {
          const zodObject = validation.zodSchema;
          const obj = validation.bodyProp
            ? get(req.body, validation.bodyProp)
            : req.body;
          const result = zodObject.safeParse(obj);
          if (!result.success) {
            throw new HttpError(
              500,
              `System encountered an internal error. Please contact the technical support team.`,
              {
                message: `Failed to validate the request schema for ${
                  validation.bodyProp
                    ? `${validation.bodyProp} in req body`
                    : "req body"
                }`,
                objects: result.error.errors,
              }
            );
          } else {
            // Mutate the body props to remove unwanted parts of the schema such as any extra keys
            if (validation.bodyProp) {
              set(req.body, validation.bodyProp, result.data);
            } else {
              req.body = result.data;
            }
          }
        }
      }
      next();
    } catch (err) {
      sendErrorResponse(err, req, res);
    }
  };
}

function callableWrapper<T>(cF: (req: Request) => Promise<T>) {
  return async (req: Request, res: Response) => {
    try {
      const result = await cF(req);
      //DEV NOTE: commenting logging response because of memory issue
      // if (ApiUtility.isDev()) {
      // 	ApiUtility.logInfo(req, `Successfully completed the operation.`, result ?? { isSuccess: true });
      // }
      res.status(200).send(result ?? { isSuccess: true });
    } catch (err) {
      await sendErrorResponse(err, req, res);
    }
  };
}

export default app;
