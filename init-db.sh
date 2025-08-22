#!/bin/bash
set -e

# 创建 job_applications 表
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE TABLE IF NOT EXISTS job_applications (
    id SERIAL PRIMARY KEY,
    company VARCHAR(255) NOT NULL,
    base VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    position_link TEXT,
    resume_version VARCHAR(255),
    resume_modified TIMESTAMP,
    apply_link TEXT,
    status VARCHAR(50) NOT NULL DEFAULT '简历投递',
    apply_date TIMESTAMP NOT NULL DEFAULT NOW(),
    update_date TIMESTAMP NOT NULL DEFAULT NOW(),
    status_history JSONB,
    notes TEXT
  );
EOSQL
