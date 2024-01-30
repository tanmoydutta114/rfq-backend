#!/bin/bash

gcloud run deploy rfq-backend \
    --platform managed \
    --memory 512Mi \
    --region us-central1 \
    --allow-unauthenticated \
    --add-cloudsql-instances rfq-test \
    --set-env-vars "DATABASE_URL=postgres://postgres:1aBequP67q3rFjat@34.132.234.98/rfq-test" \
    --set-env-vars "DB_NAME=rfq-test" \
    --set-env-vars "CLOUD_SQL_CONNECTION_NAME=172.0.0.1" \
    --set-env-vars "DB_USER=postgres" \
    --set-env-vars "DB_PASS=1aBequP67q3rFjat"
