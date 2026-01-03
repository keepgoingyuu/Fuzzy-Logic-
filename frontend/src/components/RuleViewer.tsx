/**
 * Fuzzy rule activation viewer
 */
import { useState } from 'react';
import type { RuleActivation } from '../types';
import SettingsIcon from '@mui/icons-material/Settings';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface RuleViewerProps {
  rules: RuleActivation[];
}

export function RuleViewer({ rules }: RuleViewerProps) {
  const [showInactive, setShowInactive] = useState(false);
  // 解析規則獲取輸入輸出
  const parseRule = (ruleText: string) => {
    const dirtMatch = ruleText.match(/dirt is (\w+)/);
    const greaseMatch = ruleText.match(/grease is (\w+)/);
    const washMatch = ruleText.match(/wash_time is (\w+)/);

    const levelMap: Record<string, string> = {
      // 污泥程度: SD=Small(低), MD=Medium(中), LD=Large(高)
      'SD': '低', 'MD': '中', 'LD': '高',
      // 油污程度: NG=No Grease(低), MG=Medium(中), LG=Large(高)
      'NG': '低', 'MG': '中', 'LG': '高',
      // 清洗時間
      'VS': '極短', 'S': '短', 'M': '中', 'L': '長', 'VL': '極長'
    };

    return {
      dirt: levelMap[dirtMatch?.[1] || ''] || '',
      grease: levelMap[greaseMatch?.[1] || ''] || '',
      wash: levelMap[washMatch?.[1] || ''] || ''
    };
  };

  const getStrengthColor = (strength: number) => {
    if (strength === 0) return '#475569';
    if (strength < 0.3) return '#fbbf24';
    if (strength < 0.6) return '#fb923c';
    if (strength < 0.8) return '#f87171';
    return '#ef4444';
  };

  const getStrengthLabel = (strength: number) => {
    if (strength === 0) return '未觸發';
    if (strength < 0.3) return '弱';
    if (strength < 0.6) return '中弱';
    if (strength < 0.8) return '中強';
    return '強';
  };

  // 分離觸發和未觸發的規則
  const activeRules = rules.filter((rule, index) => ({...rule, index})).map((rule, i) => ({...rule, index: i})).filter(rule => rules[rule.index].firing_strength > 0);
  const inactiveRules = rules.filter((rule, index) => ({...rule, index})).map((rule, i) => ({...rule, index: i})).filter(rule => rules[rule.index].firing_strength === 0);

  const renderRuleCard = (ruleData: RuleActivation, index: number) => {
    const parsed = parseRule(ruleData.rule);
    const strengthColor = getStrengthColor(ruleData.firing_strength);
    const strengthLabel = getStrengthLabel(ruleData.firing_strength);

    return (
      <div
        key={index}
        className={`rule-card ${ruleData.firing_strength > 0 ? 'active' : 'inactive'}`}
        style={{ borderColor: strengthColor }}
      >
        <div className="rule-header">
          <span className="rule-number">規則 {index + 1}</span>
          <div className="rule-strength-badge">
            <span
              className="rule-badge"
              style={{ backgroundColor: strengthColor }}
            >
              {strengthLabel}
            </span>
            <span className="strength-percentage">{(ruleData.firing_strength * 100).toFixed(0)}%</span>
          </div>
        </div>

        <div className="rule-content">
          <div className="rule-if-label">IF</div>
          <div className="rule-condition">
            <div className="condition-item">
              <span className="condition-label">污泥</span>
              <span className="condition-value">{parsed.dirt}</span>
            </div>
            <span className="condition-operator">且</span>
            <div className="condition-item">
              <span className="condition-label">油污</span>
              <span className="condition-value">{parsed.grease}</span>
            </div>
          </div>

          <div className="rule-then-label">THEN</div>

          <div className="rule-result">
            <span className="result-label">清洗</span>
            <span className="result-value">{parsed.wash}</span>
          </div>
        </div>

        <div className="rule-strength-display">
          <div className="strength-bar-bg">
            <div
              className="strength-bar-fill"
              style={{
                width: `${ruleData.firing_strength * 100}%`,
                backgroundColor: strengthColor
              }}
            />
          </div>
          <span className="strength-number">{ruleData.firing_strength.toFixed(3)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="rule-viewer">
      <h2>
        <SettingsIcon sx={{ fontSize: 28, marginRight: 1, verticalAlign: 'middle' }} />
        規則觸發狀態
      </h2>

      {/* 已觸發規則區 */}
      <div className="rule-section active-section">
        <div className="section-header">
          <h3>✅ 已觸發規則 ({activeRules.length}/{rules.length})</h3>
        </div>
        {activeRules.length > 0 ? (
          <div className="rules-grid">
            {activeRules.map((ruleWrapper) => renderRuleCard(rules[ruleWrapper.index], ruleWrapper.index))}
          </div>
        ) : (
          <p className="no-rules-message">目前沒有觸發任何規則</p>
        )}
      </div>

      {/* 未觸發規則區 */}
      <div className="rule-section inactive-section">
        <div
          className="section-header collapsible"
          onClick={() => setShowInactive(!showInactive)}
        >
          <h3>⚪ 未觸發規則 ({inactiveRules.length})</h3>
          {showInactive ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </div>
        {showInactive && inactiveRules.length > 0 && (
          <div className="rules-grid collapsed">
            {inactiveRules.map((ruleWrapper) => renderRuleCard(rules[ruleWrapper.index], ruleWrapper.index))}
          </div>
        )}
      </div>

      <div className="legend">
        <h4>觸發強度說明</h4>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#ef4444' }}></span>
            <span>強 (0.8-1.0)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#f87171' }}></span>
            <span>中強 (0.6-0.8)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#fb923c' }}></span>
            <span>中弱 (0.3-0.6)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#fbbf24' }}></span>
            <span>弱 (0-0.3)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#475569' }}></span>
            <span>未觸發 (0)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
