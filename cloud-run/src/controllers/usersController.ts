import { Request } from "express";
import { getSQLClient } from "../sql/database";
import { ICreateUserReq } from "../utils/types";
import { getAuth } from "firebase-admin/auth";
import { Log } from "../utils/Log";

export class usersController {
  static async createUser(req: Request) {
    const sqlClient = getSQLClient();
    const userId = req.user?.uid;
    const reqBody: ICreateUserReq = req.body;
  }

  static async isUserExistsInFirebase(
    email: string,
    partnerContactNumber: string
  ) {
    try {
      const response = await getAuth().getUserByEmail(email);
      Log.i(`User is exists with user id: ${response.uid}`);
      return {
        isSuccess: true,
        message: `User is already exists with given email.`,
        user: response,
      };
    } catch (err) {
      if (err.errorInfo.code === "auth/user-not-found") {
        try {
          const responsePhone = await getAuth().getUserByPhoneNumber(
            partnerContactNumber
          );
          return {
            isSuccess: true,
            message: `User is already exists with given phone number.`,
            user: responsePhone,
          };
        } catch (error) {
          if (error.errorInfo.code === "auth/user-not-found") {
            Log.i(`User is not exists, so creating a new user.`);
            return { isSuccess: false, message: err.errorInfo.message };
          }
        }
      }
      return { isSuccess: true, message: err.errorInfo.message };
    }
  }

  static async createFirebaseUser(
    userName: string,
    email: string,
    contactNo?: string
  ) {
    const userDate = {
      email: email,
      displayName: userName,
      ...(contactNo ? { phoneNumber: contactNo } : {}),
    };

    const response = await getAuth().createUser(userDate);

    Log.i(`User is created with user id: ${response.uid}`);
    const newUserUID = response.uid;
    return { isSuccess: true, firebaseUserId: newUserUID };
  }
}
