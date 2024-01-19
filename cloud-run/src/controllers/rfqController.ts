import { Request } from "express";
import { getSQLClient } from "../sql/database";
import {
  IRfqProducts,
  IRfqStoreReq,
  IRfqVendors,
  IRfqsFetchReqBody,
} from "../utils/types";
import { rfqSqlOps } from "../sql/rfqSqlOps";

export class rfqController {
  static async storeNewRfqs(req: Request) {
    const sqlClient = getSQLClient();
    const userId = req.user?.uid ?? "";
    const reqBody: IRfqStoreReq = req.body;
    const response = await rfqSqlOps.storeNewRfqs(sqlClient, userId, reqBody);
    return response;
  }

  static async addRFQProducts(req: Request) {
    const sqlClient = getSQLClient();
    const rfqId = req.params.rfqId;
    const reqBody: IRfqProducts = req.body;
    const userId = req.user?.uid ?? "";
    const response = await rfqSqlOps.storeRfqProducts(
      sqlClient,
      userId,
      rfqId,
      reqBody
    );
    return response;
  }

  static async addRFVendors(req: Request) {
    const sqlClient = getSQLClient();
    const rfqId = req.params.rfqId;
    const productId = Number(req.params.productId);
    const reqBody: IRfqVendors = req.body;
    const userId = req.user?.uid ?? "";
    const response = await rfqSqlOps.storeRfqVendors(
      sqlClient,
      userId,
      rfqId,
      productId,
      reqBody,
      ""
    );
    return response;
  }

  static async getRfqs(req: Request) {
    const sqlClient = getSQLClient();
    const reqBody: IRfqsFetchReqBody = req.body;
    const response = await rfqSqlOps.getRfqs(sqlClient, reqBody);
    return response;
  }
}
