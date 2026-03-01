export const MAX_IV = 31;
export const MIN_IV = 0;

export const NATURE_BOOST = 1.1;
export const NATURE_PENALTY = 0.9;
export const NATURE_NEUTRAL = 1.0;

// Asymmetric nature penalty: losses on key stats hurt more than gains help.
// A penalty_weight of 1.5 means a 10% nature penalty is treated as a 15% loss
// in quality calculations, while a 10% boost stays at 10%.
export const NATURE_PENALTY_WEIGHT = 1.5;

// EV is 0 for freshly caught wild Pokémon
export const DEFAULT_EV = 0;
