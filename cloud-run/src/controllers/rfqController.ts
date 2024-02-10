import { Request, Response } from "express";
import { getSQLClient } from "../sql/database";
import {
  IRfqCommentsReq,
  IRfqProducts,
  IRfqStoreReq,
  IRfqVendors,
  IRfqsFetchReqBody,
} from "../utils/types";
import { rfqSqlOps } from "../sql/rfqSqlOps";
import { HttpError } from "../utils/HttpError";
import { HttpStatusCode } from "../utils/HttpStatusCodes";

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
    const brandId = Number(req.params.brandId);
    const response = await rfqSqlOps.storeRfqProducts(
      sqlClient,
      userId,
      rfqId,
      reqBody,
      brandId
    );
    return response;
  }

  static async addRFVendors(req: Request) {
    const sqlClient = getSQLClient();
    const rfqId = req.params.rfqId;
    const productId = Number(req.params.productId);
    const brandId = Number(req.params.brandId);
    const reqBody: IRfqVendors = req.body;
    const userId = req.user?.uid ?? "";
    const response = await rfqSqlOps.storeRfqVendors(
      sqlClient,
      userId,
      rfqId,
      productId,
      brandId,
      reqBody.vendors,
      reqBody.emailBody
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

  static async storeFile(req: Request) {
    const sqlCLient = getSQLClient();
    const fileData = req.file;

    if (!fileData) {
      throw new HttpError(HttpStatusCode.BAD_REQUEST, "File not found");
    }

    const { originalname, buffer } = fileData;
    const fileType = originalname.split(".").pop() ?? "";

    // TODO : The file is now need to store in DB

    const response = await rfqSqlOps.storeFile(
      sqlCLient,
      originalname,
      fileType,
      buffer
    );
    return response;
  }

  static async deleteFile(req: Request) {
    const sqlCLient = getSQLClient();
    const fileId: string = req.params.fileId;

    const response = await rfqSqlOps.deleteFile(sqlCLient, fileId);
    return response;
  }

  static async downloadFile(req: Request, res: Response) {
    const sqlCLient = getSQLClient();
    const fileId = req.params.fileId;

    const fileResponse = await rfqSqlOps.getFile(sqlCLient, fileId);
    res.setHeader(
      "Content-Type",
      `application/${fileResponse.fileData.file_type}`
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${fileResponse.fileData.file_name}`
    );

    res.status(200).send(fileResponse.fileData.file_data);
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
  static async getRFQAddProductsDropdown(req: Request) {
    const sqlCLient = getSQLClient();
    const rfqId = req.params.rfqId;
    const response = await rfqSqlOps.getRFQAddProductsDropdown(
      sqlCLient,
      rfqId
    );
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

  static async getRfqProductWiseVendors(req: Request) {
    const sqlCLient = getSQLClient();
    const refqId = req.params.rfqId;
    const productId = Number(req.params.productId);
    const response = await rfqSqlOps.getRfqProductWiseVendors(
      sqlCLient,
      refqId,
      productId
    );
    return response;
  }

  static async getProductVendorsWhomEmailNotSent(req: Request) {
    const sqlCLient = getSQLClient();
    const rfqId = req.params.rfqId;
    const productId = Number(req.params.productId);
    const response = await rfqSqlOps.getVendorByProductIdWhomMailNotYetSent(
      sqlCLient,
      productId,
      rfqId
    );
    return response;
  }
  static async getBrandsProductsByRfqId(req: Request) {
    const sqlClient = getSQLClient();
    const rfqId = req.params.rfqId;
    const response = await rfqSqlOps.getRFQBrandsAndProduct(sqlClient, rfqId);
    return response;
  }
  static async getVendorsByRfqIdAndBrand(req: Request) {
    const sqlClient = getSQLClient();
    const rfqId = req.params.rfqId;
    const brandId = Number(req.params.brandId);

    const response = await rfqSqlOps.getRFQVendorsByBrandAndRfq(
      sqlClient,
      rfqId,
      brandId
    );
    return response;
  }

  static async getRFQProductsByBrandAndRfq(req: Request) {
    const sqlClient = getSQLClient();
    const rfqId = req.params.rfqId;
    const brandId = Number(req.params.brandId);

    const response = await rfqSqlOps.getRFQProductsByBrandAndRfq(
      sqlClient,
      rfqId,
      brandId
    );
    return response;
  }
}
