import { InsertObject, Kysely } from "kysely";
import { DB } from "../../kysely/db";
import {
  IFirebaseUsersDetails,
  IUsersDetails,
  UserStatus,
} from "../utils/types";
import { createDate } from "../utils/utils";

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
}
