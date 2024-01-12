import { Kysely } from "kysely";
import { DB } from "../../kysely/db";
import {
  IProductCategoriesFetchReqBody,
  IProductCategoryStoreReq,
  IProductStoreReq,
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
    const mainCategoryName = categoryReqBody.categories[0].name;
    const subCategories = categoryReqBody.categories[0].subCategories;
    const now = createDate();

    await sqlClient.transaction().execute(async (sqlClient) => {
      Log.i(`Storing the main category!`);
      const [mainCategoryStore] = await sqlClient
        .insertInto("products_category")
        .values({
          category_name: mainCategoryName,
          created_by: userId,
          created_on: now,
          modified_by: userId,
          modified_on: now,
        })
        .returning("id")
        .execute();
      Log.i(
        `The main category stored successfully! with id ${mainCategoryStore.id}`
      );
      if (subCategories && subCategories?.length > 0) {
        Log.i(`subCategories present storing them!`);
        subCategories.forEach(async (element) => {
          const subCategoryName = element.name;
          const subSubCategories = element.subSubCategories;

          const [storeSubCategoryRes] = await sqlClient
            .insertInto("products_sub_category")
            .values({
              category_id: mainCategoryStore.id,
              category_name: subCategoryName,
              created_by: userId,
              created_on: now,
              modified_by: userId,
              modified_on: now,
            })
            .returning("id")
            .execute();
          Log.i(
            `sub category ${subCategoryName} stored successfully!, ID : ${storeSubCategoryRes.id}`
          );

          if (subSubCategories && subSubCategories.length > 0) {
            const subSubCategoryDate = subSubCategories.map((category) => {
              return {
                category_id: storeSubCategoryRes.id,
                category_name: category,
                created_by: userId,
                created_on: now,
                modified_by: userId,
                modified_on: now,
              };
            });

            const storeSubSubCategories = await sqlClient
              .insertInto("products_sub_category")
              .values(subSubCategoryDate)
              .returning("id")
              .execute();
            Log.i(`Sub sub categories added successfully!`);
          }
        });
      }
    });

    return {
      isSuccess: true,
      message: `Product categories created successfully!`,
    };
  }

  static async storeProducts(
    sqlClient: Kysely<DB>,
    userId: string,
    requestBody: IProductStoreReq
  ) {
    const now = createDate();
    const [response] = await sqlClient
      .insertInto("products")
      .values({
        name: requestBody.name,
        category_id: requestBody.categoryId,
        sub_category: requestBody.subCategoryId,
        sub_sub_category: requestBody.subCategoryId,
        created_on: now,
        created_by: userId,
        modified_on: now,
        modified_by: userId,
      })
      .returning("id")
      .execute();
    Log.i(`Product has been added successfully! with ID ${response.id}`);

    return { isSuccess: true, message: `Product added successfully!` };
  }
}
