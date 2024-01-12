import { Request } from "express";
import { rolesSqlOps } from "../sql/rolesSqlOps";
import { getSQLClient } from "../sql/database";
import { IRoleCreateReq, IRoleFetchReqBody } from "../utils/types";

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
  static async storeRoles(req: Request) {
    const sqlClient = getSQLClient();
    const userId = req.user?.uid ?? "";
    const reqBody: IRoleCreateReq = req.body;
    const response = await rolesSqlOps.storeRole(sqlClient, userId, reqBody);
    return {
      isSuccess: true,
      response,
    };
  }
}
