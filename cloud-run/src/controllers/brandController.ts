import { Request } from "express";
import { getSQLClient } from "../sql/database";
import { IBradsCreateReq } from "../utils/types";
import { brandsSqlOps } from "../sql/brandSqlOps";

export class brandController {
  static async createBrand(req: Request) {
    const userId = req.user?.uid ?? "";
    const sqlClient = getSQLClient();
    const reqBody: IBradsCreateReq = req.body;
    const response = brandsSqlOps.storeBrands(sqlClient, userId, reqBody);
    return response;
  }
}
