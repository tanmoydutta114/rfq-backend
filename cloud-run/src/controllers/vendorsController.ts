import { Request } from "express";
import { getSQLClient } from "../sql/database";
import { IRVendorFetchReqBody, IVenderCreateReq } from "../utils/types";
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

  static async storeVendorDetails(req: Request) {
    const sqlClient = getSQLClient();
    const reqBody: IVenderCreateReq = req.body;
    const userId = req.user?.uid ?? "";
    const response = await vendorsSqlOps.storeVendors(
      sqlClient,
      userId,
      reqBody
    );
    return response;
  }
}
