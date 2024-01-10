import { Request } from "express";
import { rolesSqlOps } from "../sql/rolesSqlOps";
import { getSQLClient } from "../sql/database";

export class rolesController {
  static async getRoles(req: Request) {
    const sqlClient = getSQLClient();
    const reqBody = req.body;
    const response = await rolesSqlOps.getRoleFromDB(sqlClient, reqBody);
    return {
      isSuccess: true,
      response,
    };
  }
}
