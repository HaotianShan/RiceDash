import { relations, type InferSelectModel, type InferInsertModel } from "drizzle-orm";
import {
  pgTable,
  varchar,
  uuid,
  boolean,
  timestamp,
  pgEnum,
  json,
  decimal,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";

// Define ENUMs for status fields to ensure type safety and consistency.
export const driverStatusEnum = pgEnum("driver_status", ["Online", "Offline"]);
export const orderStatusEnum = pgEnum("order_status", ["Pending", "Accepted", "Delivered", "Cancelled"]);
export const paymentStatusEnum = pgEnum("payment_status", ["Pending", "Paid", "Refunded"]);
export const serveryNameEnum = pgEnum("servery_name", ["Seibel", "North", "South", "West", "Baker"]);


// --- USERS TABLE ---
// Stores information for all students, including those who are delivery drivers.
export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    firstName: varchar("first_name", { length: 50 }).notNull(),
    lastName: varchar("last_name", { length: 50 }).notNull(),
    riceEmail: varchar("rice_email", { length: 255 }).notNull().unique(),
    // Make phoneNumber and passwordHash nullable
    phoneNumber: varchar("phone_number", { length: 20 }), // Removed .notNull()
    passwordHash: varchar("password_hash", { length: 255 }), // Removed .notNull()
    isDeliveryDriver: boolean("is_delivery_driver").default(false).notNull(),
    driverStatus: driverStatusEnum("driver_status").default("Offline"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  });
  

// --- ORDERS TABLE ---
// Tracks all orders from creation to completion.
export const orders = pgTable("orders", {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customer_id").notNull().references(() => users.id),
    deliveryPersonId: uuid("delivery_person_id").references(() => users.id), // Nullable
    serveryName: serveryNameEnum("servery_name").notNull(),
    // Stores items as a JSON object for simplicity.
    orderItemsJSON: json("order_items_json").notNull(),
    status: orderStatusEnum("status").default("Pending").notNull(),
    paymentStatus: paymentStatusEnum("payment_status").default("Pending").notNull(),
    totalAmount: decimal("total_amount", { precision: 6, scale: 2 }).notNull(),
    deliveryLocation: varchar("delivery_location", { length: 255 }).notNull(),
    orderTimestamp: timestamp("order_timestamp").defaultNow().notNull(),
    deliveryRating: integer("delivery_rating"), // Can be null if not rated
});


// --- RELATIONS ---
// Define how the tables are related to each other for easier querying.
export const usersRelations = relations(users, ({ many }) => ({
    ordersAsCustomer: many(orders, { relationName: 'customer' }),
    ordersAsDeliveryPerson: many(orders, { relationName: 'delivery_person' }),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
    customer: one(users, {
        fields: [orders.customerId],
        references: [users.id],
        relationName: 'customer',
    }),
    deliveryPerson: one(users, {
        fields: [orders.deliveryPersonId],
        references: [users.id],
        relationName: 'delivery_person',
    }),
}));


// --- TYPES ---
// Export types for use in your application code for type safety.
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export type Order = InferSelectModel<typeof orders>;
export type NewOrder = InferInsertModel<typeof orders>;