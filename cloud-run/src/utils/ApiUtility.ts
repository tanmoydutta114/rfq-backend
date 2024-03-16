import { NextFunction, Request, Response } from "express";
import serviceAccount from "../google_credential.json";
import { getAuth } from "firebase-admin/auth";
import { Log } from "./Log";
import { HttpStatusCode } from "./HttpStatusCodes";

export class ApiUtility {
  static logInfo(req: Request, message: string, ...otherProps) {
    if (otherProps?.length) {
      message = message + ` (Attached in jsonPayload: ${otherProps?.length})`;
    }
    const entry = Object.assign(
      {
        severity: "INFO",
        message,
        otherProps: otherProps?.length ? otherProps : null,
      },
      { globalLogFields: req.globalLogFields }
    );
    // Serialize to a JSON string and output.
    console.log(JSON.stringify(entry));
  }
  static isDev() {
    return serviceAccount.is_test ?? false;
  }
  static logError(
    req: Request,
    message: string,
    err?: Error | null,
    ...otherProps
  ) {
    if (otherProps?.length) {
      message =
        message +
        ` (Attached in jsonPayload: ${otherProps?.length}, error: ${
          err ? "Yes" : "No"
        })`;
    }
    const entry = Object.assign(
      {
        severity: "ERROR",
        message,
        error: err?.stack ?? null,
        otherProps: otherProps?.length ? otherProps : null,
      },
      { globalLogFields: req.globalLogFields }
    );
    // Serialize to a JSON string and output.
    console.log(JSON.stringify(entry));
  }

  // Set user type in the custom claims for firebase users.
  static checkUserAuth(params) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const isTestMode = process.env.RUN_MODE ?? false;
      const accessType = params?.accessType ?? "admin";
      console.log(accessType);
      Log.i(`Checking authentication for ${req.url}`);
      try {
        if (isTestMode) {
          req.user = {
            uid: process.env.TEST_UID,
            email: process.env.TEST_EMAIL,
          };
          req.claims = { ut: "a" };
        } else if (accessType !== "external") {
          const authHeader = req.headers["authorization"] as string;
          let authToken: string;
          if (authHeader?.split(" ")[0] === "Bearer") {
            authToken = authHeader.split(" ")[1];
            const decodedToken = await getAuth().verifyIdToken(authToken);
            req.user = {
              uid: decodedToken.uid,
              email: decodedToken.email,
              name: decodedToken.name,
            };
            req.claims = { ut: "a" };
          } else {
            Log.e(` checkUserAuth failed.`, null);
            return res
              .status(HttpStatusCode.UNAUTHORIZED)
              .send(`Access not allowed token is missing.`);
          }
        } else {
          req.claims = { ut: "e" };
        }
        if (params?.accessType === "admin" && req.claims.ut !== "a") {
          Log.e(` checkUserAuth failed.`, null);
          return res
            .status(HttpStatusCode.UNAUTHORIZED)
            .send(`Access not allowed user type is not admin.`);
        }
        if (req.claims?.ut === "a") {
          Log.i(`Logged in as admin`);
        } else {
          Log.i(`Logged in as external`);
        }
        next();
      } catch (err) {
        Log.e(` Access not allowed`, err);
        const errorObject = {
          message: "Access not allowed",
          error: err.message,
        };
        res.status(HttpStatusCode.UNAUTHORIZED).send(errorObject);
      }
    };
  }
}
