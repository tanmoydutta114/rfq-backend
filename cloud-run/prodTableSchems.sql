
CREATE TABLE firebase_users (
	firebase_user_id text NOT NULL,
	user_name varchar NULL,
	user_email varchar NOT NULL,
	created_on timestamp NULL,
	contact_number varchar NULL,
	CONSTRAINT firebase_users_pkey PRIMARY KEY (firebase_user_id)
);


CREATE TABLE roles (
	id serial4 NOT NULL,
	role_name varchar NULL,
	created_on timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	created_by text NULL,
	modified_on timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	modified_by text NULL,
	CONSTRAINT roles_pkey PRIMARY KEY (id),
	CONSTRAINT roles_created_by_fkey FOREIGN KEY (created_by) REFERENCES firebase_users(firebase_user_id),
	CONSTRAINT roles_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES firebase_users(firebase_user_id)
);

CREATE TABLE users (
	id serial4 NOT NULL,
	firebase_user_id text NULL,
	"name" varchar NULL,
	email varchar NOT NULL,
	contact_no varchar NULL,
	role_id int4 NULL,
	created_on timestamp NULL,
	created_by text NULL,
	modified_on timestamp NULL,
	modified_by text NULL,
	status int2 NULL DEFAULT 0,
	CONSTRAINT users_pkey PRIMARY KEY (id),
	CONSTRAINT users_created_by_fkey FOREIGN KEY (created_by) REFERENCES firebase_users(firebase_user_id),
	CONSTRAINT users_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES firebase_users(firebase_user_id),
	CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE vendors (
	id serial4 NOT NULL,
	"name" varchar NULL,
	email varchar NULL,
	contact_no varchar NULL,
	created_on timestamp NULL,
	created_by text NULL,
	modified_on timestamp NULL,
	modified_by text NULL,
	address json NULL,
	CONSTRAINT vendors_email_unique UNIQUE (email),
	CONSTRAINT vendors_pkey PRIMARY KEY (id),
	CONSTRAINT vendors_created_by_fkey FOREIGN KEY (created_by) REFERENCES firebase_users(firebase_user_id),
	CONSTRAINT vendors_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES firebase_users(firebase_user_id)
);


CREATE TABLE rfqs (
	rfq_id varchar NOT NULL,
	description text NULL,
	is_finished bool NULL DEFAULT false,
	created_on timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	created_by text NULL,
	modified_on timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	modified_by text NULL,
	CONSTRAINT rfqs_pkey PRIMARY KEY (rfq_id),
	CONSTRAINT rfqs_created_by_fkey FOREIGN KEY (created_by) REFERENCES firebase_users(firebase_user_id),
	CONSTRAINT rfqs_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES firebase_users(firebase_user_id)
);


CREATE TABLE brands (
	id serial4 NOT NULL,
	"name" varchar NOT NULL,
	created_on timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	created_by text NULL,
	modified_on timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	modified_by text NULL,
	description text NULL,
	CONSTRAINT brands_name_key UNIQUE (name),
	CONSTRAINT brands_pkey PRIMARY KEY (id),
	CONSTRAINT brands_created_by_fkey FOREIGN KEY (created_by) REFERENCES firebase_users(firebase_user_id),
	CONSTRAINT brands_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES firebase_users(firebase_user_id)
);


CREATE TABLE products (
	id serial4 NOT NULL,
	"name" varchar NOT NULL,
	category_id int4 NULL,
	created_on timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	created_by text NULL,
	modified_on timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	modified_by text NULL,
	sub_category int4 NULL,
	sub_sub_category int4 NULL,
	description text NULL,
	brand_id int4 NULL,
	CONSTRAINT products_pkey PRIMARY KEY (id),
	CONSTRAINT products_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES brands(id),
	CONSTRAINT products_created_by_fkey FOREIGN KEY (created_by) REFERENCES firebase_users(firebase_user_id),
	CONSTRAINT products_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES firebase_users(firebase_user_id)
);

CREATE TABLE brand_vendor_map (
	id serial4 NOT NULL,
	vendor_id int4 NULL,
	brand_id int4 NULL,
	created_on timestamp NULL,
	created_by text NULL,
	modified_on timestamp NULL,
	modified_by text NULL,
	product_id int4 NULL,
	CONSTRAINT brand_vendor_map_pkey PRIMARY KEY (id),
	CONSTRAINT brand_vendor_map_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES brands(id),
	CONSTRAINT brand_vendor_map_created_by_fkey FOREIGN KEY (created_by) REFERENCES firebase_users(firebase_user_id),
	CONSTRAINT brand_vendor_map_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES firebase_users(firebase_user_id),
	CONSTRAINT brand_vendor_map_priduct_id_fkey FOREIGN KEY (product_id) REFERENCES products(id),
	CONSTRAINT brand_vendor_map_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);

CREATE TABLE rfq_vendors (
	id varchar NOT NULL,
	rfq_id varchar NULL,
	vendor_id int4 NULL,
	created_on timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	created_by text NULL,
	modified_on timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	modified_by text NULL,
	passcode varchar NULL,
	email_sent_on timestamp NULL,
	responded_on timestamp NULL,
	accept_rfq bool NULL DEFAULT false,
	brand_id int4 NULL,
	product_id _jsonb NULL,
	CONSTRAINT rfq_vendors_pkey PRIMARY KEY (id),
	CONSTRAINT rfq_vendors_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES brands(id),
	CONSTRAINT rfq_vendors_created_by_fkey FOREIGN KEY (created_by) REFERENCES firebase_users(firebase_user_id),
	CONSTRAINT rfq_vendors_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES firebase_users(firebase_user_id),
	CONSTRAINT rfq_vendors_rfq_id_fkey FOREIGN KEY (rfq_id) REFERENCES rfqs(rfq_id),
	CONSTRAINT rfq_vendors_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);


CREATE TABLE sub_products (
	id serial4 NOT NULL,
	"name" varchar NOT NULL,
	product_id int4 NOT NULL,
	created_on timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	created_by text NULL,
	modified_on timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	modified_by text NULL,
	description text NULL,
	CONSTRAINT sub_products_pkey PRIMARY KEY (id),
	CONSTRAINT sub_products_created_by_fkey FOREIGN KEY (created_by) REFERENCES firebase_users(firebase_user_id),
	CONSTRAINT sub_products_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES firebase_users(firebase_user_id),
	CONSTRAINT sub_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE rfq_products (
	id serial4 NOT NULL,
	rfq_id varchar NULL,
	product_id int4 NULL,
	created_on timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	created_by text NULL,
	modified_on timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	modified_by text NULL,
	brand_id int4 NULL,
	CONSTRAINT rfq_products_pkey PRIMARY KEY (id),
	CONSTRAINT rfq_products_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES brands(id),
	CONSTRAINT rfq_products_created_by_fkey FOREIGN KEY (created_by) REFERENCES firebase_users(firebase_user_id),
	CONSTRAINT rfq_products_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES firebase_users(firebase_user_id),
	CONSTRAINT rfq_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id),
	CONSTRAINT rfq_products_rfq_id_fkey FOREIGN KEY (rfq_id) REFERENCES rfqs(rfq_id)
);


CREATE TABLE rfq_comments (
	id serial4 NOT NULL,
	rfq_id varchar NULL,
	vendor_id int4 NULL,
	product_id int4 NULL,
	commenter_type int2 NULL,
	"comment" jsonb NULL,
	file_ref int8 NULL,
	created_on timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	created_by text NULL,
	modified_on timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	modified_by text NULL,
	brand_id int4 NULL,
	rfq_vendor_id varchar NULL,
	CONSTRAINT rfq_comments_pkey null,
	CONSTRAINT rfq_comments_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES brands(id),
	CONSTRAINT rfq_comments_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id),
	CONSTRAINT rfq_comments_rfq_id_fkey FOREIGN KEY (rfq_id) REFERENCES rfqs(rfq_id),
	CONSTRAINT rfq_comments_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);

CREATE TABLE product_vendor_map (
	id serial4 NOT NULL,
	vendor_id int4 NULL,
	product_id int4 NULL,
	created_on timestamp NULL,
	created_by text NULL,
	modified_on timestamp NULL,
	modified_by text NULL,
	CONSTRAINT product_vendor_map_pkey PRIMARY KEY (id),
	CONSTRAINT product_vendor_map_unique UNIQUE (vendor_id, product_id),
	CONSTRAINT product_vendor_map_created_by_fkey FOREIGN KEY (created_by) REFERENCES firebase_users(firebase_user_id),
	CONSTRAINT product_vendor_map_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES firebase_users(firebase_user_id),
	CONSTRAINT product_vendor_map_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id),
	CONSTRAINT product_vendor_map_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);

CREATE TABLE file_storage (
	file_id varchar NOT NULL,
	file_name varchar NOT NULL,
	file_type varchar NOT NULL,
	file_data bytea NOT NULL,
	rfq_id varchar NULL,
	vendor_id int4 NULL,
	rfq_vendor_id varchar NULL,
	brand_id int4 NULL,
	commenter_type int2 NULL,
	CONSTRAINT file_storage_pkey PRIMARY KEY (file_id),
	CONSTRAINT file_storage_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES brands(id),
	CONSTRAINT file_storage_rfq_id_fkey FOREIGN KEY (rfq_id) REFERENCES rfqs(rfq_id)
);



INSERT INTO firebase_users
(firebase_user_id, user_name, user_email, created_on, contact_number)
VALUES('nKLw6F1FJrahO6wzOk57ysg9xHD3', 'Suryadipta Sarkar', 'gremlin.sarkar@gmail.com', '2024-03-13 12:12:23.042', '+918697408525');

INSERT INTO public.users
(firebase_user_id, "name", email, contact_no, created_on, created_by, modified_on, modified_by, status)
VALUES('nKLw6F1FJrahO6wzOk57ysg9xHD3', 'Suryadipta Sarkar', 'gremlin.sarkar@gmail.com', '+918697408525', 
'2024-03-12 11:10:29.930', 'nKLw6F1FJrahO6wzOk57ysg9xHD3', '2024-03-12 11:10:29.930', 'nKLw6F1FJrahO6wzOk57ysg9xHD3', 0);	

