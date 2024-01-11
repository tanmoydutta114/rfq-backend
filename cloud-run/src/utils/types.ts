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
export type IRoleFetchReqBody = z.infer<typeof ZRoleFetchReqBody>;

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
  category_name: z.string(),
});

export type IProductsFetchReqBody = z.infer<typeof ZProductsFetchReqBody>;
export type IProductCategoriesFetchReqBody = z.infer<
  typeof ZProductsFetchReqBody
>;
export type IProductCategoryStoreReq = z.infer<typeof ZProductCategoryStoreReq>;

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
export type IRVendorFetchReqBody = z.infer<typeof ZRVendorFetchReqBody>;

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
