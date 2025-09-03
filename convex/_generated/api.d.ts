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
import type * as llm from "../llm.js";
import type * as otp from "../otp.js";
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
  llm: typeof llm;
  otp: typeof otp;
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
