import { InsertObject, Kysely } from "kysely";
import { DB } from "../../kysely/db";
import {
  IFirebaseUsersDetails,
  IUsersDetails,
  UserStatus,
} from "../utils/types";
import { createDate } from "../utils/utils";
import { getAuth } from "firebase-admin/auth";
import { HttpError } from "../utils/HttpError";
import { HttpStatusCode } from "../utils/HttpStatusCodes";
import { Log } from "../utils/Log";

export class usersSqlOps {
  static async storeNewUserInFirebaseUsersTable(
    sqlClient: Kysely<DB>,
    userDetails: IFirebaseUsersDetails
  ) {
    const now = createDate();
    const userDataWithExtInfo: InsertObject<DB, "firebase_users"> = {
      ...userDetails,
      created_on: now,
    };
    const [response] = await sqlClient
      .insertInto("firebase_users")
      .values(userDataWithExtInfo)
      .returning("firebase_user_id")
      .execute();
    return {
      isSuccess: true,
      message: `Firebase user added successfully!, with uid : ${response.firebase_user_id}`,
    };
  }

  static async storeUsers(
    sqlClient: Kysely<DB>,
    userId: string,
    userDetails: IUsersDetails
  ) {
    const now = createDate();
    const userDataWithExtInfo: InsertObject<DB, "users"> = {
      ...userDetails,
      status: UserStatus.Active,
      created_on: now,
      created_by: userId,
      modified_by: userId,
      modified_on: now,
    };

    const [response] = await sqlClient
      .insertInto("users")
      .values(userDataWithExtInfo)
      .returning("id")
      .execute();
    return {
      isSuccess: true,
      message: ` User added successfully!, with id : ${response.id}`,
    };
  }

  static async getUserDetails(sqlClient: Kysely<DB>, userId: string) {
    const userInfo = await sqlClient
      .selectFrom("users")
      .where("firebase_user_id", "=", userId)
      .select(["name", "email", "id"])
      .execute();
    if (userInfo.length < 1) {
      return { isSuccess: false, userInfo: null };
    }
    return { isSuccess: true, useInfo: userInfo[0] };
  }
  static async getUsers(sqlClient: Kysely<DB>) {
    const users = await sqlClient
      .selectFrom("users")
      .select(["name", "email", "id"])
      .execute();
    return users;
  }

  static async deleteUser(sqlClient: Kysely<DB>, userId: number) {
    return await sqlClient.transaction().execute(async (db) => {
      const firebaseUserId = await db
        .selectFrom("users")
        .where("id", "=", userId)
        .select("firebase_user_id")
        .executeTakeFirst();

      if (!firebaseUserId || !firebaseUserId.firebase_user_id) {
        return new HttpError(HttpStatusCode.NOT_FOUND, `User Id not found`);
      }

      const users = await sqlClient
        .deleteFrom("users")
        .where("id", "=", userId)
        .execute();

      const deleteFromFirebase = await getAuth().deleteUser(
        firebaseUserId.firebase_user_id
      );
      Log.i(`User deleted from Firebase Response ${deleteFromFirebase}`);
      return {
        isSuccess: true,
        message: `Successfully deleted!`,
      };
    });
  }
}
