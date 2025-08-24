/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as agent from "../agent.js";
import type * as ai from "../ai.js";
import type * as auth from "../auth.js";
import type * as heroes from "../heroes.js";
import type * as http from "../http.js";
import type * as lib_lunos from "../lib/lunos.js";
import type * as lib_unli from "../lib/unli.js";
import type * as mailry_OTP from "../mailry/OTP.js";
import type * as mailry_OTPPasswordReset from "../mailry/OTPPasswordReset.js";
import type * as mailry_mailryHttp from "../mailry/mailryHttp.js";
import type * as points from "../points.js";
import type * as quizzes from "../quizzes.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  agent: typeof agent;
  ai: typeof ai;
  auth: typeof auth;
  heroes: typeof heroes;
  http: typeof http;
  "lib/lunos": typeof lib_lunos;
  "lib/unli": typeof lib_unli;
  "mailry/OTP": typeof mailry_OTP;
  "mailry/OTPPasswordReset": typeof mailry_OTPPasswordReset;
  "mailry/mailryHttp": typeof mailry_mailryHttp;
  points: typeof points;
  quizzes: typeof quizzes;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
