import express, { NextFunction, Request, Response } from "express";
// import { HttpError, sendErrorResponse } from "./utils/HttpError";
import admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import cors from "cors";
// import { get, set } from "lodash";
// import { ZodArray, ZodEffects, ZodObject, ZodRecord, z } from "zod";
// import { companyController } from "./controllers/companyController";
import { Log } from "./utils/Log";


const app = express();
app.use(cors());

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


export default app;
