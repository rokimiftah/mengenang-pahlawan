/** biome-ignore-all lint/suspicious/noExplicitAny: <> */

import { useAction, useMutation, useQuery } from "convex/react";

import { api } from "@convex/_generated/api";

export function useHeroesList(params: { q?: string; era?: string; limit?: number }) {
  return useQuery(api.heroes.list, params as any);
}

export function useHeroBySlug(slug?: string) {
  return useQuery(api.heroes.getBySlug, slug ? { slug } : ("skip" as any));
}

export function useSimplifySummary() {
  return useAction(api.ai.simplifySummary);
}

export function useGenerateQuiz() {
  return useAction(api.ai.generateAiQuiz);
}

export function useSaveQuizAttempt() {
  return useMutation(api.quizzes.recordAttempt);
}

export function useChatAsHero() {
  return useAction(api.agent.chatAsHero as any);
}

export function useRecommendHeroes() {
  return useAction(api.agent.recommendHeroes as any);
}
