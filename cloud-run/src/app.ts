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
import { ICheckPermSchemaParams } from "./utils/types";

const app = express();
app.use(cors());
app.use(express.json());
// export async function verifyAdminUser(req: Request, params) {
//   const userId = req.user?.uid ?? "";
//   const { companyId } = req.params;
//   const isAdmin = await companyController.isAdmin(userId);
//   return {
//     isAllowed: isAdmin,
//   };
// }

function checkUserAuth(params) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const mode = req.params.mode;
    if (mode && mode !== "prod" && mode !== "test") {
      res.status(400).send("Api Mode is incorrect");
      return;
    }
    const isTestMode = process.env.RUN_MODE === "test";
    console.log("Checking auth for ", req.url);
    try {
      let userCompanies;
      if (isTestMode) {
        req.user = {
          uid: process.env.TEST_UID,
          email: process.env.TEST_EMAIL,
        };
        userCompanies = { ["2"]: { r: "", a: true, t: 0 } };
      } else {
        const authHeader = req.headers["authorization"] as string;
        let authToken: string = "";

        if (authHeader?.split(" ")[0] === "Bearer") {
          authToken = authHeader.split(" ")[1];
        }
        const decodedToken = await getAuth().verifyIdToken(authToken);
        req.claims = { c: decodedToken.c };
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          name: decodedToken.name,
        };

        if (req.params.companyId) {
          userCompanies = decodedToken?.c;
          req.user.active = userCompanies[req.params.companyId]?.a;
        }
        console.log("Auth verified");
      }
      const companyId = req.params.companyId;
      // DEVNOTE: Even a blank company id string should be rejected
      if (companyId !== undefined) {
        if (
          !companyId ||
          Object.keys(userCompanies).indexOf(companyId) === -1
        ) {
          Log.e(
            ` Company access not allowed for ${companyId} to user email: ${req.user?.email}`,
            null
          );
          return res.status(403).send("Access not allowed");
        }
      }
      Log.i(
        req + ` Auth verified. Request Detail: uid = ${req.user?.uid}`,
        req.params,
        req.body
      );
      // if (params) {
      //   let verifyRes;

      //   verifyRes = await verifyAdminUser(req, params);

      //   console.log(verifyRes);
      //   if (!verifyRes.isAllowed) {
      //     Log.e(
      //       ` checkUserAuth failed. verifyRes = ${JSON.stringify(verifyRes)}`,
      //       null
      //     );
      //     return res.status(403).send(`Access not allowed`);
      //   }
      //   req.verifyRes = verifyRes as any;
      // }
      next();
    } catch (err) {
      //   Log.e(` Access not allowed`, err);
      res.status(403).send("Access not allowed");
    }
  };
}

// function callableWrapper<T>(cF: (req: Request) => Promise<T>) {
//   return async (req: Request, res: Response) => {
//     try {
//       const result = await cF(req);
//       res.status(200).send(result ?? { isSuccess: true });
//     } catch (err) {
//       await sendErrorResponse(err, req, res);
//     }
//   };
// }

app.set("port", process.env.PORT || 8080);

app.get("/", (req, res) => {
  res.send(`Hello from cloud run!`);
});

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
      if (params.permissions?.length) {
        const { error } = await ApiUtility.verifyUserPermissions(
          params.permissions,
          req.verifyUserReturnValue.user,
          req.params.companyId
        );
        if (error) {
          ApiUtility.logInfo(req, error);
          throw new HttpError(
            HttpStatusCode.FORBIDDEN,
            "Sorry you are not allowed to perform this action"
          );
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
