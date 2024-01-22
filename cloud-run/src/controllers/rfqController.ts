import { Request } from "express";
import { getSQLClient } from "../sql/database";
import {
  IRfqCommentsReq,
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

  static async isRfqIdTaken(req: Request) {
    const sqlClient = getSQLClient();
    const rfqId: { rfqId: string } = req.body;
    const response = rfqSqlOps.isRfqExists(sqlClient, rfqId.rfqId);
    return response;
  }

  static async storeComment(req: Request) {
    const sqlCLient = getSQLClient();
    const userId = req.user?.uid ?? "";
    const rfqId = req.params.rfqId;
    const productId = Number(req.params.productId);
    const vendorId = Number(req.params.vendorId);
    const reqBody: IRfqCommentsReq = req.body;
    const response = await rfqSqlOps.storeRfqComments(
      sqlCLient,
      userId,
      rfqId,
      productId,
      vendorId,
      reqBody
    );
    return response;
  }

  static async getRfqProducts(req: Request) {
    const sqlCLient = getSQLClient();
    const rfqId = req.params.rfqId;
    const response = await rfqSqlOps.getRfqProducts(sqlCLient, rfqId);
    return response;
  }

  static async getComments(req: Request) {
    const sqlCLient = getSQLClient();
    const rfqId = req.params.rfqId;
    const productId = Number(req.params.productId);
    const vendorId = Number(req.params.vendorId);
    const response = await rfqSqlOps.getRfqComments(
      sqlCLient,
      rfqId,
      productId,
      vendorId
    );
    return response;
  }
}
