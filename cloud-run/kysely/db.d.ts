import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface FirebaseUsers {
  created_on: Timestamp | null;
  firebase_user_id: string;
  user_email: string | null;
  user_name: string | null;
}

export interface Products {
  category_id: Generated<number | null>;
  created_by: string | null;
  created_on: Timestamp | null;
  id: Generated<number>;
  modified_by: string | null;
  modified_on: Timestamp | null;
  name: string | null;
}

export interface ProductsCategory {
  category_name: string | null;
  created_by: string | null;
  created_on: Timestamp | null;
  id: Generated<number>;
  modified_by: string | null;
  modified_on: Timestamp | null;
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

export interface Roles {
  created_by: string | null;
  created_on: Timestamp | null;
  id: Generated<number>;
  modified_by: string | null;
  modified_on: Timestamp | null;
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
}

export interface VendorCategoryMap {
  category_id: number | null;
  created_by: string | null;
  created_on: Timestamp | null;
  id: Generated<number>;
  modified_by: string | null;
  modified_on: Timestamp | null;
  vendor_id: number | null;
}

export interface Vendors {
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
  roles: Roles;
  users: Users;
  vendor_category_map: VendorCategoryMap;
  vendors: Vendors;
}
