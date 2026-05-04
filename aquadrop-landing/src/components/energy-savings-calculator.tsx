'use client';

import { WashingCostCalculator } from '@/components/tools/WashingCostCalculator';

export function EnergySavingsCalculator() {
  return <WashingCostCalculator placement="article" showShare={false} showEmbed={false} showIntroBadge={true} />;
}

export {
  ELECTRICITY_PRICE_FT_PER_KWH,
  estimateEnergyPerWash,
  calculateCostMetrics
} from '@/components/tools/WashingCostCalculator';
