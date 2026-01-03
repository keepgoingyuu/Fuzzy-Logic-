"""
Quick test script for fuzzy logic engine
"""
from src.fuzzy import create_washing_machine_engine

def test_fuzzy_engine():
    """Test the fuzzy logic engine with example inputs."""
    print("🧪 Testing Fuzzy Logic Engine")
    print("=" * 50)

    # Create engine
    engine = create_washing_machine_engine()

    # Test cases
    test_cases = [
        {"dirt": 50, "grease": 30, "description": "輕度髒污"},
        {"dirt": 120, "grease": 140, "description": "中度髒污"},
        {"dirt": 180, "grease": 180, "description": "重度髒污"},
    ]

    for test in test_cases:
        result = engine.infer({
            "dirt": test["dirt"],
            "grease": test["grease"]
        })

        print(f"\n📊 {test['description']}")
        print(f"   輸入: 污泥={test['dirt']}, 油污={test['grease']}")
        print(f"   輸出: 清洗時間 = {result['output']['wash_time']:.2f} 分鐘")

        # Show activated rules
        print(f"   啟動的規則:")
        for rule_data in result['rule_activations']:
            if rule_data['firing_strength'] > 0:
                print(f"     - {rule_data['rule']}")
                print(f"       觸發強度: {rule_data['firing_strength']:.3f}")

    print("\n" + "=" * 50)
    print("✅ 測試完成！")

if __name__ == "__main__":
    test_fuzzy_engine()
