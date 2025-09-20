DO $$ BEGIN
 CREATE TYPE "public"."driver_status" AS ENUM('Online', 'Offline');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."order_status" AS ENUM('Pending', 'Accepted', 'Delivered', 'Cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."payment_status" AS ENUM('Pending', 'Paid', 'Refunded');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."servery_name" AS ENUM('Seibel', 'North', 'South', 'West', 'Baker');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"delivery_person_id" uuid,
	"servery_name" "servery_name" NOT NULL,
	"order_items_json" json NOT NULL,
	"status" "order_status" DEFAULT 'Pending' NOT NULL,
	"payment_status" "payment_status" DEFAULT 'Pending' NOT NULL,
	"total_amount" numeric(6, 2) NOT NULL,
	"delivery_location" varchar(255) NOT NULL,
	"order_timestamp" timestamp DEFAULT now() NOT NULL,
	"delivery_rating" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(50) NOT NULL,
	"last_name" varchar(50) NOT NULL,
	"rice_email" varchar(255) NOT NULL,
	"phone_number" varchar(20) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"is_delivery_driver" boolean DEFAULT false NOT NULL,
	"driver_status" "driver_status" DEFAULT 'Offline',
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_rice_email_unique" UNIQUE("rice_email"),
	CONSTRAINT "users_phone_number_unique" UNIQUE("phone_number")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_delivery_person_id_users_id_fk" FOREIGN KEY ("delivery_person_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
