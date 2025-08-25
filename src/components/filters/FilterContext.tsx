// src/components/filters/FilterContext.tsx
/** biome-ignore-all lint/suspicious/noExplicitAny: <> */

import type React from "react";

import { createContext, useContext, useMemo, useState } from "react";

export type Filters = {
	q?: string;
};

const FilterContext = createContext<{
	filters: Filters;
	setFilters: React.Dispatch<React.SetStateAction<Filters>>;
} | null>(null);

export function FilterProvider({ children }: { children: React.ReactNode }) {
	const [filters, setFilters] = useState<Filters>({ q: undefined });
	const value = useMemo(() => ({ filters, setFilters }), [filters]);
	return (
		<FilterContext.Provider value={value}>{children}</FilterContext.Provider>
	);
}

export function useFilters() {
	const ctx = useContext(FilterContext);
	if (!ctx) throw new Error("useFilters must be used within <FilterProvider>");
	return ctx;
}
