import { Request } from "express";
import { getSQLClient } from "../sql/database";
import { IRfqStoreReq, IRfqsFetchReqBody } from "../utils/types";
import { rfqSqlOps } from "../sql/rfqSqlOps";

export class rfqController {
  static async storeNewRfqs(req: Request) {
    const sqlClient = getSQLClient();
    const userId = req.user?.uid ?? "";
    const reqBody: IRfqStoreReq = req.body;
    const response = await rfqSqlOps.storeNewRfqs(sqlClient, userId, reqBody);
    return response;
  }

  static async getRfqs(req: Request) {
    const sqlClient = getSQLClient();
    const reqBody: IRfqsFetchReqBody = req.body;
    const response = await rfqSqlOps.getRfqs(sqlClient, reqBody);
    return response;
  }
}
