import { Request } from "express";
import { getSQLClient } from "../sql/database";
import {
  ICreateUserReq,
  IDeleteUserReq,
  IFirebaseUsersDetails,
  IUsersDetails,
} from "../utils/types";
import { getAuth } from "firebase-admin/auth";
import { Log } from "../utils/Log";
import { usersSqlOps } from "../sql/usersSqlOps";

export class usersController {
  static async getUser(req: Request) {
    const sqlClient = getSQLClient();
    const userId = req.user?.uid ?? "";
    const userInfo = await usersSqlOps.getUserDetails(sqlClient, userId);
    return userInfo;
  }
  static async getUsers(req: Request) {
    const sqlClient = getSQLClient();
    const users = await usersSqlOps.getUsers(sqlClient);
    return users;
  }
  static async deleteUser(req: Request) {
    const sqlClient = getSQLClient();
    const reqBody: IDeleteUserReq = req.body;
    const users = await usersSqlOps.deleteUser(sqlClient, reqBody.userId);
    return users;
  }

  static async createUser(req: Request) {
    const sqlClient = getSQLClient();
    const userId = req.user?.uid ?? "";
    const reqBody: ICreateUserReq = req.body;

    const isExists = await usersController.isUserExistsInFirebase(
      reqBody.email,
      reqBody.contact_no
    );

    if (isExists.isSuccess) {
      return isExists;
    }
    // Need to Create a new user in firebase.

    const firebaseUserDetails = await usersController.createFirebaseUser(
      reqBody.name,
      reqBody.email,
      reqBody.contact_no
    );
    Log.i(
      `Firebase user create successfully with uid ${firebaseUserDetails.firebaseUserId}`
    );

    //Need to store the data in firebase_user_data table and in users table.

    const response = await sqlClient.transaction().execute(async (db) => {
      const userDetailsFirebase: IFirebaseUsersDetails = {
        firebase_user_id: firebaseUserDetails.firebaseUserId,
        contact_number: reqBody.contact_no,
        user_email: reqBody.email,
        user_name: reqBody.name,
      };
      const storeInFirebaseTable =
        await usersSqlOps.storeNewUserInFirebaseUsersTable(
          db,
          userDetailsFirebase
        );

      Log.i(`${storeInFirebaseTable.message}`);

      const userDetailsUsers: IUsersDetails = {
        ...reqBody,
        firebase_user_id: firebaseUserDetails.firebaseUserId,
      };

      const storeInUsersTable = await usersSqlOps.storeUsers(
        db,
        userId,
        userDetailsUsers
      );
      Log.i(`${storeInUsersTable.message}`);

      return { isSuccess: true, message: `User create successfully!` };
    });
    return response;
  }

  static async isUserExistsInFirebase(
    email: string,
    partnerContactNumber?: string | null | undefined
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
        if (!partnerContactNumber) {
          Log.i(
            `User is not exists, so creating a new user. (NO CONTACT NUMBER)`
          );
          return { isSuccess: false, message: err.errorInfo.message };
        }
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
    contactNo?: string | null
  ) {
    const userDate = {
      email: email,
      displayName: userName,
      ...(contactNo ? { phoneNumber: contactNo } : {}),
    };

    const response = await getAuth().createUser(userDate);
    const newUserUID = response.uid;

    const customClaims = {
      ut: "2",
    };
    await getAuth().setCustomUserClaims(newUserUID, customClaims);

    Log.i(`Storing role id in claims`);
    Log.i(`User is created with user id: ${response.uid}`);
    return { isSuccess: true, firebaseUserId: newUserUID };
  }

  static async removeUserFromFirebase(userUID: string) {
    await getAuth().deleteUser(userUID);
    Log.i(`User is removed from Firebase successfully`);
  }
}
