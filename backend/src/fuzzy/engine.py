"""
Fuzzy inference engine implementing Mamdani method with Max-Min composition.
Based on Chapter 9 教材 - 模糊控制理論及其應用.
"""
import numpy as np
from typing import Dict, List, Tuple
from .membership import FuzzyVariable


class FuzzyRule:
    """Fuzzy IF-THEN rule."""

    def __init__(self, antecedents: Dict[str, str], consequent: Tuple[str, str]):
        """
        Initialize fuzzy rule.

        Args:
            antecedents: Dictionary of {variable_name: fuzzy_set_name}
            consequent: Tuple of (variable_name, fuzzy_set_name)
        """
        self.antecedents = antecedents
        self.consequent = consequent

    def __repr__(self):
        ant_str = " AND ".join([f"{var} is {fs}" for var, fs in self.antecedents.items()])
        return f"IF {ant_str} THEN {self.consequent[0]} is {self.consequent[1]}"


class MamdaniEngine:
    """
    Mamdani fuzzy inference engine.

    Implements:
    1. Fuzzification
    2. Rule evaluation (Max-Min composition)
    3. Aggregation
    4. Defuzzification (Center of Gravity method)
    """

    def __init__(self):
        self.input_variables: Dict[str, FuzzyVariable] = {}
        self.output_variables: Dict[str, FuzzyVariable] = {}
        self.rules: List[FuzzyRule] = []

    def add_input_variable(self, variable: FuzzyVariable):
        """Add an input fuzzy variable."""
        self.input_variables[variable.name] = variable

    def add_output_variable(self, variable: FuzzyVariable):
        """Add an output fuzzy variable."""
        self.output_variables[variable.name] = variable

    def add_rule(self, rule: FuzzyRule):
        """Add a fuzzy rule."""
        self.rules.append(rule)

    def infer(self, inputs: Dict[str, float]) -> Dict[str, any]:
        """
        Perform fuzzy inference.

        Args:
            inputs: Dictionary of {input_variable_name: crisp_value}

        Returns:
            Dictionary containing:
                - output: Defuzzified crisp output value
                - fuzzified_inputs: Membership degrees for inputs
                - rule_activations: Activation level for each rule
                - aggregated_output: Aggregated fuzzy output before defuzzification
        """
        # Step 1: Fuzzification
        fuzzified_inputs = {}
        for var_name, value in inputs.items():
            if var_name in self.input_variables:
                fuzzified_inputs[var_name] = self.input_variables[var_name].fuzzify(value)

        # Step 2: Rule evaluation (Max-Min composition)
        rule_activations = []
        output_memberships = {}

        for rule in self.rules:
            # Calculate rule firing strength using MIN operator
            firing_strength = 1.0
            for var_name, fuzzy_set in rule.antecedents.items():
                if var_name in fuzzified_inputs:
                    firing_strength = min(
                        firing_strength,
                        fuzzified_inputs[var_name].get(fuzzy_set, 0.0)
                    )

            rule_activations.append({
                "rule": str(rule),
                "firing_strength": firing_strength,
                "consequent": rule.consequent
            })

            # Collect output membership degrees
            output_var, output_set = rule.consequent
            if output_var not in output_memberships:
                output_memberships[output_var] = {}
            if output_set not in output_memberships[output_var]:
                output_memberships[output_var][output_set] = []

            output_memberships[output_var][output_set].append(firing_strength)

        # Step 3: Aggregation using MAX operator
        aggregated = {}
        for var_name, sets in output_memberships.items():
            aggregated[var_name] = {
                fuzzy_set: max(strengths)
                for fuzzy_set, strengths in sets.items()
            }

        # Step 4: Defuzzification (Center of Gravity method)
        defuzzified_outputs = {}
        for var_name, fuzzy_sets in aggregated.items():
            if var_name in self.output_variables:
                output_var = self.output_variables[var_name]
                crisp_value = self._defuzzify_cog(output_var, fuzzy_sets)
                defuzzified_outputs[var_name] = crisp_value

        return {
            "output": defuzzified_outputs,
            "fuzzified_inputs": fuzzified_inputs,
            "rule_activations": rule_activations,
            "aggregated_output": aggregated
        }

    def _defuzzify_cog(self, variable: FuzzyVariable, fuzzy_sets: Dict[str, float]) -> float:
        """
        Defuzzification using Center of Gravity (COG) method.

        Formula: y⁰ = ∫μ(y)·y dy / ∫μ(y) dy

        Args:
            variable: Output fuzzy variable
            fuzzy_sets: Dictionary of {fuzzy_set_name: activation_level}

        Returns:
            Crisp output value
        """
        # Create discretized universe of discourse
        y_values = np.linspace(variable.range_min, variable.range_max, 200)

        # Calculate aggregated membership function
        aggregated_membership = np.zeros_like(y_values)

        for fuzzy_set_name, activation in fuzzy_sets.items():
            if fuzzy_set_name in variable.membership_functions:
                mf = variable.membership_functions[fuzzy_set_name]
                # Apply truncation (MIN with activation level)
                for i, y in enumerate(y_values):
                    membership = mf.membership(y)
                    aggregated_membership[i] = max(
                        aggregated_membership[i],
                        min(membership, activation)
                    )

        # Calculate center of gravity
        numerator = np.sum(aggregated_membership * y_values)
        denominator = np.sum(aggregated_membership)

        if denominator == 0:
            # No rules fired, return middle of range
            return (variable.range_min + variable.range_max) / 2

        return numerator / denominator

    def get_aggregated_output_curve(
        self,
        output_var_name: str,
        fuzzy_sets: Dict[str, float],
        num_points: int = 200
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Get the aggregated output membership function for visualization.

        Args:
            output_var_name: Name of output variable
            fuzzy_sets: Dictionary of {fuzzy_set_name: activation_level}
            num_points: Number of discretization points

        Returns:
            Tuple of (x_values, y_values) for plotting
        """
        if output_var_name not in self.output_variables:
            return np.array([]), np.array([])

        variable = self.output_variables[output_var_name]
        x_values = np.linspace(variable.range_min, variable.range_max, num_points)
        y_values = np.zeros_like(x_values)

        for fuzzy_set_name, activation in fuzzy_sets.items():
            if fuzzy_set_name in variable.membership_functions:
                mf = variable.membership_functions[fuzzy_set_name]
                for i, x in enumerate(x_values):
                    membership = mf.membership(x)
                    y_values[i] = max(
                        y_values[i],
                        min(membership, activation)
                    )

        return x_values, y_values


def create_washing_machine_engine():
    """
    Create a complete washing machine fuzzy controller.

    Rules based on Chapter 9.2.1 教材:
    IF dirt is SD AND grease is NG THEN wash_time is VS
    IF dirt is SD AND grease is MG THEN wash_time is S
    IF dirt is SD AND grease is LG THEN wash_time is M
    ... (complete rule table)

    Returns:
        Configured MamdaniEngine instance
    """
    from .membership import create_washing_machine_variables

    # Create fuzzy variables
    dirt, grease, wash_time = create_washing_machine_variables()

    # Create engine
    engine = MamdaniEngine()
    engine.add_input_variable(dirt)
    engine.add_input_variable(grease)
    engine.add_output_variable(wash_time)

    # Define rule base (按照教材 Chapter 9 規則表)
    # 規則表:
    #           NG(低油污)  MG(中油污)  LG(高油污)
    # SD(低污泥)    VS         M          L
    # MD(中污泥)    S          M          L
    # LD(高污泥)    M          L          VL
    rule_table = [
        # dirt: SD (Small Dirty - 低污泥)
        ({"dirt": "SD", "grease": "NG"}, ("wash_time", "VS")),  # 低污泥+低油污 → 極短
        ({"dirt": "SD", "grease": "MG"}, ("wash_time", "M")),   # 低污泥+中油污 → 中
        ({"dirt": "SD", "grease": "LG"}, ("wash_time", "L")),   # 低污泥+高油污 → 長
        # dirt: MD (Medium Dirty - 中污泥)
        ({"dirt": "MD", "grease": "NG"}, ("wash_time", "S")),   # 中污泥+低油污 → 短
        ({"dirt": "MD", "grease": "MG"}, ("wash_time", "M")),   # 中污泥+中油污 → 中
        ({"dirt": "MD", "grease": "LG"}, ("wash_time", "L")),   # 中污泥+高油污 → 長
        # dirt: LD (Large Dirty - 高污泥)
        ({"dirt": "LD", "grease": "NG"}, ("wash_time", "M")),   # 高污泥+低油污 → 中
        ({"dirt": "LD", "grease": "MG"}, ("wash_time", "L")),   # 高污泥+中油污 → 長
        ({"dirt": "LD", "grease": "LG"}, ("wash_time", "VL")),  # 高污泥+高油污 → 極長
    ]

    for antecedents, consequent in rule_table:
        engine.add_rule(FuzzyRule(antecedents, consequent))

    return engine
