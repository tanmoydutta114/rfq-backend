#!/bin/bash

yarn
yarn build

gcloud run deploy rfq-backend-prod \
    --platform managed \
    --memory 512Mi \
    --region us-central1 \
    --allow-unauthenticated \
    --add-cloudsql-instances rfq-test \
    --set-env-vars "DATABASE_URL=postgres://postgres:1aBequP67q3rFjat@localhost/rfq-prod-test" \
    --set-env-vars "DB_NAME=rfq-prod-test" \
    --set-env-vars "CLOUD_SQL_CONNECTION_NAME=/cloudsql/grand-kingdom-410705:us-central1:rfq-test" \
    --set-env-vars "DB_USER=postgres" \
    --set-env-vars "DB_PASS=1aBequP67q3rFjat"
