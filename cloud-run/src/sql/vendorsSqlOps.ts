import { InsertObject, Kysely } from "kysely";
import { DB } from "../../kysely/db";
import {
  ICategoryType,
  IRVendorFetchReqBody,
  IVenderCreateReq,
} from "../utils/types";
import { createDate } from "../utils/utils";
import { Log } from "../utils/Log";

export class vendorsSqlOps {
  static async getVendors(
    sqlClient: Kysely<DB>,
    requestBody: IRVendorFetchReqBody
  ) {
    const PAGE_SIZE =
      requestBody.pageSize ?? Number(process.env.PAGE_SIZE) ?? 40;
    if (!requestBody.sort) {
      requestBody.sort = {
        path: "created_on",
        direction: "desc",
      };
    }
    if (!requestBody.pageNo) {
      requestBody.pageNo = 1;
    }
    const total_roles = await sqlClient
      .selectFrom("vendors")
      .$if(!!requestBody.searchStr, (qb) =>
        qb.where((eb) =>
          eb.or([eb("name", "ilike", `%${requestBody.searchStr}%` as string)])
        )
      )
      .select((eb) => eb.fn.countAll<number>().as("total_categories"))
      .execute();
    const totalCount = total_roles[0].total_categories;

    const OFFSET = PAGE_SIZE * (requestBody.pageNo - 1);

    const roles = await sqlClient
      .selectFrom("vendors")
      .$if(!!requestBody.searchStr, (qb) =>
        qb.where((eb) =>
          eb.or([eb("name", "ilike", `%${requestBody.searchStr}%` as string)])
        )
      )
      .orderBy(requestBody.sort.path, requestBody.sort.direction)
      .limit(PAGE_SIZE)
      .offset(OFFSET)
      .select(["id", "name", "created_on"])
      .execute();

    const hasMore = OFFSET + PAGE_SIZE < totalCount ? true : false;
    return {
      roles,
      totalCount,
      hasMore,
    };
  }

  static async storeVendors(
    sqlClient: Kysely<DB>,
    userId: string,
    reqBody: IVenderCreateReq
  ) {
    const productCategories = reqBody.productCategories;
    const now = createDate();
    const response = await sqlClient.transaction().execute(async (db) => {
      const [storeVendorRes] = await db
        .insertInto("vendors")
        .values({
          name: reqBody.name,
          email: reqBody.email,
          contact_no: reqBody.contactNo,
          created_on: now,
          modified_on: now,
          created_by: userId,
          modified_by: userId,
        })
        .returning("id")
        .execute();
      const vendorId = storeVendorRes.id;
      Log.i(`Vendor added successfully, with id ${vendorId}`);

      if (!productCategories) {
        return {
          isSuccess: true,
          message: `Vendor added successfully! but no product categories mentioned.`,
        };
      }
      Log.i(`Attaching the product categories with the vendors!`);

      const vendorCategoryMap: InsertObject<DB, "vendor_category_map">[] =
        productCategories.map((category: ICategoryType) => {
          return {
            category_id: category.categoryId,
            vendor_id: vendorId,
            sub_category_id: category.subCategoryId,
            sub_sub_category_id: category.subSubCategoryId,
            created_by: userId,
            modified_by: userId,
            created_on: now,
            modified_on: now,
          };
        });
      const productCategoryMapRes = await db
        .insertInto("vendor_category_map")
        .values(vendorCategoryMap)
        .returning("id")
        .execute();
      Log.i(`Category map updated , ${productCategoryMapRes}`);
      return {
        isSuccess: true,
        message: `Vendors added successfully!`,
      };
    });
    return response;
  }
}
