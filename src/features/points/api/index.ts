/** biome-ignore-all lint/suspicious/noExplicitAny: <> */

import { useQuery } from "convex/react";

import { api } from "@convex/_generated/api";

export function usePointsSummary() {
  return useQuery(api.points.getSummary, {});
}

export function usePointsAwards(params: { limit?: number }) {
  return useQuery(api.points.getAwards, params as any);
}
