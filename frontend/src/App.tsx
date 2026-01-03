/**
 * Main application component for Fuzzy Logic Demo
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

function App() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vizData, setVizData] = useState<VisualizationData | null>(null);
  const [currentInputs, setCurrentInputs] = useState({ dirt: 120, grease: 140 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  // Particle animation effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to cover entire document with high DPI support
    let logicalWidth = 0;
    let logicalHeight = 0;

    const resizeCanvas = () => {
      const app = canvas.parentElement;
      if (app) {
        const dpr = window.devicePixelRatio || 1;
        logicalWidth = app.scrollWidth;
        logicalHeight = app.scrollHeight;

        // Set actual canvas size (accounting for device pixel ratio)
        canvas.width = logicalWidth * dpr;
        canvas.height = logicalHeight * dpr;

        // Set display size (CSS)
        canvas.style.width = `${logicalWidth}px`;
        canvas.style.height = `${logicalHeight}px`;

        // Scale context to account for device pixel ratio
        ctx.scale(dpr, dpr);
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Resize when content changes
    const resizeObserver = new ResizeObserver(resizeCanvas);
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Also observe document body for content changes (especially on mobile)
    const bodyObserver = new ResizeObserver(resizeCanvas);
    bodyObserver.observe(document.body);

    // Mutation observer for dynamic content changes
    const mutationObserver = new MutationObserver(() => {
      resizeCanvas();
    });
    if (canvas.parentElement) {
      mutationObserver.observe(canvas.parentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    }

    // Mouse position (with scroll offset)
    const mouse = { x: 0, y: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY + window.scrollY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Create particles using logical dimensions
    const particles: Particle[] = [];
    const particleCount = 120;

    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * logicalWidth;
      const y = Math.random() * logicalHeight;
      particles.push({
        x,
        y,
        baseX: x,
        baseY: y,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 2,
        opacity: Math.random() * 0.6 + 0.4
      });
    }

    // Animation loop
    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, logicalWidth, logicalHeight);

      particles.forEach((particle, i) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges
        if (particle.x < 0 || particle.x > logicalWidth) particle.vx *= -1;
        if (particle.y < 0 || particle.y > logicalHeight) particle.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100, 116, 139, ${particle.opacity})`;
        ctx.fill();

        // Draw connections to other particles
        particles.slice(i + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            const opacity = 0.5 * (1 - distance / 150);
            ctx.strokeStyle = `rgba(100, 116, 139, ${opacity})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        });

        // Draw connection to mouse
        const dx = mouse.x - particle.x;
        const dy = mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 200) {
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(mouse.x, mouse.y);
          const opacity = 0.6 * (1 - distance / 200);
          ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`;
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }
      });

      // Draw mouse node
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(59, 130, 246, 0.9)';
      ctx.fill();

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      bodyObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return (
    <div className="App">
      <canvas ref={canvasRef} className="particle-canvas" />
      <header className="app-header">
        <div className="header-content">
          <div className="header-main">
            <h1 onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
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
