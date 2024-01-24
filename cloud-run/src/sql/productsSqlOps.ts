import { InsertObject, Kysely, SelectQueryBuilder } from "kysely";
import { DB } from "../../kysely/db";
import {
  CategoryType,
  ICategoriesDataSchema,
  IFetchProductsByCategoryId,
  IProductCategoriesFetchReqBody,
  IProductCategoryStoreReq,
  IProductStoreReq,
  IProductVendorFetchReqBody,
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
      .select(["id", "name", "created_on", "description"])
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

    const formattedCategory: ICategoriesDataSchema =
      this.formatCategoriesSqlData(categories);
    return {
      formattedCategory,
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

  static async storeMainCategory(
    sqlClient: Kysely<DB>,
    userId: string,
    mainCategoryName: string
  ) {
    const now = createDate();
    const storeMainCategoryRes = await sqlClient
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
    Log.i(`Category saved successfully!`);
    return {
      isSuccess: true,
      message: `Category saved successfully!`,
    };
  }

  static async storeSubCategory(
    sqlClient: Kysely<DB>,
    userId: string,
    mainCategoryId: number,
    subCategoryName: string
  ) {
    const now = createDate();
    const storeSubCategoryRes = await sqlClient
      .insertInto("products_sub_category")
      .values({
        main_category_id: mainCategoryId,
        category_name: subCategoryName,
        created_by: userId,
        created_on: now,
        modified_by: userId,
        modified_on: now,
      })
      .returning("id")
      .execute();
    Log.i(`Sub category saved successfully!`);
    return {
      isSuccess: true,
      message: `Sub category saved successfully!`,
    };
  }
  static async storeSubSubCategory(
    sqlClient: Kysely<DB>,
    userId: string,
    subCategoryId: number,
    subSubCategoryName: string
  ) {
    const now = createDate();
    const storeSubSubCategoryRes = await sqlClient
      .insertInto("products_sub_sub_category")
      .values({
        sub_category_id: subCategoryId,
        category_name: subSubCategoryName,
        created_by: userId,
        created_on: now,
        modified_by: userId,
        modified_on: now,
      })
      .returning("id")
      .execute();
    Log.i(`Sub sub category saved successfully!`);
    return {
      isSuccess: true,
      message: `Sub sub category saved successfully!`,
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
        description: requestBody.description,
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

  static formatCategoriesSqlData(
    inputData: {
      category_name: string | null;
      sub_category_name: string | null;
      sub_sub_category_name: string | null;
      main_category_id: number;
      sub_category_id: number | null;
      sub_sub_category_id: number | null;
    }[]
  ): ICategoriesDataSchema {
    let organizedData: ICategoriesDataSchema = {} as ICategoriesDataSchema;

    inputData.forEach((item) => {
      const mainCategoryId = item.main_category_id;
      const subCategoryId = item.sub_category_id;
      const subSubCategoryId = item.sub_sub_category_id;

      const mainCategoryName = item.category_name as string;
      const subCategoryName = item.sub_category_name;

      const subSubCategoryName = item.sub_sub_category_name;

      if (!organizedData[mainCategoryName]) {
        organizedData[mainCategoryName] = {
          id: mainCategoryId,
          name: mainCategoryName,
          subcategories: [],
        };
      }

      const mainCategory = organizedData[mainCategoryName];

      if (
        subCategoryId &&
        !mainCategory.subcategories.find(
          (sub: { id: number; name: string }) => sub.name === subCategoryName
        )
      ) {
        mainCategory.subcategories.push({
          id: subCategoryId,
          name: subCategoryName,
          subSubcategories: [],
        });
      }

      const subCategory = mainCategory.subcategories.find(
        (sub: { id: number; name: string }) => sub.name === subCategoryName
      );

      if (subSubCategoryId && subSubCategoryName) {
        subCategory.subSubcategories.push({
          id: subSubCategoryId,
          name: subSubCategoryName,
        });
      }
    });

    return Object.values(organizedData);
  }
  static async getProductVendors(
    sqlClient: Kysely<DB>,
    productId: number,
    requestBody: IProductVendorFetchReqBody
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
    const total_vendors = await sqlClient
      .selectFrom("product_vendor_map as pvm")
      .leftJoin("vendors as v", "pvm.vendor_id", "v.id")
      .where("pvm.product_id", "=", productId)
      .$if(!!requestBody.searchStr, (qb) =>
        qb.where((eb) =>
          eb.or([eb("v.name", "ilike", `%${requestBody.searchStr}%` as string)])
        )
      )
      .select((eb) => eb.fn.countAll<number>().as("total_products"))
      .execute();
    const totalCount = total_vendors[0].total_products;

    const OFFSET = PAGE_SIZE * (requestBody.pageNo - 1);

    const vendors = await sqlClient
      .selectFrom("product_vendor_map as pvm")
      .leftJoin("vendors as v", "pvm.vendor_id", "v.id")
      .where("pvm.product_id", "=", productId)
      .$if(!!requestBody.searchStr, (qb) =>
        qb.where((eb) =>
          eb.or([eb("v.name", "ilike", `%${requestBody.searchStr}%` as string)])
        )
      )
      .orderBy("v.created_on", requestBody.sort.direction)
      .limit(PAGE_SIZE)
      .offset(OFFSET)
      .select([
        "v.id as vendor_id",
        "v.name as vendor_name",
        "v.email as vendor_email",
      ])
      .execute();

    const hasMore = OFFSET + PAGE_SIZE < totalCount ? true : false;
    return {
      vendors,
      totalCount,
      hasMore,
    };
  }

  static async getProductByCategory(
    sqlClient: Kysely<DB>,
    reqBody: IFetchProductsByCategoryId
  ) {
    const products = await sqlClient
      .selectFrom("products")
      .$if(reqBody.categoryType === CategoryType.MainCategory, (qb) =>
        qb.where((eb) => eb.or([eb("category_id", "=", reqBody.categoryId)]))
      )
      .$if(reqBody.categoryType === CategoryType.SubCategory, (qb) =>
        qb.where((eb) => eb.or([eb("sub_category", "=", reqBody.categoryId)]))
      )
      .$if(reqBody.categoryType === CategoryType.SubSubCategory, (qb) =>
        qb.where((eb) =>
          eb.or([eb("sub_sub_category", "=", reqBody.categoryId)])
        )
      )
      .select(["name", "description", "created_on"])
      .orderBy("created_on desc")
      .execute();

    return {
      isSuccess: true,
      products,
    };
  }
}
