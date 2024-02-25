import { ZodArray, ZodEffects, ZodObject, ZodRecord, z } from "zod";

// Common types
export interface ICheckPermSchemaParams {
  expectedProps?: {
    body?: string[];
    params?: string[];
    query?: string[];
  } | null;
  zodValidation?: {
    bodyProp?: string;
    zodSchema:
      | ZodObject<any, any>
      | ZodArray<any, any>
      | ZodRecord<any>
      | ZodEffects<any>;
  }[];
}

// Roles

export const ZRoleFetchReqBody = z.object({
  sort: z
    .object({
      path: z.enum(["created_on", "modified_on"]),
      direction: z.enum(["asc", "desc"]).optional(),
    })
    .optional()
    .nullable(),
  pageNo: z.number().optional().nullable(),
  searchStr: z.string().optional().nullable(),
  pageSize: z.number().optional().nullable(),
});

export const ZRoleCreateReq = z.object({
  roleName: z.string(),
});

export type IRoleFetchReqBody = z.infer<typeof ZRoleFetchReqBody>;
export type IRoleCreateReq = z.infer<typeof ZRoleCreateReq>;

//Products

export const ZProductsFetchReqBody = z.object({
  sort: z
    .object({
      path: z.enum(["created_on", "modified_on"]),
      direction: z.enum(["asc", "desc"]).optional(),
    })
    .optional()
    .nullable(),
  pageNo: z.number().optional().nullable(),
  searchStr: z.string().optional().nullable(),
  pageSize: z.number().optional().nullable(),
});

export const ZProductCategoryStoreReq = z.object({
  categories: z
    .object({
      name: z.string(),
      subCategories: z
        .object({
          name: z.string(),
          subSubCategories: z.string().array().optional().nullable(),
        })
        .array()
        .optional()
        .nullable(),
    })
    .array(),
});

export const ZProductStoreReq = z.object({
  name: z.string(),
  description: z.string().optional().nullable(),
  categoryId: z.number().optional().nullable(),
  subCategoryId: z.number().optional().nullable(),
  subSubCategoryId: z.number().optional().nullable(),
  brandId: z.number(),
});

export type IProductsFetchReqBody = z.infer<typeof ZProductsFetchReqBody>;
export type IProductCategoriesFetchReqBody = z.infer<
  typeof ZProductsFetchReqBody
>;
export type IProductVendorFetchReqBody = z.infer<typeof ZProductsFetchReqBody>;
export type IProductCategoryStoreReq = z.infer<typeof ZProductCategoryStoreReq>;
export type IProductStoreReq = z.infer<typeof ZProductStoreReq>;

//Vendors
export const ZRVendorFetchReqBody = z.object({
  sort: z
    .object({
      path: z.enum(["created_on", "modified_on"]),
      direction: z.enum(["asc", "desc"]).optional(),
    })
    .optional()
    .nullable(),
  pageNo: z.number().optional().nullable(),
  searchStr: z.string().optional().nullable(),
  pageSize: z.number().optional().nullable(),
});

const ZCategoryType = z.object({
  categoryId: z.number(),
  subCategoryId: z.number().optional().nullable(),
  subSubCategoryId: z.number().optional().nullable(),
});

export const ZVenderCreateReq = z.object({
  name: z.string(),
  email: z.string().email().optional().nullable(),
  address: z.object({
    line1: z.string(),
    line2: z.string(),
    zipCode: z.string(),
  }),
  contactNo: z.string().optional().nullable(),
  productCategories: ZCategoryType.array().optional().nullable(),
});

export const ZVendorAddProductReq = z.object({
  vendorId: z.number(),
  productId: z.number(),
});

export type IRVendorFetchReqBody = z.infer<typeof ZRVendorFetchReqBody>;
export type IVenderCreateReq = z.infer<typeof ZVenderCreateReq>;
export type ICategoryType = z.infer<typeof ZCategoryType>;
export type IVendorAddProductReq = z.infer<typeof ZVendorAddProductReq>;

//users
export const ZCreateUserReq = z.object({
  name: z.string(),
  email: z.string().email(),
  contact_no: z.string().optional().nullable(),
  role_id: z.number(),
});

const ZFirebaseUsersDetails = z.object({
  firebase_user_id: z.string(),
  user_name: z.string(),
  user_email: z.string().email(),
  contact_number: z.string().optional().nullable(),
});

const ZUsersDetails = ZCreateUserReq.extend({
  firebase_user_id: z.string(),
});

export enum UserStatus {
  Active = 0,
  Inactive = 1,
}

export type ICreateUserReq = z.infer<typeof ZCreateUserReq>;
export type IFirebaseUsersDetails = z.infer<typeof ZFirebaseUsersDetails>;
export type IUsersDetails = z.infer<typeof ZUsersDetails>;

// RFQ

// export const ZRfqStoreReq = z.object({
//   rfqId: z.string(),
//   vendors: z
//     .object({
//       vendor_name: z.string(),
//       vendor_id: z.number(),
//       vendor_email: z.string().email(),
//     })
//     .array(),
//   emailBody: z.string(),
// });

export const ZRfqStoreReq = z.object({
  rfqId: z.string(),
  description: z.string(),
});

export const ZRfqProducts = z.number().array();

export const ZRfqsFetchReqBody = z.object({
  sort: z
    .object({
      path: z.enum(["created_on", "modified_on"]),
      direction: z.enum(["asc", "desc"]).optional(),
    })
    .optional()
    .nullable(),
  pageNo: z.number().optional().nullable(),
  searchStr: z.string().optional().nullable(),
  pageSize: z.number().optional().nullable(),
});

export const ZRfqVendors = z.object({
  vendors: z
    .object({
      name: z.string(),
      id: z.number(),
      email: z.string().email(),
    })
    .array(),
  emailBody: z.string(),
  products: z
    .object({
      description: z.string(),
      product: z.string(),
      quantity: z.number(),
      subProduct: z.string(),
    })
    .array(),
});

export const ZRfqCommentsReq = z.object({
  comments: z.object({
    message: z.string(),
  }),
  fileRef: z.number().optional().nullable(),
  commenterType: z.number(),
  rfqVendorId: z.number(),
});

export type IRfqStoreReq = z.infer<typeof ZRfqStoreReq>;
export type IRfqsFetchReqBody = z.infer<typeof ZRfqsFetchReqBody>;
export type IRfqProducts = z.infer<typeof ZRfqProducts>;
export type IRfqVendors = z.infer<typeof ZRfqVendors>;

export type IRfqCommentsReq = z.infer<typeof ZRfqCommentsReq>;

// Category format data.

const SubSubCategorySchema = z.object({
  id: z.number(),
  name: z.string(),
});

const SubCategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  subProducts: z.array(SubSubCategorySchema),
});

const MainCategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  products: z.array(SubCategorySchema),
});

export const CategoriesDataSchema = z.array(MainCategorySchema);
export type ICategoriesDataSchema = z.infer<typeof CategoriesDataSchema>;

export enum CategoryType {
  MainCategory = "main-category",
  SubCategory = "sub-category",
  SubSubCategory = "sub-sub-category",
}

export const ZFetchProductsByCategoryId = z.object({
  sort: z
    .object({
      path: z.enum(["created_on", "modified_on"]),
      direction: z.enum(["asc", "desc"]).optional(),
    })
    .optional()
    .nullable(),
  pageNo: z.number().optional().nullable(),
  searchStr: z.string().optional().nullable(),
  pageSize: z.number().optional().nullable(),
  categoryType: z.nativeEnum(CategoryType),
  categoryId: z.number(),
});

export type IFetchProductsByCategoryId = z.infer<
  typeof ZFetchProductsByCategoryId
>;

export const ZVendorLogin = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type IVendorLogin = z.infer<typeof ZVendorLogin>;

// Brands

export const ZBradsCreateReq = z.object({
  brandName: z.string(),
  brandDesc: z.string(),
  productName: z.string(),
  productDesc: z.string(),
  subProducts: z
    .object({
      name: z.string(),
      desc: z.string(),
    })
    .array()
    .optional()
    .nullable(),
});
export type IBradsCreateReq = z.infer<typeof ZBradsCreateReq>;

export const ZSubProductStore = z
  .object({
    name: z.string(),
    desc: z.string(),
  })
  .array();
export type ISubProductStore = z.infer<typeof ZSubProductStore>;
