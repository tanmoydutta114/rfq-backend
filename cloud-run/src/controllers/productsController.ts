import { Request } from "express";
import { getSQLClient } from "../sql/database";
import {
  IFetchProductsByCategoryId,
  IProductCategoriesFetchReqBody,
  IProductCategoryStoreReq,
  IProductStoreReq,
  IProductVendorFetchReqBody,
  IProductsFetchReqBody,
  ISubProductStore,
} from "../utils/types";
import { productsSqlOps } from "../sql/productsSqlOps";

export class productsController {
  static async getProducts(req: Request) {
    const sqlCLient = getSQLClient();
    const reqBody: IProductsFetchReqBody = req.body;
    const response = await productsSqlOps.getProducts(sqlCLient, reqBody);
    return response;
  }

  static async storeProducts(req: Request) {
    const sqlClient = getSQLClient();
    const userId = req.user?.uid ?? "";
    const reqBody: IProductStoreReq = req.body;

    const response = await productsSqlOps.storeProducts(
      sqlClient,
      userId,
      reqBody
    );
    return response;
  }
  static async storeSubProducts(req: Request) {
    const sqlClient = getSQLClient();
    const userId = req.user?.uid ?? "";
    const productId = Number(req.params.productId);
    const reqBody: ISubProductStore = req.body;

    const response = await productsSqlOps.storeSubProducts(
      sqlClient,
      userId,
      productId,
      reqBody
    );
    return response;
  }

  // static async getProductCategories(req: Request) {
  //   const sqlCLient = getSQLClient();
  //   const reqBody: IProductCategoriesFetchReqBody = req.body;
  //   const response = await productsSqlOps.getProductCategories(
  //     sqlCLient,
  //     reqBody
  //   );
  //   return response;
  // }

  static async getProductBrands(req: Request) {
    const sqlCLient = getSQLClient();
    const reqBody: IProductCategoriesFetchReqBody = req.body;
    const response = await productsSqlOps.getProductBrands(sqlCLient, reqBody);
    return response;
  }
  static async getSubProductsByProductId(req: Request) {
    const sqlCLient = getSQLClient();
    const productId = Number(req.params.productId);
    const response = await productsSqlOps.getSubProducts(sqlCLient, productId);
    return response;
  }

  // static async storeProductMainCategories(req: Request) {
  //   const sqlCLient = getSQLClient();
  //   const userId = req.user?.uid ?? "";
  //   const reqBody: { name: string } = req.body;
  //   const response = await productsSqlOps.storeMainCategory(
  //     sqlCLient,
  //     userId,
  //     reqBody.name
  //   );
  //   return response;
  // }
  // static async storeProductSubCategories(req: Request) {
  //   const sqlCLient = getSQLClient();
  //   const userId = req.user?.uid ?? "";
  //   const mainCategoryId = Number(req.params.mainCategoryId);
  //   const reqBody: { name: string } = req.body;

  //   const response = await productsSqlOps.storeSubCategory(
  //     sqlCLient,
  //     userId,
  //     mainCategoryId,
  //     reqBody.name
  //   );
  //   return response;
  // }
  // static async storeProductSubSubCategories(req: Request) {
  //   const sqlCLient = getSQLClient();
  //   const userId = req.user?.uid ?? "";
  //   const subCategoryId = Number(req.params.subCategoryId);
  //   const reqBody: { name: string } = req.body;
  //   const response = await productsSqlOps.storeSubSubCategory(
  //     sqlCLient,
  //     userId,
  //     subCategoryId,
  //     reqBody.name
  //   );
  //   return response;
  // }
  static async getProductVendors(req: Request) {
    const sqlCLient = getSQLClient();
    const productId = Number(req.params.productId);
    const reqBody: IProductVendorFetchReqBody = req.body;
    const response = await productsSqlOps.getProductVendors(
      sqlCLient,
      productId,
      reqBody
    );
    return response;
  }

  static async getProductsByCategoryId(req: Request) {
    const sqlClient = getSQLClient();
    const reqBody: IFetchProductsByCategoryId = req.body;
    const response = await productsSqlOps.getProductByCategory(
      sqlClient,
      reqBody
    );
    return response;
  }
}
