import { Request } from "express";
import { getSQLClient } from "../sql/database";
import { IRVendorFetchReqBody } from "../utils/types";
import { vendorsSqlOps } from "../sql/vendorsSqlOps";

export class vendorsController {
  static async getVendors(req: Request) {
    const sqlClient = getSQLClient();
    const reqBody: IRVendorFetchReqBody = req.body;
    const response = await vendorsSqlOps.getVendors(sqlClient, reqBody);
    return {
      isSuccess: true,
      response,
    };
  }
}
