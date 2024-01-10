import { Kysely } from "kysely";
import { DB } from "../../kysely/db";
import { IRoleFetchReqBody } from "../utils/types";

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
}
