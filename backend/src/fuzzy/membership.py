"""
Membership function definitions for fuzzy logic controller.
Implements triangular and trapezoidal membership functions.
"""
import numpy as np
from typing import Dict, List, Tuple


class MembershipFunction:
    """Base class for membership functions."""

    def __init__(self, name: str):
        self.name = name

    def membership(self, x: float) -> float:
        """Calculate membership degree for input x."""
        raise NotImplementedError


class TriangularMF(MembershipFunction):
    """Triangular membership function."""

    def __init__(self, name: str, a: float, b: float, c: float):
        """
        Initialize triangular membership function.

        Args:
            name: Name of the fuzzy set
            a: Left point
            b: Peak point
            c: Right point
        """
        super().__init__(name)
        self.a = a
        self.b = b
        self.c = c

    def membership(self, x: float) -> float:
        """Calculate membership degree using triangular function."""
        if x <= self.a or x >= self.c:
            return 0.0
        elif self.a < x <= self.b:
            return (x - self.a) / (self.b - self.a)
        else:  # self.b < x < self.c
            return (self.c - x) / (self.c - self.b)

    def to_dict(self) -> Dict:
        """Export membership function parameters."""
        return {
            "type": "triangular",
            "name": self.name,
            "params": {"a": self.a, "b": self.b, "c": self.c}
        }


class TrapezoidalMF(MembershipFunction):
    """Trapezoidal membership function."""

    def __init__(self, name: str, a: float, b: float, c: float, d: float):
        """
        Initialize trapezoidal membership function.

        Args:
            name: Name of the fuzzy set
            a: Left bottom point
            b: Left top point
            c: Right top point
            d: Right bottom point
        """
        super().__init__(name)
        self.a = a
        self.b = b
        self.c = c
        self.d = d

    def membership(self, x: float) -> float:
        """Calculate membership degree using trapezoidal function."""
        if x <= self.a or x >= self.d:
            return 0.0
        elif self.a < x <= self.b:
            return (x - self.a) / (self.b - self.a)
        elif self.b < x <= self.c:
            return 1.0
        else:  # self.c < x < self.d
            return (self.d - x) / (self.d - self.c)

    def to_dict(self) -> Dict:
        """Export membership function parameters."""
        return {
            "type": "trapezoidal",
            "name": self.name,
            "params": {"a": self.a, "b": self.b, "c": self.c, "d": self.d}
        }


class FuzzyVariable:
    """Fuzzy variable with multiple membership functions."""

    def __init__(self, name: str, range_min: float, range_max: float):
        """
        Initialize fuzzy variable.

        Args:
            name: Variable name
            range_min: Minimum value of the variable
            range_max: Maximum value of the variable
        """
        self.name = name
        self.range_min = range_min
        self.range_max = range_max
        self.membership_functions: Dict[str, MembershipFunction] = {}

    def add_mf(self, mf: MembershipFunction):
        """Add a membership function to this variable."""
        self.membership_functions[mf.name] = mf

    def fuzzify(self, x: float) -> Dict[str, float]:
        """
        Fuzzify a crisp input value.

        Args:
            x: Crisp input value

        Returns:
            Dictionary of membership degrees for each fuzzy set
        """
        return {
            name: mf.membership(x)
            for name, mf in self.membership_functions.items()
        }

    def get_mf_values(self, x_values: np.ndarray) -> Dict[str, np.ndarray]:
        """
        Get membership function values for plotting.

        Args:
            x_values: Array of x values

        Returns:
            Dictionary of membership values for each fuzzy set
        """
        return {
            name: np.array([mf.membership(x) for x in x_values])
            for name, mf in self.membership_functions.items()
        }

    def to_dict(self) -> Dict:
        """Export variable definition."""
        return {
            "name": self.name,
            "range": [self.range_min, self.range_max],
            "membership_functions": [
                mf.to_dict() for mf in self.membership_functions.values()
            ]
        }


def create_washing_machine_variables() -> Tuple[FuzzyVariable, FuzzyVariable, FuzzyVariable]:
    """
    Create fuzzy variables for washing machine control.
    Based on Chapter 9 教材.

    Returns:
        Tuple of (dirt, grease, wash_time) fuzzy variables
    """
    # Input 1: Dirt level (污泥程度) - 0 to 200
    # 教材定義: SD=Small Dirty(污泥少), MD=Medium Dirty(中等污泥), LD=Large Dirty(多污泥)
    dirt = FuzzyVariable("dirt", 0, 200)
    dirt.add_mf(TriangularMF("SD", 0, 0, 100))      # Small Dirty (污泥少/低污泥)
    dirt.add_mf(TriangularMF("MD", 0, 100, 200))    # Medium Dirty (中等污泥)
    dirt.add_mf(TriangularMF("LD", 100, 200, 200))  # Large Dirty (多污泥/高污泥)

    # Input 2: Grease level (油污程度) - 0 to 200
    # 教材定義: NG=No Grease(無油污), MG=Medium Grease(中等油污), LG=Large Grease(多油污)
    grease = FuzzyVariable("grease", 0, 200)
    grease.add_mf(TriangularMF("NG", 0, 0, 100))     # No Grease (無油污/低油污)
    grease.add_mf(TriangularMF("MG", 0, 100, 200))   # Medium Grease (中等油污)
    grease.add_mf(TriangularMF("LG", 100, 200, 200)) # Large Grease (多油污/高油污)

    # Output: Wash time (清洗時間) - 0 to 60 minutes
    wash_time = FuzzyVariable("wash_time", 0, 60)
    wash_time.add_mf(TriangularMF("VS", 0, 0, 10))    # Very Short
    wash_time.add_mf(TriangularMF("S", 0, 10, 25))    # Short
    wash_time.add_mf(TriangularMF("M", 10, 25, 40))   # Medium
    wash_time.add_mf(TriangularMF("L", 25, 40, 60))   # Long
    wash_time.add_mf(TriangularMF("VL", 40, 60, 60))  # Very Long

    return dirt, grease, wash_time
