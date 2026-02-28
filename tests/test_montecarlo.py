"""Tests for Monte Carlo simulation."""

import numpy as np
import pytest

from pokeevaluator.core.montecarlo import compute_percentile, simulate_q_distribution
from pokeevaluator.models.pokemon import StatBlock


class TestSimulation:
    def test_deterministic_with_seed(self):
        """Same seed -> same results."""
        weights = StatBlock.uniform(1.0)
        d1 = simulate_q_distribution(weights, n_samples=1000, seed=42)
        d2 = simulate_q_distribution(weights, n_samples=1000, seed=42)
        np.testing.assert_array_equal(d1, d2)

    def test_distribution_sorted(self):
        """Output should be sorted."""
        weights = StatBlock.uniform(1.0)
        dist = simulate_q_distribution(weights, n_samples=5000, seed=123)
        assert np.all(dist[:-1] <= dist[1:])

    def test_distribution_bounds(self):
        """All Q values should be in [0, 1]."""
        weights = StatBlock.uniform(1.0)
        dist = simulate_q_distribution(weights, n_samples=5000, seed=123)
        assert np.all(dist >= 0.0)
        assert np.all(dist <= 1.0)

    def test_mean_near_half(self):
        """With uniform weights, mean Q should be roughly ~0.45 (neutral natures drag it below 0.5)."""
        weights = StatBlock.uniform(1.0)
        dist = simulate_q_distribution(weights, n_samples=100_000, seed=42)
        mean = np.mean(dist)
        # Mean should be between 0.35 and 0.55 (generous bounds)
        assert 0.35 < mean < 0.55

    def test_different_seeds_differ(self):
        """Different seeds should produce different results."""
        weights = StatBlock.uniform(1.0)
        d1 = simulate_q_distribution(weights, n_samples=1000, seed=1)
        d2 = simulate_q_distribution(weights, n_samples=1000, seed=2)
        assert not np.array_equal(d1, d2)


class TestPercentile:
    def test_zero_percentile(self):
        """Value below all samples -> 0 percentile."""
        dist = np.array([0.1, 0.2, 0.3, 0.4, 0.5])
        assert compute_percentile(0.0, dist) == pytest.approx(0.0)

    def test_max_percentile(self):
        """Value above all samples -> 100 percentile."""
        dist = np.array([0.1, 0.2, 0.3, 0.4, 0.5])
        assert compute_percentile(1.0, dist) == pytest.approx(100.0)

    def test_median_percentile(self):
        """Median value -> ~50 percentile."""
        dist = np.linspace(0, 1, 1001)
        pct = compute_percentile(0.5, dist)
        assert 49.0 < pct < 51.0

    def test_monotonic(self):
        """Higher Q -> higher percentile."""
        weights = StatBlock.uniform(1.0)
        dist = simulate_q_distribution(weights, n_samples=10_000, seed=42)
        p1 = compute_percentile(0.3, dist)
        p2 = compute_percentile(0.6, dist)
        assert p2 > p1
