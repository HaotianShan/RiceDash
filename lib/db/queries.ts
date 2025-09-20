import "server-only";

import { genSaltSync, hashSync } from "bcrypt-ts";
import { and, eq, isNull, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import {
  users,
  orders,
  type NewUser,
  type User,
  type NewOrder,
  type Order,
} from "./schema";

// Establish the database connection.
// biome-ignore lint: Non-null assertion is acceptable here for environment variables.
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client, { schema: { users, orders } });


// --- USER QUERIES ---

/**
 * Creates a new user in the database with a hashed password.
 * @param userDetails - The details of the new user.
 * @returns The newly created user record.
 */
export async function createUser(
  // Make passwordPlain optional
  userDetails: Omit<NewUser, 'id' | 'passwordHash' | 'createdAt'> & { passwordPlain?: string }
) {
  let hash: string | undefined = undefined;

  // Only hash a password if one is provided
  if (userDetails.passwordPlain) {
    const salt = genSaltSync(10);
    hash = hashSync(userDetails.passwordPlain, salt);
  }

  try {
    const [newUser] = await db.insert(users).values({
      ...userDetails,
      passwordHash: hash, // Pass the hash or undefined
    }).returning();
    return newUser;
  } catch (error) {
    console.error("Failed to create user in database:", error);
    throw new Error("Could not create user.");
  }
}

/**
 * Retrieves a user by their Rice email address.
 * @param email - The email of the user to find.
 * @returns The user object if found, otherwise undefined.
 */
export async function getUser(email: string): Promise<User[]> {
  try {
    return await db.select().from(users).where(eq(users.riceEmail, email));
  } catch (error) {
    console.error("Failed to get user from database:", error);
    throw new Error("Could not retrieve user.");
  }
}

/**
 * Updates a user's profile to become a delivery driver.
 * @param userId - The ID of the user to update.
 */
export async function setUserAsDriver(userId: string) {
    try {
        await db.update(users)
            .set({ isDeliveryDriver: true })
            .where(eq(users.id, userId));
    } catch (error) {
        console.error("Failed to update user to driver:", error);
        throw new Error("Could not update user role.");
    }
}

/**
 * Sets a driver's availability status.
 * @param driverId - The ID of the driver.
 * @param status - The new status ('Online' or 'Offline').
 */
export async function setDriverStatus(driverId: string, status: 'Online' | 'Offline') {
    try {
        await db.update(users)
            .set({ driverStatus: status })
            .where(eq(users.id, driverId));
    } catch (error) {
        console.error("Failed to set driver status:", error);
        throw new Error("Could not update driver status.");
    }
}

/**
 * Gets a list of all available (Online) delivery drivers.
 * @returns An array of available driver user objects.
 */
export async function getAvailableDrivers(): Promise<User[]> {
    try {
        return await db.select().from(users).where(
            and(
                eq(users.isDeliveryDriver, true),
                eq(users.driverStatus, 'Online')
            )
        );
    } catch (error) {
        console.error("Failed to get available drivers:", error);
        throw new Error("Could not retrieve available drivers.");
    }
}


// --- ORDER QUERIES ---

/**
 * Creates a new order in the database.
 * @param orderDetails - The details of the new order.
 * @returns The newly created order record.
 */
export async function createOrder(orderDetails: Omit<NewOrder, 'id' | 'orderTimestamp' | 'status'>): Promise<Order> {
    try {
        const [newOrder] = await db.insert(orders).values(orderDetails).returning();
        return newOrder;
    } catch (error) {
        console.error("Failed to create order:", error);
        throw new Error("Could not create order.");
    }
}

/**
 * Retrieves all orders that are 'Pending' and have no delivery person assigned.
 * @returns An array of pending order objects.
 */
export async function getPendingOrders(): Promise<Order[]> {
    try {
        return await db.select().from(orders).where(
            and(
                eq(orders.status, 'Pending'),
                isNull(orders.deliveryPersonId)
            )
        );
    } catch (error) {
        console.error("Failed to get pending orders:", error);
        throw new Error("Could not retrieve pending orders.");
    }
}

/**
 * Retrieves all orders from the last 30 minutes with customer information.
 * @returns An array of recent order objects with customer details.
 */
export async function getRecentOrdersWithCustomers(): Promise<(Order & { customer: User })[]> {
    try {
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        
        const results = await db.select({
            // Order fields
            id: orders.id,
            customerId: orders.customerId,
            deliveryPersonId: orders.deliveryPersonId,
            serveryName: orders.serveryName,
            orderItemsJSON: orders.orderItemsJSON,
            status: orders.status,
            paymentStatus: orders.paymentStatus,
            totalAmount: orders.totalAmount,
            deliveryLocation: orders.deliveryLocation,
            orderTimestamp: orders.orderTimestamp,
            deliveryRating: orders.deliveryRating,
            // Customer fields
            customer: {
                id: users.id,
                firstName: users.firstName,
                lastName: users.lastName,
                riceEmail: users.riceEmail,
                phoneNumber: users.phoneNumber,
                passwordHash: users.passwordHash,
                isDeliveryDriver: users.isDeliveryDriver,
                driverStatus: users.driverStatus,
                createdAt: users.createdAt,
            }
        })
        .from(orders)
        .innerJoin(users, eq(orders.customerId, users.id))
        .where(gte(orders.orderTimestamp, thirtyMinutesAgo))
        .orderBy(orders.orderTimestamp);
        
        return results;
    } catch (error) {
        console.error("Failed to get recent orders:", error);
        throw new Error("Could not retrieve recent orders.");
    }
}

/**
 * Assigns a delivery person to an order and updates its status to 'Accepted'.
 * @param orderId - The ID of the order to accept.
 * @param driverId - The ID of the driver accepting the order.
 * @returns The updated order record.
 */
export async function acceptOrder(orderId: string, driverId: string): Promise<Order> {
    try {
        const [updatedOrder] = await db.update(orders)
            .set({ deliveryPersonId: driverId, status: 'Accepted' })
            .where(eq(orders.id, orderId))
            .returning();
        return updatedOrder;
    } catch (error) {
        console.error("Failed to accept order:", error);
        throw new Error("Could not accept order.");
    }
}