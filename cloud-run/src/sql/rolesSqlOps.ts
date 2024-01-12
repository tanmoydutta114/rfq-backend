import { Kysely } from "kysely";
import { DB } from "../../kysely/db";
import { IRoleCreateReq, IRoleFetchReqBody } from "../utils/types";
import { createDate } from "../utils/utils";
import { Log } from "../utils/Log";

export class rolesSqlOps {
  static async getRoleFromDB(
    sqlClient: Kysely<DB>,
    requestBody: IRoleFetchReqBody
  ) {
    const PAGE_SIZE =
      requestBody.pageSize ?? Number(process.env.PAGE_SIZE) ?? 40;
    if (!requestBody.sort) {
      requestBody.sort = {
        path: "created_on",
        direction: "desc",
      };
    }
    if (!requestBody.pageNo) {
      requestBody.pageNo = 1;
    }
    const total_roles = await sqlClient
      .selectFrom("roles")
      .$if(!!requestBody.searchStr, (qb) =>
        qb.where((eb) =>
          eb.or([
            eb("role_name", "ilike", `%${requestBody.searchStr}%` as string),
          ])
        )
      )
      .select((eb) => eb.fn.countAll<number>().as("total_roles"))
      .execute();
    const totalCount = total_roles[0].total_roles;

    const OFFSET = PAGE_SIZE * (requestBody.pageNo - 1);

    const roles = await sqlClient
      .selectFrom("roles")
      .$if(!!requestBody.searchStr, (qb) =>
        qb.where((eb) =>
          eb.or([
            eb("role_name", "ilike", `%${requestBody.searchStr}%` as string),
          ])
        )
      )
      .orderBy(requestBody.sort.path, requestBody.sort.direction)
      .limit(PAGE_SIZE)
      .offset(OFFSET)
      .select(["id", "role_name", "created_on"])
      .execute();

    const hasMore = OFFSET + PAGE_SIZE < totalCount ? true : false;
    return {
      roles,
      totalCount,
      hasMore,
    };
  }

  static async storeRole(
    sqlClient: Kysely<DB>,
    userId: string,
    requestBody: IRoleCreateReq
  ) {
    const now = createDate();
    const [response] = await sqlClient
      .insertInto("roles")
      .values({
        role_name: requestBody.roleName,
        created_on: now,
        created_by: userId,
        modified_on: now,
        modified_by: userId,
      })
      .returning("id")
      .execute();
    Log.i(`Role has been created successfully with id ${response.id}`);
    return {
      isSuccess: true,
      message: `role creation successfully!`,
    };
  }
}
