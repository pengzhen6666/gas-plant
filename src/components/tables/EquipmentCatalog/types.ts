import type { EquipmentType, PresetType } from '../../../types/index';

export type { EquipmentType, PresetType };

export interface FormattedPresets {
  models: { category: string; value: string; id: string }[];
  manufacturers: { value: string; id: string }[];
  dimensions: { value: string; id: string }[];
  burners: { value: string; id: string }[];
}
