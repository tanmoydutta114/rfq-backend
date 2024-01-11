import { Kysely } from "kysely";
import { DB } from "../../kysely/db";
import {
  IProductCategoriesFetchReqBody,
  IProductCategoryStoreReq,
  IProductsFetchReqBody,
} from "../utils/types";
import { createDate } from "../utils/utils";
import { Log } from "../utils/Log";

export class productsSqlOps {
  static async getProducts(
    sqlClient: Kysely<DB>,
    requestBody: IProductsFetchReqBody
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
      .selectFrom("products")
      .$if(!!requestBody.searchStr, (qb) =>
        qb.where((eb) =>
          eb.or([eb("name", "ilike", `%${requestBody.searchStr}%` as string)])
        )
      )
      .select((eb) => eb.fn.countAll<number>().as("total_products"))
      .execute();
    const totalCount = total_roles[0].total_products;

    const OFFSET = PAGE_SIZE * (requestBody.pageNo - 1);

    const roles = await sqlClient
      .selectFrom("products")
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

  // TODO : GET PRODUCT CATEGORIES BY THREE LEVEL

  static async getProductCategories(
    sqlClient: Kysely<DB>,
    requestBody: IProductCategoriesFetchReqBody
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
      .selectFrom("products_category as pc")
      .leftJoin("products_sub_category as psc", "psc.category_id", "pc.id")
      .leftJoin(
        "products_sub_sub_category as pssc",
        "pssc.category_id",
        "psc.id"
      )
      .$if(!!requestBody.searchStr, (qb) =>
        qb.where((eb) =>
          eb.or([
            eb(
              "category_name",
              "ilike",
              `%${requestBody.searchStr}%` as string
            ),
          ])
        )
      )
      .select((eb) => eb.fn.countAll<number>().as("total_categories"))
      .execute();
    const totalCount = total_roles[0].total_categories;

    const OFFSET = PAGE_SIZE * (requestBody.pageNo - 1);

    const roles = await sqlClient
      .selectFrom("products_category as pc")
      .leftJoin("products_sub_category as psc", "psc.category_id", "pc.id")
      .leftJoin(
        "products_sub_sub_category as pssc",
        "pssc.category_id",
        "psc.id"
      )
      .$if(!!requestBody.searchStr, (qb) =>
        qb.where((eb) =>
          eb.or([
            eb(
              "category_name",
              "ilike",
              `%${requestBody.searchStr}%` as string
            ),
          ])
        )
      )
      .orderBy(requestBody.sort.path, requestBody.sort.direction)
      .limit(PAGE_SIZE)
      .offset(OFFSET)
      .select(["id", "category_name", "created_on"])
      .execute();

    const hasMore = OFFSET + PAGE_SIZE < totalCount ? true : false;
    return {
      roles,
      totalCount,
      hasMore,
    };
  }

  static async storeProductCategory(
    sqlClient: Kysely<DB>,
    userId: string,
    categoryReqBody: IProductCategoryStoreReq
  ) {
    const categoryName = categoryReqBody.categoryName;
    const { categoryId, subCategoryId, subSubCategoryId } = categoryReqBody;
    const now = createDate();

    if (!categoryId) {
      Log.i(
        `This is main category, so we store the category in products_category table!`
      );
      const categoryId = await sqlClient
        .insertInto("products_category")
        .values({
          category_name: categoryName,
          created_by: userId,
          created_on: now,
          modified_by: userId,
          modified_on: now,
        })
        .returning("id")
        .execute();
    } else if (!subCategoryId) {
      Log.i(
        `This is sub category, so we store the category in products_sub_category table!`
      );
      const categoryId = await sqlClient
        .insertInto("products_sub_category")
        .values({
          category_name: categoryName,
          created_by: userId,
          created_on: now,
          modified_by: userId,
          modified_on: now,
        })
        .returning("id")
        .execute();
    } else if (!subSubCategoryId) {
      Log.i(
        `This is sub sub category, so we store the category in product_sub_sub_category table!`
      );
      const categoryId = await sqlClient
        .insertInto("products_sub_sub_category")
        .values({
          category_name: categoryName,
          created_by: userId,
          created_on: now,
          modified_by: userId,
          modified_on: now,
        })
        .returning("id")
        .execute();
    }
    return {
      isSuccess: true,
      message: `Product categories created successfully!`,
    };
  }
}
