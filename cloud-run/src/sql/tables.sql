CREATE TABLE firebase_users (
    firebase_user_id TEXT PRIMARY KEY,
    user_name VARCHAR,
    user_email VARCHAR,
    created_on TIMESTAMP
);

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR,
    created_on TIMESTAMP,
    created_by TEXT REFERENCES firebase_users(firebase_user_id),
    modified_on TIMESTAMP,
    modified_by TEXT REFERENCES firebase_users(firebase_user_id)
);

