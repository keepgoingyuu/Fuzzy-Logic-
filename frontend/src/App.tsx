/**
 * Main application component for Fuzzy Logic Demo
 */
import { useState, useCallback } from 'react';
import { InputControls } from './components/InputControls';
import { MembershipChart } from './components/MembershipChart';
import { RuleViewer } from './components/RuleViewer';
import { OutputChart } from './components/OutputChart';
import { fuzzyAPI } from './api';
import type { VisualizationData } from './types';
import PsychologyIcon from '@mui/icons-material/Psychology';
import WarningIcon from '@mui/icons-material/Warning';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import WavingHandIcon from '@mui/icons-material/WavingHand';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SchoolIcon from '@mui/icons-material/School';
import './App.css';

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vizData, setVizData] = useState<VisualizationData | null>(null);
  const [currentInputs, setCurrentInputs] = useState({ dirt: 120, grease: 140 });

  const handleInputChange = useCallback(async (dirt: number, grease: number) => {
    setCurrentInputs({ dirt, grease });
    setLoading(true);
    setError(null);

    try {
      const data = await fuzzyAPI.getVisualization(dirt, grease);
      setVizData(data);
    } catch (err: any) {
      setError(err.message || '無法連接到後端 API');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <div className="header-main">
            <h1>
              <PsychologyIcon sx={{ fontSize: 40, marginRight: 1, verticalAlign: 'middle' }} />
              模糊邏輯控制器教學系統
            </h1>
            <p className="subtitle">Fuzzy Logic Controller Educational Demo</p>
          </div>
          <div className="header-badges">
            <div className="badge badge-primary">
              <span className="badge-label">應用案例</span>
              <span className="badge-value">洗衣機控制</span>
            </div>
            <div className="badge badge-secondary">
              <span className="badge-label">推論方法</span>
              <span className="badge-value">Mamdani</span>
            </div>
            <div className="badge badge-tertiary">
              <span className="badge-label">合成方式</span>
              <span className="badge-value">Max-Min</span>
            </div>
          </div>
        </div>
      </header>

      <main className="app-main">
        {error && (
          <div className="error-banner">
            <WarningIcon sx={{ fontSize: 20, marginRight: 0.5, verticalAlign: 'middle' }} />
            錯誤: {error}
            <br />
            <small>請確認後端服務已啟動 (port {import.meta.env.VITE_API_URL?.split(':')[2] || '8200'})</small>
          </div>
        )}

        <div className="layout">
          <aside className="sidebar">
            <InputControls
              onInputChange={handleInputChange}
              initialDirt={120}
              initialGrease={140}
            />
          </aside>

          <section className="content">
            {loading && (
              <div className="loading-overlay">
                <div className="spinner"></div>
                <p>計算中...</p>
              </div>
            )}

            {!vizData && !loading && !error && (
              <div className="welcome-message">
                <h2>
                  <TouchAppIcon sx={{ fontSize: 32, marginRight: 1, verticalAlign: 'middle' }} />
                  請調整左側滑桿開始
                </h2>
                <p>拖動污泥程度和油污程度滑桿，即可看到模糊推論結果</p>
              </div>
            )}

            {vizData && !loading && (
              <>
                <div className="section">
                  <h2>
                    <TrendingUpIcon sx={{ fontSize: 28, marginRight: 1, verticalAlign: 'middle' }} />
                    輸入歸屬函數
                  </h2>
                  <div className="charts-grid">
                    <MembershipChart
                      title="污泥程度 (Dirt)"
                      xValues={vizData.membership_curves.dirt.x_values}
                      curves={vizData.membership_curves.dirt.curves}
                      currentValue={currentInputs.dirt}
                      unit="污泥程度"
                    />
                    <MembershipChart
                      title="油污程度 (Grease)"
                      xValues={vizData.membership_curves.grease.x_values}
                      curves={vizData.membership_curves.grease.curves}
                      currentValue={currentInputs.grease}
                      unit="油污程度"
                    />
                  </div>
                </div>

                <div className="section">
                  <RuleViewer rules={vizData.inference_result.rule_activations} />
                </div>

                <div className="section">
                  <OutputChart
                    xValues={vizData.aggregated_output.x_values}
                    yValues={vizData.aggregated_output.y_values}
                    centroid={vizData.aggregated_output.centroid}
                  />
                </div>

                <div className="section info-panel">
                  <h3>
                    <SchoolIcon sx={{ fontSize: 24, marginRight: 0.75, verticalAlign: 'middle' }} />
                    推論過程說明
                  </h3>
                  <ol className="process-steps">
                    <li>
                      <strong>模糊化 (Fuzzification)</strong>
                      <p>將污泥程度 {currentInputs.dirt} 和油污程度 {currentInputs.grease} 轉換為模糊值</p>
                    </li>
                    <li>
                      <strong>規則評估 (Rule Evaluation)</strong>
                      <p>使用 MIN 運算計算每條規則的觸發強度</p>
                    </li>
                    <li>
                      <strong>聚合 (Aggregation)</strong>
                      <p>使用 MAX 運算聚合所有規則的輸出</p>
                    </li>
                    <li>
                      <strong>解模糊化 (Defuzzification)</strong>
                      <p>使用重心法計算最終清洗時間: <strong>{vizData.aggregated_output.centroid.toFixed(2)} 分鐘</strong></p>
                    </li>
                  </ol>
                </div>
              </>
            )}

            {!vizData && !loading && !error && (
              <div className="welcome-message">
                <h2>
                  <WavingHandIcon sx={{ fontSize: 32, marginRight: 1, verticalAlign: 'middle' }} />
                  歡迎使用模糊邏輯教學系統
                </h2>
                <p>請調整左側滑桿來觀察模糊推論過程</p>
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="app-footer">
        <div className="footer-copyright">
          © 2026 模糊邏輯控制器教學系統 Fuzzy Logic Educational System
        </div>
      </footer>
    </div>
  );
}

export default App;
