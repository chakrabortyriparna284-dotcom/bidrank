/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as auth from "../auth.js";
import type * as bids from "../bids.js";
import type * as clicks from "../clicks.js";
import type * as crons from "../crons.js";
import type * as http from "../http.js";
import type * as lib_payments_stripe from "../lib/payments/stripe.js";
import type * as lib_payments_types from "../lib/payments/types.js";
import type * as maintenance from "../maintenance.js";
import type * as payments from "../payments.js";
import type * as products from "../products.js";
import type * as seed from "../seed.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  auth: typeof auth;
  bids: typeof bids;
  clicks: typeof clicks;
  crons: typeof crons;
  http: typeof http;
  "lib/payments/stripe": typeof lib_payments_stripe;
  "lib/payments/types": typeof lib_payments_types;
  maintenance: typeof maintenance;
  payments: typeof payments;
  products: typeof products;
  seed: typeof seed;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
