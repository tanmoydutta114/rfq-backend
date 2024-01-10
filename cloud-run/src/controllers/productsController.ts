import { Request } from "express";
import { getSQLClient } from "../sql/database";
import {
  IProductCategoriesFetchReqBody,
  IProductsFetchReqBody,
} from "../utils/types";
import { productsSqlOps } from "../sql/productsSqlOps";

export class productsController {
  static async getProducts(req: Request) {
    const sqlCLient = getSQLClient();
    const reqBody: IProductsFetchReqBody = req.body;
    const response = await productsSqlOps.getProducts(sqlCLient, reqBody);
    return response;
  }

  static async getProductCategories(req: Request) {
    const sqlCLient = getSQLClient();
    const reqBody: IProductCategoriesFetchReqBody = req.body;
    const response = await productsSqlOps.getProductCategories(
      sqlCLient,
      reqBody
    );
    return response;
  }

  static async storeProductCategories(req: Request) {
    const sqlCLient = getSQLClient();
    const userId = req.user?.uid ?? "";
    const reqBody: IProductCategoryStoreReq = req.body;
    const response = await productsSqlOps.storeProductCategory(
      sqlCLient,
      userId,
      reqBody
    );
    return response;
  }
}
