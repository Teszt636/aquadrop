'use client';

import { useMemo, useState } from 'react';

const ELECTRICITY_PRICE_FT_PER_KWH = 35.3;

const TEMPERATURE_OPTIONS = [20, 30, 40, 60, 80, 90] as const;
const DURATION_OPTIONS = [18, 30, 45, 60, 120, 180] as const;
const WEEKLY_WASH_OPTIONS = [2, 3, 4, 5, 6, 7] as const;

const BASELINE = {
  temperature: 20,
  durationMinutes: 18
} as const;

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

function formatNumber(value: number) {
  return new Intl.NumberFormat('hu-HU', {
    maximumFractionDigits: 0
  }).format(Math.round(value));
}

function formatDecimal(value: number, fractionDigits = 3) {
  return new Intl.NumberFormat('hu-HU', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  }).format(value);
}

type OptionSelectorProps = {
  label: string;
  options: readonly number[];
  value: number;
  suffix: string;
  onChange: (value: number) => void;
};

function OptionSelector({ label, options, value, suffix, onChange }: OptionSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-600">{label}</p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {options.map((option) => {
          const isSelected = option === value;
          return (
            <button
              key={option}
              className={`rounded-xl border px-3 py-2 text-sm font-semibold transition md:text-base ${
                isSelected
                  ? 'border-cyan-500 bg-cyan-500 text-white shadow-[0_10px_20px_rgba(6,182,212,0.3)]'
                  : 'border-cyan-100 bg-white/80 text-slate-700 hover:border-cyan-300 hover:bg-cyan-50'
              }`}
              onClick={() => onChange(option)}
              type="button"
            >
              {option}
              {suffix}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function EnergySavingsCalculator() {
  const [temperature, setTemperature] = useState<number>(40);
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [weeklyWashes, setWeeklyWashes] = useState<number>(4);

  const metrics = useMemo(
    () => calculateCostMetrics(temperature, durationMinutes, weeklyWashes),
    [temperature, durationMinutes, weeklyWashes]
  );

  const isBaseline =
    temperature === BASELINE.temperature && durationMinutes === BASELINE.durationMinutes;

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-cyan-100/90 bg-gradient-to-br from-white via-cyan-50/70 to-teal-50/80 p-5 shadow-[0_24px_70px_rgba(14,116,144,0.14)] md:p-8">
      <div className="pointer-events-none absolute -top-16 right-0 h-40 w-40 rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 left-0 h-36 w-36 rounded-full bg-teal-300/20 blur-3xl" />

      <div className="relative space-y-7">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-800">Interaktív kalkulátor</p>
          <h3 className="text-2xl leading-tight md:text-3xl">Becsült mosási költség hőfok és program szerint</h3>
          <p className="max-w-3xl text-slate-700">
            A kalkuláció becslés, amely egy modern mosógép várható energiaigényét modellezi. Az összegzés
            összehasonlításra készült: ugyanazzal a heti mosásszámmal mutatja a különbséget a 20 °C / 18 perces
            baseline beállításhoz viszonyítva.
          </p>
        </div>

        <div className="grid gap-5">
          <OptionSelector
            label="Mosási hőfok"
            onChange={setTemperature}
            options={TEMPERATURE_OPTIONS}
            suffix=" °C"
            value={temperature}
          />
          <OptionSelector
            label="Program hossza"
            onChange={setDurationMinutes}
            options={DURATION_OPTIONS}
            suffix=" p"
            value={durationMinutes}
          />
          <OptionSelector
            label="Heti mosások száma"
            onChange={setWeeklyWashes}
            options={WEEKLY_WASH_OPTIONS}
            suffix=""
            value={weeklyWashes}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-[0_14px_35px_rgba(15,23,42,0.08)]">
            <p className="text-sm text-slate-600">Becsült energiafogyasztás / mosás</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{formatDecimal(metrics.estimatedKwhPerWash)} kWh</p>
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-[0_14px_35px_rgba(15,23,42,0.08)]">
            <p className="text-sm text-slate-600">Becsült költség / mosás</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{formatNumber(metrics.estimatedCostPerWash)} Ft</p>
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-[0_14px_35px_rgba(15,23,42,0.08)]">
            <p className="text-sm text-slate-600">Becsült éves költség</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{formatNumber(metrics.estimatedAnnualCost)} Ft/év</p>
          </div>
          <div className="rounded-2xl border border-cyan-200 bg-gradient-to-r from-cyan-500 to-teal-500 p-5 text-white shadow-[0_18px_40px_rgba(6,182,212,0.35)] transition-all duration-300">
            <p className="text-sm text-cyan-50">Különbség a 20 °C / 18 perces baseline-hoz képest</p>
            <p className="mt-2 text-3xl font-semibold leading-tight md:text-4xl">
              {isBaseline
                ? 'Ez a legalacsonyabb becsült költségű beállítás'
                : `+${formatNumber(metrics.annualDifferenceFromBaseline)} Ft/év`}
            </p>
            {!isBaseline && <p className="mt-2 text-sm text-cyan-50">Becsült éves többletköltség az összehasonlított baseline-hoz képest.</p>}
          </div>
        </div>

        <p className="text-sm text-slate-600">
          A számítás 35,3 Ft/kWh kedvezményes lakossági áramárral készült. A tényleges költség függhet a mosógép
          típusától, a dob töltöttségétől, a programtól és az aktuális áramdíjtól.
        </p>
      </div>
    </section>
  );
}

export { ELECTRICITY_PRICE_FT_PER_KWH, estimateEnergyPerWash, calculateCostMetrics };
