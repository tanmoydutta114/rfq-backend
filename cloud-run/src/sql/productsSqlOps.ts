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
  ISubProductStore,
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

  // static async getProductCategories(
  //   sqlClient: Kysely<DB>,
  //   requestBody: IProductCategoriesFetchReqBody
  // ) {
  //   const PAGE_SIZE =
  //     requestBody.pageSize ?? Number(process.env.PAGE_SIZE) ?? 40;
  //   if (!requestBody.sort) {
  //     requestBody.sort = {
  //       path: "created_on",
  //       direction: "desc",
  //     };
  //   }
  //   if (!requestBody.pageNo) {
  //     requestBody.pageNo = 1;
  //   }
  //   const total_roles = await sqlClient
  //     .selectFrom("products_category as pc")
  //     .leftJoin("products_sub_category as psc", "psc.main_category_id", "pc.id")
  //     .leftJoin(
  //       "products_sub_sub_category as pssc",
  //       "pssc.sub_category_id",
  //       "psc.id"
  //     )
  //     .$if(!!requestBody.searchStr, (qb) =>
  //       qb.where((eb) =>
  //         eb.or([
  //           eb(
  //             "pc.category_name",
  //             "ilike",
  //             `%${requestBody.searchStr}%` as string
  //           ),
  //           eb(
  //             "psc.category_name",
  //             "ilike",
  //             `%${requestBody.searchStr}%` as string
  //           ),
  //           eb(
  //             "pssc.category_name",
  //             "ilike",
  //             `%${requestBody.searchStr}%` as string
  //           ),
  //         ])
  //       )
  //     )
  //     .select((eb) => eb.fn.countAll<number>().as("total_categories"))
  //     .execute();
  //   const totalCount = total_roles[0].total_categories;

  //   const OFFSET = PAGE_SIZE * (requestBody.pageNo - 1);

  //   const categories = await sqlClient
  //     .selectFrom("products_category as pc")
  //     .leftJoin("products_sub_category as psc", "psc.main_category_id", "pc.id")
  //     .leftJoin(
  //       "products_sub_sub_category as pssc",
  //       "pssc.sub_category_id",
  //       "psc.id"
  //     )
  //     .$if(!!requestBody.searchStr, (qb) =>
  //       qb.where((eb) =>
  //         eb.or([
  //           eb(
  //             "pc.category_name",
  //             "ilike",
  //             `%${requestBody.searchStr}%` as string
  //           ),
  //           eb(
  //             "psc.category_name",
  //             "ilike",
  //             `%${requestBody.searchStr}%` as string
  //           ),
  //           eb(
  //             "pssc.category_name",
  //             "ilike",
  //             `%${requestBody.searchStr}%` as string
  //           ),
  //         ])
  //       )
  //     )
  //     .orderBy("pc.created_on", requestBody.sort.direction)
  //     .limit(PAGE_SIZE)
  //     .offset(OFFSET)
  //     .select([
  //       "pc.category_name as category_name",
  //       "psc.category_name as sub_category_name",
  //       "pssc.category_name as sub_sub_category_name",
  //       "pc.id as main_category_id",
  //       "psc.id as sub_category_id",
  //       "pssc.id as sub_sub_category_id",
  //     ])
  //     .execute();

  //   const hasMore = OFFSET + PAGE_SIZE < totalCount ? true : false;

  //   const formattedCategory: ICategoriesDataSchema =
  //     this.formatCategoriesSqlData(categories);
  //   return {
  //     formattedCategory,
  //     totalCount,
  //     hasMore,
  //   };
  // }

  // static async storeProductCategory(
  //   sqlClient: Kysely<DB>,
  //   userId: string,
  //   categoryReqBody: IProductCategoryStoreReq
  // ) {
  //   const mainCategoryName = categoryReqBody.categories[0].name;
  //   const subCategories = categoryReqBody.categories[0].subCategories;
  //   const now = createDate();

  //   const response = await sqlClient.transaction().execute(async (db) => {
  //     Log.i(`Storing the main category!`);
  //     const [mainCategoryStore] = await db
  //       .insertInto("products_category")
  //       .values({
  //         category_name: mainCategoryName,
  //         created_by: userId,
  //         created_on: now,
  //         modified_by: userId,
  //         modified_on: now,
  //       })
  //       .returning("id")
  //       .execute();
  //     Log.i(
  //       `The main category stored successfully! with id ${mainCategoryStore.id}`
  //     );
  //     if (subCategories && subCategories?.length > 0) {
  //       Log.i(`subCategories present storing them!`);
  //       for (const element of subCategories) {
  //         const subCategoryName = element.name;
  //         const subSubCategories = element?.subSubCategories;

  //         const [storeSubCategoryRes] = await db
  //           .insertInto("products_sub_category")
  //           .values({
  //             main_category_id: mainCategoryStore.id,
  //             category_name: subCategoryName,
  //             created_by: userId,
  //             created_on: now,
  //             modified_by: userId,
  //             modified_on: now,
  //           })
  //           .returning("id")
  //           .execute();
  //         Log.i(
  //           `sub category ${subCategoryName} stored successfully!, ID : ${storeSubCategoryRes.id}`
  //         );

  //         if (subSubCategories && subSubCategories.length > 0) {
  //           const subSubCategoryDate: InsertObjectOrList<
  //             DB,
  //             "products_sub_sub_category"
  //           > = subSubCategories.map((category) => {
  //             return {
  //               sub_category_id: storeSubCategoryRes.id,
  //               category_name: category,
  //               created_by: userId,
  //               created_on: now,
  //               modified_by: userId,
  //               modified_on: now,
  //             };
  //           });
  //           const [storeSubSubCategories] = await db
  //             .insertInto("products_sub_sub_category")
  //             .values(subSubCategoryDate)
  //             .returning("id")
  //             .execute();
  //           Log.i(
  //             `Sub sub categories added successfully!`,
  //             storeSubSubCategories
  //           );
  //         }
  //         Log.i(`No sub sub categories for sub category ${subCategoryName}`);
  //       }
  //     }
  //     return {
  //       isSuccess: true,
  //       message: `Product categories created successfully!`,
  //     };
  //   });
  //   return response;
  // }

  // static async storeMainCategory(
  //   sqlClient: Kysely<DB>,
  //   userId: string,
  //   mainCategoryName: string
  // ) {
  //   const now = createDate();
  //   const storeMainCategoryRes = await sqlClient
  //     .insertInto("products_category")
  //     .values({
  //       category_name: mainCategoryName,
  //       created_by: userId,
  //       created_on: now,
  //       modified_by: userId,
  //       modified_on: now,
  //     })
  //     .returning("id")
  //     .execute();
  //   Log.i(`Category saved successfully!`);
  //   return {
  //     isSuccess: true,
  //     message: `Category saved successfully!`,
  //   };
  // }

  // static async storeSubCategory(
  //   sqlClient: Kysely<DB>,
  //   userId: string,
  //   mainCategoryId: number,
  //   subCategoryName: string
  // ) {
  //   const now = createDate();
  //   const storeSubCategoryRes = await sqlClient
  //     .insertInto("products_sub_category")
  //     .values({
  //       main_category_id: mainCategoryId,
  //       category_name: subCategoryName,
  //       created_by: userId,
  //       created_on: now,
  //       modified_by: userId,
  //       modified_on: now,
  //     })
  //     .returning("id")
  //     .execute();
  //   Log.i(`Sub category saved successfully!`);
  //   return {
  //     isSuccess: true,
  //     message: `Sub category saved successfully!`,
  //   };
  // }
  // static async storeSubSubCategory(
  //   sqlClient: Kysely<DB>,
  //   userId: string,
  //   subCategoryId: number,
  //   subSubCategoryName: string
  // ) {
  //   const now = createDate();
  //   const storeSubSubCategoryRes = await sqlClient
  //     .insertInto("products_sub_sub_category")
  //     .values({
  //       sub_category_id: subCategoryId,
  //       category_name: subSubCategoryName,
  //       created_by: userId,
  //       created_on: now,
  //       modified_by: userId,
  //       modified_on: now,
  //     })
  //     .returning("id")
  //     .execute();
  //   Log.i(`Sub sub category saved successfully!`);
  //   return {
  //     isSuccess: true,
  //     message: `Sub sub category saved successfully!`,
  //   };
  // }

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
        brand_id: requestBody.brandId,
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

  static async storeSubProducts(
    sqlClient: Kysely<DB>,
    userId: string,
    productId: number,
    reqBody: ISubProductStore
  ) {
    const now = createDate();
    const subProducts = reqBody.map((subProduct) => {
      const data: InsertObject<DB, "sub_products"> = {
        name: subProduct.name,
        description: subProduct.desc,
        product_id: productId,
        created_on: now,
        created_by: userId,
        modified_by: userId,
        modified_on: now,
      };
      return data;
    });
    const storeSubProducts = await sqlClient
      .insertInto("sub_products")
      .values(subProducts)
      .returning("id")
      .execute();
    Log.i(`Sub Products add successfully!`, storeSubProducts);
    return {
      isSuccess: true,
      message: `Sub product added successfully!`,
    };
  }

  static formatBrandProductsSqlData(
    inputData: {
      brand_name: string;
      product_name: string | null;
      sub_product_name: string | null;
      brand_id: number;
      product_id: number | null;
      sub_product_id: number | null;
      product_description: string | null;
    }[]
  ): ICategoriesDataSchema {
    let organizedData: ICategoriesDataSchema = {} as ICategoriesDataSchema;

    inputData.forEach((item) => {
      const brandId = item.brand_id;
      const productId = item.product_id;
      const subProductId = item.sub_product_id;

      const brandName = item.brand_name;
      const productName = item.product_name;
      const subProductName = item.sub_product_name;

      if (!organizedData[brandName]) {
        organizedData[brandName] = {
          id: brandId,
          name: brandName.toString(),
          products: [],
        };
      }

      const brand = organizedData[brandName];

      if (
        productName &&
        productId &&
        !brand.products.find(
          (sub: { id: number; name: string }) => sub.id === productId
        )
      ) {
        brand.products.push({
          id: productId,
          name: productName.toString(),
          productDescription: item.product_description,
          subProducts: [],
        });
      }

      const products = brand.products.find(
        (sub: { id: number; name: string }) => sub.id === productId
      );

      if (subProductId && subProductName && products) {
        products.subProducts.push({
          id: subProductId,
          name: subProductName,
        });
      }
    });

    return Object.values(organizedData);
  }
  static async getProductBrands(
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
    const total_brands = await sqlClient
      .selectFrom("brands as b")
      .leftJoin("products as p", "b.id", "p.brand_id")
      .leftJoin("sub_products as sp", "p.id", "sp.product_id")
      .$if(!!requestBody.searchStr, (qb) =>
        qb.where((eb) =>
          eb.or([
            eb("b.name", "ilike", `%${requestBody.searchStr}%` as string),
            eb("p.name", "ilike", `%${requestBody.searchStr}%` as string),
            eb("sp.name", "ilike", `%${requestBody.searchStr}%` as string),
          ])
        )
      )
      .select((eb) => eb.fn.count<number>("b.id").distinct().as("total_brands"))
      .execute();
    const totalCount = total_brands[0].total_brands;

    const OFFSET = PAGE_SIZE * (requestBody.pageNo - 1);

    const brandProducts = await sqlClient
      .selectFrom("brands as b")
      .leftJoin("products as p", "b.id", "p.brand_id")
      .leftJoin("sub_products as sp", "p.id", "sp.product_id")
      .$if(!!requestBody.searchStr, (qb) =>
        qb.where((eb) =>
          eb.or([
            eb("b.name", "ilike", `%${requestBody.searchStr}%` as string),
            eb("p.name", "ilike", `%${requestBody.searchStr}%` as string),
            eb("sp.name", "ilike", `%${requestBody.searchStr}%` as string),
          ])
        )
      )
      .orderBy("b.created_on", requestBody.sort.direction)
      .limit(PAGE_SIZE)
      .offset(OFFSET)
      .select([
        "b.name as brand_name",
        "p.name as product_name",
        "sp.name as sub_product_name",
        "b.id as brand_id",
        "p.id as product_id",
        "sp.id as sub_product_id",
        "p.description as product_description",
      ])
      .execute();

    const hasMore = OFFSET + PAGE_SIZE < totalCount ? true : false;

    const brandWiseProduct: ICategoriesDataSchema =
      this.formatBrandProductsSqlData(brandProducts);
    return {
      brands: brandWiseProduct,
      totalCount,
      hasMore,
    };
  }

  static async getSubProducts(sqlClient: Kysely<DB>, productId: number) {
    const subProducts = await sqlClient
      .selectFrom("sub_products")
      .where("product_id", "=", productId)
      .select(["name", "id", "description"])
      .execute();
    return {
      isSuccess: true,
      subProducts,
    };
  }
}
