import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface FirebaseUsers {
  contact_number: string | null;
  created_on: Timestamp | null;
  firebase_user_id: string;
  user_email: string;
  user_name: string | null;
}

export interface Products {
  category_id: Generated<number | null>;
  created_by: string | null;
  created_on: Generated<Timestamp | null>;
  id: Generated<number>;
  modified_by: string | null;
  modified_on: Generated<Timestamp | null>;
  name: string | null;
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

export interface Rfqs {
  created_by: string | null;
  created_on: Generated<Timestamp | null>;
  email_send: boolean | null;
  id: Generated<number>;
  is_responded: boolean | null;
  modified_by: string | null;
  modified_on: Generated<Timestamp | null>;
  rfq_id: string | null;
  vendor_access_url: string | null;
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
  address: string | null;
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
  firebase_users: FirebaseUsers;
  product_vendor_map: ProductVendorMap;
  products: Products;
  products_category: ProductsCategory;
  products_sub_category: ProductsSubCategory;
  products_sub_sub_category: ProductsSubSubCategory;
  rfqs: Rfqs;
  roles: Roles;
  users: Users;
  vendor_category_map: VendorCategoryMap;
  vendors: Vendors;
}
