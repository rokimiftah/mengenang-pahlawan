// src/pages/DashboardPage/index.tsx
/** biome-ignore-all lint/suspicious/noExplicitAny: <> */

import { useCallback, useState } from "react";

import { Authenticated, Unauthenticated } from "convex/react";
import { useRoute } from "wouter";

import { AuthenticationForm, UserMenu } from "@features/auth";
import { HeroDetail, HeroesModel, HeroShelf, SearchFilterLauncher } from "@features/heroes";
import { PointsBadge, PointsHistoryModal } from "@features/points";

import "./Dashboard.css";

function HeaderSearchSlot() {
  const { setFilters } = HeroesModel.useFilters();

  const handleApply = useCallback(
    (v: { q?: string }) => {
      const trimmed = v.q?.trim() || undefined;
      setFilters((prev) => (prev.q === trimmed ? prev : { ...prev, q: trimmed }));
    },
    [setFilters],
  );

  return <SearchFilterLauncher onApply={handleApply} />;
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isDetail] = useRoute<{ slug: string }>("/pahlawan/:slug");

  return (
    <>
      <Authenticated>
        <HeroesModel.FilterProvider>
          <div className="flex h-dvh flex-col overflow-hidden bg-[#111110]">
            <div className="mx-auto w-full max-w-screen-2xl flex-shrink-0">
              <header className="flex items-center justify-between px-4 py-4 md:px-8 md:py-8">
                <a
                  href="/"
                  className="inline-flex items-center gap-2.5 text-2xl font-bold text-black md:text-3xl"
                  aria-label="logo"
                >
                  <svg
                    viewBox="0 0 266.66666 266.66666"
                    className="h-12 w-12 text-indigo-500"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <clipPath clipPathUnits="userSpaceOnUse" id="clipPath3">
                        <path d="M 0,200 H 200 V 0 H 0 Z" transform="translate(-75.999999,-132.75)" id="path3" />
                      </clipPath>
                      <clipPath clipPathUnits="userSpaceOnUse" id="clipPath5">
                        <path d="M 0,200 H 200 V 0 H 0 Z" transform="translate(-82,-97.556205)" id="path5" />
                      </clipPath>
                      <clipPath clipPathUnits="userSpaceOnUse" id="clipPath7">
                        <path d="M 0,200 H 200 V 0 H 0 Z" transform="translate(-144.25,-83.000002)" id="path7" />
                      </clipPath>
                      <clipPath clipPathUnits="userSpaceOnUse" id="clipPath9">
                        <path d="M 0,200 H 200 V 0 H 0 Z" transform="translate(-130,-83.000002)" id="path9" />
                      </clipPath>
                    </defs>
                    <g id="layer-MC0">
                      <path
                        id="path1"
                        d="M 0,0 H 200 V 200 H 0 Z"
                        style={{ fill: "#ed1c24", fillOpacity: 1, fillRule: "nonzero", stroke: "none" }}
                        transform="matrix(1.3333333,0,0,-1.3333333,0,266.66667)"
                      />
                      <path
                        id="path2"
                        d="m 0,0 c -8.685,0 -15.75,-7.065 -15.75,-15.75 0,-6.56 4.034,-12.191 9.75,-14.556 v 14.556 c 0,3.314 2.686,6 6,6 3.314,0 6,-2.686 6,-6 v -14.556 c 5.716,2.365 9.75,7.996 9.75,14.556 C 15.75,-7.065 8.685,0 0,0"
                        style={{ fill: "#ffffff", fillOpacity: 1, fillRule: "nonzero", stroke: "none" }}
                        transform="matrix(1.3333333,0,0,-1.3333333,101.33333,89.666667)"
                        clipPath="url(#clipPath3)"
                      />
                      <path
                        id="path4"
                        d="m 0,0 v -14.556 c 0,-3.314 -2.686,-6 -6,-6 -3.314,0 -6,2.686 -6,6 V 0 c -5.716,-2.365 -9.75,-7.996 -9.75,-14.556 0,-8.685 7.065,-15.75 15.75,-15.75 8.685,0 15.75,7.065 15.75,15.75 C 9.75,-7.996 5.716,-2.365 0,0"
                        style={{ fill: "#ffffff", fillOpacity: 1, fillRule: "nonzero", stroke: "none" }}
                        transform="matrix(1.3333333,0,0,-1.3333333,109.33333,136.59173)"
                        clipPath="url(#clipPath5)"
                      />
                      <path
                        id="path6"
                        d="m 0,0 c 0,-11.166 -9.084,-20.25 -20.25,-20.25 -11.166,0 -20.25,9.084 -20.25,20.25 v 34 c 0,11.166 9.084,20.25 20.25,20.25 C -9.084,54.25 0,45.166 0,34 Z m -48,0 c 0,-11.166 -9.084,-20.25 -20.25,-20.25 -11.166,0 -20.25,9.084 -20.25,20.25 0,7.125 3.708,13.39 9.286,17 -5.578,3.61 -9.286,9.875 -9.286,17 0,11.166 9.084,20.25 20.25,20.25 C -57.084,54.25 -48,45.166 -48,34 -48,26.875 -51.708,20.61 -57.286,17 -51.708,13.39 -48,7.125 -48,0 m 27.75,63 c -9.981,0 -18.783,-5.043 -24,-12.719 -5.217,7.676 -14.019,12.719 -24,12.719 -16.016,0 -29,-12.984 -29,-29 0,-6.352 2.048,-12.223 5.512,-17 -3.464,-4.777 -5.512,-10.648 -5.512,-17 0,-16.016 12.984,-29 29,-29 9.981,0 18.783,5.043 24,12.719 5.217,-7.676 14.019,-12.719 24,-12.719 16.016,0 29,12.984 29,29 v 34 c 0,16.016 -12.984,29 -29,29"
                        style={{ fill: "#ffffff", fillOpacity: 1, fillRule: "nonzero", stroke: "none" }}
                        transform="matrix(1.3333333,0,0,-1.3333333,192.33333,156)"
                        clipPath="url(#clipPath7)"
                      />
                      <path
                        id="path8"
                        d="m 0,0 c 0,-3.314 -2.686,-6 -6,-6 -3.314,0 -6,2.686 -6,6 v 34 c 0,3.314 2.686,6 6,6 3.314,0 6,-2.686 6,-6 z m -6,49.75 c -8.685,0 -15.75,-7.065 -15.75,-15.75 V 0 c 0,-8.685 7.065,-15.75 15.75,-15.75 8.685,0 15.75,7.065 15.75,15.75 V 34 C 9.75,42.685 2.685,49.75 -6,49.75"
                        style={{ fill: "#ffffff", fillOpacity: 1, fillRule: "nonzero", stroke: "none" }}
                        transform="matrix(1.3333333,0,0,-1.3333333,173.33333,156)"
                        clipPath="url(#clipPath9)"
                      />
                    </g>
                  </svg>
                </a>
                <div className="flex items-center gap-2">
                  {!isDetail && <HeaderSearchSlot />}
                  <PointsBadge onClick={() => setOpen(true)} />
                  <UserMenu />
                  <PointsHistoryModal opened={open} onClose={() => setOpen(false)} />
                </div>
              </header>
            </div>

            <section className="relative mx-4 mb-4 flex flex-1 overflow-hidden rounded-lg bg-neutral-200 shadow-lg md:mx-8 md:mb-8">
              <div className="relative z-10 flex h-full min-h-0 w-full flex-col items-stretch p-4">{children}</div>
            </section>
          </div>
        </HeroesModel.FilterProvider>
      </Authenticated>

      <Unauthenticated>
        <AuthenticationForm />
      </Unauthenticated>
    </>
  );
}

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <HeroShelf />
    </DashboardLayout>
  );
}

export function DashboardHeroPage() {
  return (
    <DashboardLayout>
      <HeroDetail />
    </DashboardLayout>
  );
}
