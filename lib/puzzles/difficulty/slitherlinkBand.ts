import { bandLerp, weekdayBand } from './weekdayBand';

export type SlitherlinkBandParams = {
  minClues: number;
  inside: { min: number; max: number };
};

/** Per-day SL params: Mon(band0) easier → Sun(band6) harder (D-05..D-08). */
export function slitherlinkParamsForBand(band: number): SlitherlinkBandParams {
  return {
    minClues: bandLerp(band, 28, 12),
    inside: {
      min: bandLerp(band, 34, 10),
      max: bandLerp(band, 46, 24),
    },
  };
}

export function slitherlinkParamsForDate(dateKey: string): SlitherlinkBandParams {
  return slitherlinkParamsForBand(weekdayBand(dateKey));
}
