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

const ZRoleCreateReq = z.object({
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
  categoryId: z.number(),
  subCategoryId: z.number().optional().nullable(),
  subSubCategoryId: z.number().optional().nullable(),
});

export type IProductsFetchReqBody = z.infer<typeof ZProductsFetchReqBody>;
export type IProductCategoriesFetchReqBody = z.infer<
  typeof ZProductsFetchReqBody
>;
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

export type IRVendorFetchReqBody = z.infer<typeof ZRVendorFetchReqBody>;
export type IVenderCreateReq = z.infer<typeof ZVenderCreateReq>;
export type ICategoryType = z.infer<typeof ZCategoryType>;

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
