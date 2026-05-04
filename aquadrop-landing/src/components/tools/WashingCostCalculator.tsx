'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState, type Dispatch, type SetStateAction } from 'react';

import { trackEvent } from '@/lib/tracking';

const ELECTRICITY_PRICE_FT_PER_KWH = 35.3;
const TEMPERATURE_OPTIONS = [20, 30, 40, 60, 80, 90] as const;
const DURATION_OPTIONS = [18, 30, 45, 60, 120, 180] as const;
const WEEKLY_WASH_OPTIONS = [2, 3, 4, 5, 6, 7] as const;
const HOUSEHOLD_OPTIONS = [1, 2, 3, 4, 5, 6] as const;
const BASELINE = { temperature: 20, durationMinutes: 18 } as const;

type CalculatorOptionGroup = {
  options: readonly number[];
  value: number;
  setValue: Dispatch<SetStateAction<number>>;
  label: string;
  suffix: string;
};

function estimateEnergyPerWash(temperature: number, durationMinutes: number): number {
  const durationFactor = Math.pow(durationMinutes / BASELINE.durationMinutes, 0.62);
  const baseMachineConsumption = 0.075 * durationFactor;
  const tempDelta = Math.max(0, temperature - BASELINE.temperature);
  const heatingComponent = 0.0033 * Math.pow(tempDelta, 1.22) * Math.pow(durationMinutes / 180, 0.9);

  return Number((baseMachineConsumption + heatingComponent).toFixed(3));
}

function calculateCostMetrics(temperature: number, durationMinutes: number, weeklyWashes: number) {
  const estimatedKwhPerWash = estimateEnergyPerWash(temperature, durationMinutes);
  const estimatedCostPerWash = estimatedKwhPerWash * ELECTRICITY_PRICE_FT_PER_KWH;
  const estimatedAnnualCost = estimatedCostPerWash * weeklyWashes * 52;

  const baselineKwhPerWash = estimateEnergyPerWash(BASELINE.temperature, BASELINE.durationMinutes);
  const baselineAnnualCost = baselineKwhPerWash * ELECTRICITY_PRICE_FT_PER_KWH * weeklyWashes * 52;

  return {
    estimatedKwhPerWash,
    estimatedCostPerWash,
    estimatedAnnualCost,
    annualDifferenceFromBaseline: estimatedAnnualCost - baselineAnnualCost
  };
}

const formatNumber = (value: number) =>
  new Intl.NumberFormat('hu-HU', { maximumFractionDigits: 0 }).format(Math.round(value));

const formatDecimal = (value: number) =>
  new Intl.NumberFormat('hu-HU', { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(value);

function parseOption(raw: string | null, allowed: readonly number[], fallback: number) {
  const value = Number(raw);
  return allowed.includes(value as never) ? value : fallback;
}

type WashingCostCalculatorProps = {
  placement?: 'calculator_page' | 'article';
  showShare?: boolean;
  showEmbed?: boolean;
  showIntroBadge?: boolean;
  isEmbed?: boolean;
};

export function WashingCostCalculator(props: WashingCostCalculatorProps) {
  return (
    <Suspense fallback={<CalculatorFallback />}>
      <WashingCostCalculatorInner {...props} />
    </Suspense>
  );
}

function WashingCostCalculatorInner({
  placement = 'article',
  showShare = false,
  showEmbed = false,
  showIntroBadge = true,
  isEmbed = false
}: WashingCostCalculatorProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [temperature, setTemperature] = useState<number>(parseOption(searchParams.get('temp'), TEMPERATURE_OPTIONS, 40));
  const [durationMinutes, setDurationMinutes] = useState<number>(parseOption(searchParams.get('program'), DURATION_OPTIONS, 45));
  const [weeklyWashes, setWeeklyWashes] = useState<number>(parseOption(searchParams.get('washesPerWeek'), WEEKLY_WASH_OPTIONS, 4));
  const [householdSize, setHouseholdSize] = useState<number>(parseOption(searchParams.get('household'), HOUSEHOLD_OPTIONS, 3));
  const [linkCopied, setLinkCopied] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);

  const metrics = useMemo(
    () => calculateCostMetrics(temperature, durationMinutes, weeklyWashes),
    [temperature, durationMinutes, weeklyWashes]
  );

  const isBaseline = temperature === BASELINE.temperature && durationMinutes === BASELINE.durationMinutes;
  const shareUrl = `https://www.aquadrop.hu${pathname}?temp=${temperature}&washesPerWeek=${weeklyWashes}&program=${durationMinutes}&household=${householdSize}`;

  const iframeCode = `<iframe\n  src="https://www.aquadrop.hu/mosasi-koltseg-kalkulator?embed=true"\n  width="100%"\n  height="720"\n  style="border:0;border-radius:16px;overflow:hidden;"\n  loading="lazy"\n></iframe>`;

  const optionGroups: CalculatorOptionGroup[] = [
    { options: TEMPERATURE_OPTIONS, value: temperature, setValue: setTemperature, label: 'Mosási hőfok', suffix: ' °C' },
    { options: DURATION_OPTIONS, value: durationMinutes, setValue: setDurationMinutes, label: 'Program hossza', suffix: ' p' },
    { options: WEEKLY_WASH_OPTIONS, value: weeklyWashes, setValue: setWeeklyWashes, label: 'Heti mosások száma', suffix: '' },
    { options: HOUSEHOLD_OPTIONS, value: householdSize, setValue: setHouseholdSize, label: 'Háztartás mérete', suffix: ' fő' }
  ];

  return (
    <section className="rounded-[30px] border border-cyan-100/90 bg-gradient-to-br from-white via-cyan-50/80 to-teal-50/80 p-5 shadow-[0_22px_65px_rgba(15,23,42,0.10)] md:p-8">
      <div className="space-y-6">
        {showIntroBadge && <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Interaktív kalkulátor</p>}
        <div className="space-y-3">
          <h3 className="text-2xl leading-tight text-slate-900 md:text-3xl">Becsült mosási költség hőfok és program szerint</h3>
          <p className="text-slate-700">Válaszd ki a hőfokot, programhosszt és heti mosási rutint, majd hasonlítsd a becsült éves költséget a 20 °C / 18 perces baseline-hoz.</p>
        </div>

        <div className="grid gap-4">
          {optionGroups.map(({ options, value, setValue, label, suffix }) => (
            <div key={label}>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-600">{label}</p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setValue(option)}
                    className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                      option === value
                        ? 'border-cyan-500 bg-cyan-500 text-white shadow-sm'
                        : 'border-cyan-100 bg-white/90 text-slate-700 hover:border-cyan-300'
                    }`}
                  >
                    {option}
                    {suffix}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <MetricCard label="Becsült energiafogyasztás / mosás" value={`${formatDecimal(metrics.estimatedKwhPerWash)} kWh`} />
          <MetricCard label="Becsült költség / mosás" value={`${formatNumber(metrics.estimatedCostPerWash)} Ft`} />
          <MetricCard label="Becsült éves költség" value={`${formatNumber(metrics.estimatedAnnualCost)} Ft/év`} />
          <div className="rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-cyan-600 to-sky-700 p-5 text-white shadow-md">
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-100">Különbség a 20 °C / 18 perces baseline-hoz képest</p>
            <p className="mt-2 text-2xl font-semibold md:text-3xl">
              {isBaseline ? 'Ez a legalacsonyabb becsült költségű beállítás' : `+${formatNumber(metrics.annualDifferenceFromBaseline)} Ft/év`}
            </p>
          </div>
        </div>

        {showShare && (
          <div className="rounded-2xl border border-cyan-100 bg-white/85 p-4">
            <h4 className="font-semibold">Eredmény megosztása</h4>
            <button type="button" className="mt-2 rounded-xl bg-cyan-600 px-4 py-2 text-white" onClick={async () => { await navigator.clipboard.writeText(shareUrl); setLinkCopied(true); trackEvent('calculator_share_link_click', { placement }); setTimeout(() => setLinkCopied(false), 1500); }}>
              Link másolása
            </button>
            {linkCopied && <p className="text-sm text-emerald-700">Link másolva</p>}
            <div className="mt-2 flex gap-3 text-sm">
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer">Facebook megosztás</a>
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer">LinkedIn megosztás</a>
            </div>
          </div>
        )}

        {showEmbed && (
          <div className="rounded-2xl border border-cyan-100 bg-white/85 p-4">
            <h4 className="font-semibold">Ágyazd be a kalkulátort a saját oldaladra</h4>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-cyan-100">{iframeCode}</pre>
            <button type="button" onClick={async () => { await navigator.clipboard.writeText(iframeCode); setEmbedCopied(true); trackEvent('calculator_embed_copy_click', { placement }); setTimeout(() => setEmbedCopied(false), 1500); }} className="mt-2 rounded-xl border border-cyan-200 px-4 py-2">
              Iframe kód másolása
            </button>
            {embedCopied && <p className="text-sm text-emerald-700">Iframe kód másolva</p>}
          </div>
        )}

        {isEmbed && <p className="text-center text-sm text-slate-600">Kalkulátor: <Link href="https://www.aquadrop.hu/mosasi-koltseg-kalkulator" target="_blank" className="font-medium text-cyan-700">Aquadrop mosási költség kalkulátor</Link></p>}
      </div>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-cyan-100 bg-white/95 p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900 md:text-3xl">{value}</p>
    </div>
  );
}

function CalculatorFallback() {
  return (
    <section className="rounded-[30px] border border-cyan-100/90 bg-gradient-to-br from-white via-cyan-50/80 to-teal-50/80 p-5 shadow-[0_22px_65px_rgba(15,23,42,0.10)] md:p-8">
      <p className="text-slate-700">Kalkulátor betöltése...</p>
    </section>
  );
}

export { ELECTRICITY_PRICE_FT_PER_KWH, estimateEnergyPerWash, calculateCostMetrics };
