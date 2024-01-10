import { Request } from "express";
import { rolesSqlOps } from "../sql/rolesSqlOps";
import { getSQLClient } from "../sql/database";
import { IRoleFetchReqBody } from "../utils/types";

export class rolesController {
  static async getRoles(req: Request) {
    const sqlClient = getSQLClient();
    const reqBody = req.body as IRoleFetchReqBody;
    const response = await rolesSqlOps.getRoleFromDB(sqlClient, reqBody);
    return {
      isSuccess: true,
      response,
    };
  }
}
