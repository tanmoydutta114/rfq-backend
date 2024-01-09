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

export interface Roles {
  created_by: string | null;
  created_on: Timestamp | null;
  id: Generated<number>;
  modified_by: string | null;
  modified_on: Timestamp | null;
  role_name: string | null;
}

export interface DB {
  firebase_users: FirebaseUsers;
  roles: Roles;
}
