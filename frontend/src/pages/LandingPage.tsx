/**
 * Landing page with particle animation
 */
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import PsychologyIcon from '@mui/icons-material/Psychology';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SchoolIcon from '@mui/icons-material/School';
import ScienceIcon from '@mui/icons-material/Science';
import SpeedIcon from '@mui/icons-material/Speed';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import './LandingPage.css';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

export function LandingPage() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size with high DPI support
    let logicalWidth = 0;
    let logicalHeight = 0;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      logicalWidth = window.innerWidth;
      logicalHeight = window.innerHeight;

      // Set actual canvas size (accounting for device pixel ratio)
      canvas.width = logicalWidth * dpr;
      canvas.height = logicalHeight * dpr;

      // Set display size (CSS)
      canvas.style.width = `${logicalWidth}px`;
      canvas.style.height = `${logicalHeight}px`;

      // Scale context to account for device pixel ratio
      ctx.scale(dpr, dpr);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Mouse position
    const mouse = { x: 0, y: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
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
    };
  }, []);

  return (
    <div className="landing-page">
      <canvas ref={canvasRef} className="particle-canvas" />

      <div className="landing-content">
        <div className="hero-section">
          <div className="hero-icon">
            <PsychologyIcon sx={{ fontSize: 80 }} />
          </div>
          <h1 className="hero-title">模糊邏輯控制器</h1>
          <h2 className="hero-subtitle">Fuzzy Logic Controller Educational System</h2>
          <p className="hero-description">
            探索模糊邏輯的奧秘，理解 Mamdani 推論法的實際應用
          </p>

          <button className="cta-button" onClick={() => navigate('/demo')}>
            <RocketLaunchIcon sx={{ fontSize: 24, marginRight: 1 }} />
            開始探索
          </button>
        </div>

        <div className="features-section">
          <div className="feature-card">
            <SchoolIcon sx={{ fontSize: 40, color: '#60a5fa' }} />
            <h3>教學導向</h3>
            <p>基於 Chapter 9 模糊控制理論教材，完整呈現推論過程</p>
          </div>

          <div className="feature-card">
            <ScienceIcon sx={{ fontSize: 40, color: '#10b981' }} />
            <h3>即時互動</h3>
            <p>調整輸入參數，即時觀察模糊推論的每個階段變化</p>
          </div>

          <div className="feature-card">
            <SpeedIcon sx={{ fontSize: 40, color: '#f59e0b' }} />
            <h3>視覺化呈現</h3>
            <p>歸屬函數、規則觸發、聚合輸出全程圖表化展示</p>
          </div>

          <div className="feature-card">
            <AutoAwesomeIcon sx={{ fontSize: 40, color: '#ec4899' }} />
            <h3>實際案例</h3>
            <p>洗衣機智能控制系統，理論與實踐完美結合</p>
          </div>
        </div>

        <div className="tech-info">
          <div className="tech-badge">React 19</div>
          <div className="tech-badge">TypeScript</div>
          <div className="tech-badge">Python FastAPI</div>
          <div className="tech-badge">Mamdani Method</div>
          <div className="tech-badge">Max-Min Composition</div>
        </div>
      </div>

      <footer className="landing-footer">
        <p>© 2026 模糊邏輯控制器教學系統 | 基於 Chapter 9 - 模糊控制理論及其應用</p>
      </footer>
    </div>
  );
}
