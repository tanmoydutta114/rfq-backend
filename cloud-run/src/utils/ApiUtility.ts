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
      const isTestMode = this.isDev();
      const accessType = params?.accessType;
      Log.i(`Checking authentication for ${req.url}`);

      if (isTestMode) {
        req.user = {
          uid: process.env.TEST_UID,
          email: process.env.TEST_EMAIL,
        };
      } else {
        const authHeader = req.headers["authorization"] as string;
        let authToken: string;
        try {
          if (authHeader?.split(" ")[0] === "Bearer") {
            authToken = authHeader.split(" ")[1];

            const decodedToken = await getAuth().verifyIdToken(authToken);
            req.user = {
              uid: decodedToken.uid,
              email: decodedToken.email,
              name: decodedToken.name,
            };
          }
          if (params.accessType === "admin" && req.claims.ut === "a") {
            Log.e(` checkUserAuth failed.`, null);
            return res
              .status(HttpStatusCode.UNAUTHORIZED)
              .send(`Access not allowed user type is not admin.`);
          } else {
            if (accessType) {
              Log.i("Logged in as admin");
            } else {
              Log.i("Logged in as partner");
            }
          }
          req.verifyRes = { isAllowed: true };
        } catch (err) {
          Log.e(` Access not allowed`, err);
          const errorObject = {
            message: "Access not allowed",
            error: err.message,
          };
          res.status(HttpStatusCode.UNAUTHORIZED).send(errorObject);
        }
      }
    };
  }
}
