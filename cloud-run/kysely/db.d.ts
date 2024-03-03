import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Int8 = ColumnType<string, bigint | number | string, bigint | number | string>;

export type Json = ColumnType<JsonValue, string, string>;

export type JsonArray = JsonValue[];

export type JsonObject = {
  [K in string]?: JsonValue;
};

export type JsonPrimitive = boolean | number | string | null;

export type JsonValue = JsonArray | JsonObject | JsonPrimitive;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface Brands {
  created_by: string | null;
  created_on: Generated<Timestamp | null>;
  description: string | null;
  id: Generated<number>;
  modified_by: string | null;
  modified_on: Generated<Timestamp | null>;
  name: string;
}

export interface BrandVendorMap {
  brand_id: number | null;
  created_by: string | null;
  created_on: Timestamp | null;
  id: Generated<number>;
  modified_by: string | null;
  modified_on: Timestamp | null;
  product_id: number | null;
  vendor_id: number | null;
}

export interface FileStorage {
  brand_id: number | null;
  commenter_type: number | null;
  file_data: Buffer;
  file_id: string;
  file_name: string;
  file_type: string;
  rfq_id: string | null;
  rfq_vendor_id: string | null;
  vendor_id: number | null;
}

export interface FirebaseUsers {
  contact_number: string | null;
  created_on: Timestamp | null;
  firebase_user_id: string;
  user_email: string;
  user_name: string | null;
}

export interface Products {
  brand_id: number | null;
  category_id: Generated<number | null>;
  created_by: string | null;
  created_on: Generated<Timestamp | null>;
  description: string | null;
  id: Generated<number>;
  modified_by: string | null;
  modified_on: Generated<Timestamp | null>;
  name: string;
  sub_category: number | null;
  sub_sub_category: number | null;
}

export interface ProductsCategory {
  category_name: string | null;
  created_by: string | null;
  created_on: Generated<Timestamp | null>;
  id: Generated<number>;
  modified_by: string | null;
  modified_on: Generated<Timestamp | null>;
}

export interface ProductsSubCategory {
  category_name: string | null;
  created_by: string | null;
  created_on: Timestamp | null;
  id: Generated<number>;
  main_category_id: number | null;
  modified_by: string | null;
  modified_on: Timestamp | null;
}

export interface ProductsSubSubCategory {
  category_name: string | null;
  created_by: string | null;
  created_on: Timestamp | null;
  id: Generated<number>;
  modified_by: string | null;
  modified_on: Timestamp | null;
  sub_category_id: number | null;
}

export interface ProductVendorMap {
  created_by: string | null;
  created_on: Timestamp | null;
  id: Generated<number>;
  modified_by: string | null;
  modified_on: Timestamp | null;
  product_id: number | null;
  vendor_id: number | null;
}

export interface RfqComments {
  brand_id: number | null;
  comment: Json | null;
  commenter_type: number | null;
  created_by: string | null;
  created_on: Generated<Timestamp | null>;
  file_ref: Int8 | null;
  id: Generated<string>;
  modified_by: string | null;
  modified_on: Generated<Timestamp | null>;
  product_id: number | null;
  rfq_id: string | null;
  rfq_vendor_id: string | null;
  vendor_id: number | null;
}

export interface RfqProducts {
  brand_id: number | null;
  created_by: string | null;
  created_on: Generated<Timestamp | null>;
  id: Generated<number>;
  modified_by: string | null;
  modified_on: Generated<Timestamp | null>;
  product_id: number | null;
  rfq_id: string | null;
}

export interface Rfqs {
  created_by: string | null;
  created_on: Generated<Timestamp | null>;
  description: string | null;
  is_finished: Generated<boolean | null>;
  modified_by: string | null;
  modified_on: Generated<Timestamp | null>;
  rfq_id: string;
}

export interface RfqVendors {
  accept_rfq: Generated<boolean | null>;
  brand_id: number | null;
  created_by: string | null;
  created_on: Generated<Timestamp | null>;
  email_sent_on: Timestamp | null;
  id: Generated<string>;
  modified_by: string | null;
  modified_on: Generated<Timestamp | null>;
  passcode: string | null;
  product_id: Json[] | null;
  responded_on: Timestamp | null;
  rfq_id: string | null;
  vendor_id: number | null;
}

export interface Roles {
  created_by: string | null;
  created_on: Generated<Timestamp | null>;
  id: Generated<number>;
  modified_by: string | null;
  modified_on: Generated<Timestamp | null>;
  role_name: string | null;
}

export interface SubProducts {
  created_by: string | null;
  created_on: Generated<Timestamp | null>;
  description: string | null;
  id: Generated<number>;
  modified_by: string | null;
  modified_on: Generated<Timestamp | null>;
  name: string;
  product_id: number;
}

export interface Users {
  contact_no: string | null;
  created_by: string | null;
  created_on: Timestamp | null;
  email: string;
  firebase_user_id: string | null;
  id: Generated<number>;
  modified_by: string | null;
  modified_on: Timestamp | null;
  name: string | null;
  role_id: number | null;
  status: Generated<number | null>;
}

export interface VendorCategoryMap {
  category_id: number | null;
  created_by: string | null;
  created_on: Generated<Timestamp | null>;
  id: Generated<number>;
  modified_by: string | null;
  modified_on: Generated<Timestamp | null>;
  sub_category_id: number | null;
  sub_sub_category_id: number | null;
  vendor_id: number | null;
}

export interface Vendors {
  address: Json | null;
  contact_no: string | null;
  created_by: string | null;
  created_on: Timestamp | null;
  email: string | null;
  id: Generated<number>;
  modified_by: string | null;
  modified_on: Timestamp | null;
  name: string | null;
}

export interface DB {
  brand_vendor_map: BrandVendorMap;
  brands: Brands;
  file_storage: FileStorage;
  firebase_users: FirebaseUsers;
  product_vendor_map: ProductVendorMap;
  products: Products;
  products_category: ProductsCategory;
  products_sub_category: ProductsSubCategory;
  products_sub_sub_category: ProductsSubSubCategory;
  rfq_comments: RfqComments;
  rfq_products: RfqProducts;
  rfq_vendors: RfqVendors;
  rfqs: Rfqs;
  roles: Roles;
  sub_products: SubProducts;
  users: Users;
  vendor_category_map: VendorCategoryMap;
  vendors: Vendors;
}
