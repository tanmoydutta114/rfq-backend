import { Request } from "express";
import { getSQLClient } from "../sql/database";
import { IProductsFetchReqBody } from "../utils/types";
import { productsSqlOps } from "../sql/productsSqlOps";

export class productsController {
  static async getProducts(req: Request) {
    const sqlCLient = getSQLClient();
    const reqBody: IProductsFetchReqBody = req.body;

    const response = await productsSqlOps.getProducts(sqlCLient, reqBody);

    return response;
  }
}
