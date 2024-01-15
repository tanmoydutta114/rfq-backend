import { InsertObject, Kysely } from "kysely";
import { DB } from "../../kysely/db";
import {
  IProductCategoriesFetchReqBody,
  IProductCategoryStoreReq,
  IProductStoreReq,
  IProductsFetchReqBody,
} from "../utils/types";
import { createDate } from "../utils/utils";
import { Log } from "../utils/Log";
import { InsertObjectOrList } from "kysely/dist/cjs/parser/insert-values-parser";

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
    const total_products = await sqlClient
      .selectFrom("products")
      .$if(!!requestBody.searchStr, (qb) =>
        qb.where((eb) =>
          eb.or([eb("name", "ilike", `%${requestBody.searchStr}%` as string)])
        )
      )
      .select((eb) => eb.fn.countAll<number>().as("total_products"))
      .execute();
    const totalCount = total_products[0].total_products;

    const OFFSET = PAGE_SIZE * (requestBody.pageNo - 1);

    const products = await sqlClient
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
      products,
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
      .leftJoin("products_sub_category as psc", "psc.main_category_id", "pc.id")
      .leftJoin(
        "products_sub_sub_category as pssc",
        "pssc.sub_category_id",
        "psc.id"
      )
      .$if(!!requestBody.searchStr, (qb) =>
        qb.where((eb) =>
          eb.or([
            eb(
              "pc.category_name",
              "ilike",
              `%${requestBody.searchStr}%` as string
            ),
            eb(
              "psc.category_name",
              "ilike",
              `%${requestBody.searchStr}%` as string
            ),
            eb(
              "pssc.category_name",
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

    const categories = await sqlClient
      .selectFrom("products_category as pc")
      .leftJoin("products_sub_category as psc", "psc.main_category_id", "pc.id")
      .leftJoin(
        "products_sub_sub_category as pssc",
        "pssc.sub_category_id",
        "psc.id"
      )
      .$if(!!requestBody.searchStr, (qb) =>
        qb.where((eb) =>
          eb.or([
            eb(
              "pc.category_name",
              "ilike",
              `%${requestBody.searchStr}%` as string
            ),
            eb(
              "psc.category_name",
              "ilike",
              `%${requestBody.searchStr}%` as string
            ),
            eb(
              "pssc.category_name",
              "ilike",
              `%${requestBody.searchStr}%` as string
            ),
          ])
        )
      )
      .orderBy("pc.created_on", requestBody.sort.direction)
      .limit(PAGE_SIZE)
      .offset(OFFSET)
      .select([
        "pc.category_name as category_name",
        "psc.category_name as sub_category_name",
        "pssc.category_name as sub_sub_category_name",
        "pc.id as main_category_id",
        "psc.id as sub_category_id",
        "pssc.id as sub_sub_category_id",
      ])
      .execute();

    const hasMore = OFFSET + PAGE_SIZE < totalCount ? true : false;

    return {
      categories,
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

    const response = await sqlClient.transaction().execute(async (db) => {
      Log.i(`Storing the main category!`);
      const [mainCategoryStore] = await db
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
        for (const element of subCategories) {
          const subCategoryName = element.name;
          const subSubCategories = element?.subSubCategories;

          const [storeSubCategoryRes] = await db
            .insertInto("products_sub_category")
            .values({
              main_category_id: mainCategoryStore.id,
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
            const subSubCategoryDate: InsertObjectOrList<
              DB,
              "products_sub_sub_category"
            > = subSubCategories.map((category) => {
              return {
                sub_category_id: storeSubCategoryRes.id,
                category_name: category,
                created_by: userId,
                created_on: now,
                modified_by: userId,
                modified_on: now,
              };
            });
            const [storeSubSubCategories] = await db
              .insertInto("products_sub_sub_category")
              .values(subSubCategoryDate)
              .returning("id")
              .execute();
            Log.i(
              `Sub sub categories added successfully!`,
              storeSubSubCategories
            );
          }
          Log.i(`No sub sub categories for sub category ${subCategoryName}`);
        }
      }
      return {
        isSuccess: true,
        message: `Product categories created successfully!`,
      };
    });
    return response;
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
        sub_sub_category: requestBody.subSubCategoryId,
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

  static transformData(
    data: {
      category_name: string;
      sub_category_name: string | null;
      sub_sub_category_name: string | null;
    }[]
  ) {
    const result = {
      categories: [],
    };

    const groupedCategories = {};

    data.forEach((item) => {
      const categoryName = item.category_name;
      const subCategoryName = item.sub_category_name;
      const subSubCategoryName = item.sub_sub_category_name;

      if (!groupedCategories[categoryName]) {
        groupedCategories[categoryName] = {
          name: categoryName,
          subCategories: [],
        };
      }

      const category = groupedCategories[categoryName];
      const subCategory = category.subCategories.find(
        (sub) => sub.name === subCategoryName
      );

      if (!subCategory) {
        const newSubCategory = { name: subCategoryName, subSubCategories: [] };
        category.subCategories.push(newSubCategory);
      }

      if (subSubCategoryName) {
        const newSubSubCategory = { name: subSubCategoryName };
        subCategory.subSubCategories.push(subSubCategoryName);
      }
    });
    result.categories = Object.values(groupedCategories);
    return result;
  }
}
