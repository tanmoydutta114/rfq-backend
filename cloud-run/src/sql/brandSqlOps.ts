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

  static async addVendorToBrand(
    sqlClient: Kysely<DB>,
    userId: string,
    brandId: number,
    vendorId: number,
    productId: number
  ) {
    const addVendor = await sqlClient
      .insertInto("brand_vendor_map")
      .values({
        brand_id: brandId,
        vendor_id: vendorId,
        product_id: productId,
        created_by: userId,
        created_on: createDate(),
        modified_by: userId,
        modified_on: createDate(),
      })
      .returning("id")
      .execute();
    Log.i(`Vendor brand updated successfully!`, addVendor);
    return {
      isSuccess: true,
      message: `Updated successfully!`,
    };
  }

  static async getVendorsByBrand(
    sqlClient: Kysely<DB>,
    brandId: number,
    productId: number
  ) {
    const vendors = await sqlClient
      .selectFrom("brand_vendor_map as bvm")
      .leftJoin("vendors as v", "bvm.vendor_id", "v.id")
      .leftJoin("products as p", "p.id", "bvm.product_id")
      .select(["v.id", "v.name", "v.email"])
      .where("bvm.brand_id", "=", brandId)
      .where("p.id", "=", productId)
      .execute();
    return {
      isSuccess: true,
      vendors,
    };
  }

  static async getProductsByBrandId(sqlClient: Kysely<DB>, brandId: number) {
    const products = await sqlClient
      .selectFrom("products")
      .where("brand_id", "=", brandId)
      .select(["name", "id", "description"])
      .execute();
    return products;
  }
}
