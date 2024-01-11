CREATE TABLE firebase_users (
    firebase_user_id TEXT PRIMARY KEY,
    user_name VARCHAR,
    user_email VARCHAR NOT NULL,
    contact_no VARCHAR NOT NULL,
    created_on TIMESTAMP
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    firebase_user_id TEXT,
    name VARCHAR,
    email VARCHAR NOT NULL,
    contact_no VARCHAR,
    status SMALLINT DEFAULT 0, -- 0 IS active 1 IS deactive
    role_id INTEGER REFERENCES roles(id),
    created_on TIMESTAMP,
    created_by TEXT REFERENCES firebase_users(firebase_user_id),
    modified_on TIMESTAMP,
    modified_by TEXT REFERENCES firebase_users(firebase_user_id)
); 



CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR,
    created_on TIMESTAMP,
    created_by TEXT REFERENCES firebase_users(firebase_user_id),
    modified_on TIMESTAMP,
    modified_by TEXT REFERENCES firebase_users(firebase_user_id)
);

CREATE TABLE products_category (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR,
    created_on TIMESTAMP,
    created_by TEXT REFERENCES firebase_users(firebase_user_id),
    modified_on TIMESTAMP,
    modified_by TEXT REFERENCES firebase_users(firebase_user_id)
);

CREATE TABLE products_sub_category (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR,
    category_id INTEGER REFERENCES products_category(id),
    created_on TIMESTAMP,
    created_by TEXT REFERENCES firebase_users(firebase_user_id),
    modified_on TIMESTAMP,
    modified_by TEXT REFERENCES firebase_users(firebase_user_id)
);

CREATE TABLE products_sub_category (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR,
    category_id INTEGER REFERENCES products_category(id),
    created_on TIMESTAMP,
    created_by TEXT REFERENCES firebase_users(firebase_user_id),
    modified_on TIMESTAMP,
    modified_by TEXT REFERENCES firebase_users(firebase_user_id)
);

CREATE TABLE products_sub_sub_category (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR,
    category_id INTEGER REFERENCES products_sub_category(id),
    created_on TIMESTAMP,
    created_by TEXT REFERENCES firebase_users(firebase_user_id),
    modified_on TIMESTAMP,
    modified_by TEXT REFERENCES firebase_users(firebase_user_id)
);


CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR,
    category_id INTEGER REFERENCES products_category(id),
    sub_category INTEGER REFERENCES products_sub_category(id),
    sub_sub_category INTEGER REFERENCES products_sub_sub_category(id),
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT REFERENCES firebase_users(firebase_user_id),
    modified_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_by TEXT REFERENCES firebase_users(firebase_user_id)
);



-- add address field
CREATE TABLE vendors (
	id SERIAL PRIMARY KEY,
	name VARCHAR,
	email VARCHAR,
	address VARCHAR,
	contact_no VARCHAR,
	created_on TIMESTAMP,
    created_by TEXT REFERENCES firebase_users(firebase_user_id),
    modified_on TIMESTAMP,
    modified_by TEXT REFERENCES firebase_users(firebase_user_id)
)

CREATE TABLE vendor_category_map (
	id SERIAL PRIMARY KEY,
	vendor_id INTEGER REFERENCES vendors(id) ,
	category_id INTEGER REFERENCES products_category(id) ,
	sub_category_id INTEGER REFERENCES products_sub_category(id) DEFAULT NULL,
	sub_sub_category_id INTEGER REFERENCES products_sub_sub_category(id) DEFAULT NULL,
	created_on TIMESTAMP,
    created_by TEXT REFERENCES firebase_users(firebase_user_id),
    modified_on TIMESTAMP,
    modified_by TEXT REFERENCES firebase_users(firebase_user_id)
);

CREATE TABLE product_vendor_map (
    id SERIAL PRIMARY KEY,
    vendor_id INTEGER REFERENCES vendors(id),
    product_id INTEGER REFERENCES products(id),
    created_on TIMESTAMP,
    created_by TEXT REFERENCES firebase_users(firebase_user_id),
    modified_on TIMESTAMP,
    modified_by TEXT REFERENCES firebase_users(firebase_user_id)
);


