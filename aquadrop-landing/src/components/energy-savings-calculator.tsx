'use client';

import { WashingCostCalculator } from '@/components/tools/WashingCostCalculator';

export function EnergySavingsCalculator() {
  return <WashingCostCalculator placement="article" />;
}

export {
  ELECTRICITY_PRICE_FT_PER_KWH,
  estimateEnergyPerWash,
  calculateCostMetrics
} from '@/components/tools/WashingCostCalculator';
