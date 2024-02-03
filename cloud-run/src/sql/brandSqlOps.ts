import { Kysely } from "kysely";
import { DB } from "../../kysely/db";
import { IBradsCreateReq } from "../utils/types";
import { createDate } from "../utils/utils";
import { Log } from "../utils/Log";
import { InsertObjectOrList } from "kysely/dist/cjs/parser/insert-values-parser";

export class brandsSqlOps {
  static async storeBrands(
    sqlClient: Kysely<DB>,
    userId: string,
    reqBody: IBradsCreateReq
  ) {
    return await sqlClient.transaction().execute(async (db) => {
      const now = createDate();
      const brandName = reqBody.brandName;
      const brandDesc = reqBody.brandDesc;

      const storeBrand = await db
        .insertInto("brands")
        .values({
          name: brandName,
          description: brandDesc,
          created_by: userId,
          created_on: now,
          modified_on: now,
          modified_by: userId,
        })
        .returning("id")
        .execute();
      Log.i(`Brand create successfully! with id ${storeBrand[0].id}`);

      const productName = reqBody.productName;
      const productDesc = reqBody.productDesc;

      const storeProduct = await db
        .insertInto("products")
        .values({
          brand_id: storeBrand[0].id,
          name: productName,
          description: productDesc,
          created_by: userId,
          created_on: now,
          modified_by: userId,
          modified_on: now,
        })
        .returning("id")
        .execute();
      Log.i(`Product create successfully! with id ${storeProduct[0].id}`);

      if (!reqBody.subProducts || reqBody.subProducts.length === 0) {
        return {
          isSuccess: true,
          message: `Brands and product created successfully!`,
        };
      }
      Log.i(`Sub product available!`);

      const subProducts = reqBody.subProducts.map((subProduct) => {
        const data: InsertObjectOrList<DB, "sub_products"> = {
          name: subProduct.name,
          description: subProduct.desc,
          product_id: storeProduct[0].id,
          created_by: userId,
          created_on: now,
          modified_by: userId,
          modified_on: now,
        };

        return data;
      });

      const storeSubProducts = await db
        .insertInto("sub_products")
        .values(subProducts)
        .returning("id")
        .execute();
      Log.i(`Sub products added successfully!`, storeSubProducts);

      return {
        isSuccess: true,
        message: `Brands, product and sub-products created successfully!`,
      };
    });
  }
}
