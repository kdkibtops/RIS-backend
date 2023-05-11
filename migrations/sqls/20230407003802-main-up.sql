CREATE SCHEMA "main";

CREATE TABLE "main"."users" (
  "user_id" integer,
  "username" varchar(50) PRIMARY KEY,
  "full_name" varchar(75),
  "user_password" text,
  "user_role" varchar(50),
  "job" varchar(100),
  "email" varchar(150),
  "created" varchar(100)
);

CREATE TABLE "main"."patients" (
  "mrn" varchar(20) PRIMARY KEY,
  "patient_name" varchar(100),
  "national_id" varchar(14),
  "dob" varchar(50),
  "age" varchar,
  "gender" varchar,
  "contacts" varchar,
  "email" varchar(150),
  "registered_by" varchar(50),
  "registered_date" varchar
);

CREATE TABLE "main"."orders" (
  "order_id" varchar(50) PRIMARY KEY,
  "mrn" varchar(50),
  "study" varchar(10),
  "o_date" date,
  "o_status" varchar(20),
  "report" text[],
  "radiologist" varchar(75),
  "report_status" varchar(50),
  "last_update" varchar(75),
  "updated_by" varchar(50)
);

CREATE TABLE "main"."studies" (
  "study_id" varchar(10) PRIMARY KEY,
  "modality" varchar(10),
  "study_name" varchar(100),
  "arabic_name" varchar,
  "price" varchar,
  "last_update" varchar(75),
  "updated_by" varchar(50)
);

ALTER TABLE "main"."patients" ADD FOREIGN KEY ("registered_by") REFERENCES "main"."users" ("username");

ALTER TABLE "main"."orders" ADD FOREIGN KEY ("mrn") REFERENCES "main"."patients" ("mrn");

ALTER TABLE "main"."orders" ADD FOREIGN KEY ("updated_by") REFERENCES "main"."users" ("username");

ALTER TABLE "main"."orders" ADD FOREIGN KEY ("study") REFERENCES "main"."studies" ("study_id");

ALTER TABLE "main"."studies" ADD FOREIGN KEY ("updated_by") REFERENCES "main"."users" ("username");
