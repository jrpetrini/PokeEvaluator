"""Gen III constants."""

MAX_IV = 31
MIN_IV = 0
IV_RANGE = range(MIN_IV, MAX_IV + 1)

NATURE_BOOST = 1.1
NATURE_PENALTY = 0.9
NATURE_NEUTRAL = 1.0

# Asymmetric nature penalty: losses on key stats hurt more than gains help.
# A penalty_weight of 1.5 means a 10% nature penalty is treated as a 15% loss
# in quality calculations, while a 10% boost stays at 10%.
NATURE_PENALTY_WEIGHT = 1.5

# EV is 0 for freshly caught wild Pokémon
DEFAULT_EV = 0
