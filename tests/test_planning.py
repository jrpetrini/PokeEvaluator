"""Tests for catch planning formulas."""

import math

import pytest

from pokeevaluator.core.planning import (
    catches_for_confidence,
    expected_catches,
    p_at_least_one,
)


class TestPAtLeastOne:
    def test_certain(self):
        """p=1 -> always succeed."""
        assert p_at_least_one(1.0, 1) == 1.0

    def test_impossible(self):
        """p=0 -> never succeed."""
        assert p_at_least_one(0.0, 100) == 0.0

    def test_one_trial(self):
        """n=1 -> P = p."""
        assert p_at_least_one(0.3, 1) == pytest.approx(0.3)

    def test_coin_flip_10(self):
        """10 coin flips -> P(>=1 heads) = 1 - 0.5^10."""
        expected = 1.0 - 0.5**10
        assert p_at_least_one(0.5, 10) == pytest.approx(expected)

    def test_monotonic_in_n(self):
        """More trials -> higher probability."""
        p = 0.1
        probs = [p_at_least_one(p, n) for n in range(1, 20)]
        for a, b in zip(probs, probs[1:]):
            assert b >= a


class TestExpectedCatches:
    def test_certain(self):
        assert expected_catches(1.0) == 1.0

    def test_half(self):
        assert expected_catches(0.5) == 2.0

    def test_ten_percent(self):
        assert expected_catches(0.1) == pytest.approx(10.0)

    def test_impossible(self):
        assert expected_catches(0.0) == float("inf")


class TestCatchesForConfidence:
    def test_90_percent_coin(self):
        """p=0.5, confidence=0.9 -> ceil(log(0.1)/log(0.5)) = 4."""
        n = catches_for_confidence(0.5, 0.9)
        assert n == math.ceil(math.log(0.1) / math.log(0.5))

    def test_95_percent_10pct(self):
        """p=0.1, confidence=0.95 -> ceil(log(0.05)/log(0.9)) = 29."""
        n = catches_for_confidence(0.1, 0.95)
        assert n == 29

    def test_certain_single(self):
        """p=1 -> always 1 catch."""
        assert catches_for_confidence(1.0, 0.99) == 1

    def test_impossible(self):
        """p=0 -> impossible."""
        assert catches_for_confidence(0.0, 0.9) == -1

    def test_result_achieves_confidence(self):
        """Verify: n catches with p should give >= confidence."""
        p = 0.15
        conf = 0.95
        n = catches_for_confidence(p, conf)
        actual = p_at_least_one(p, n)
        assert actual >= conf
