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

  static async addBrandVendor(req: Request) {
    const userId = req.user?.uid ?? "";
    const sqlClient = getSQLClient();
    const brandId = Number(req.params.brandId);
    const vendorId = Number(req.params.vendorId);
    const response = brandsSqlOps.addVendorToBrand(
      sqlClient,
      userId,
      brandId,
      vendorId
    );
    return response;
  }

  static async getVendorsByBrandAndProductId(req: Request) {
    const sqlClient = getSQLClient();
    const brandId = Number(req.params.brandId);
    const productId = Number(req.params.productId);
    const response = await brandsSqlOps.getVendorsByBrand(
      sqlClient,
      brandId,
      productId
    );
  }
}
