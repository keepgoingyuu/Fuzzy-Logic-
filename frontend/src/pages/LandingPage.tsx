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
  baseX: number;
  baseY: number;
}

export function LandingPage() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
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

    // Create particles
    const particles: Particle[] = [];
    const particleCount = 80;

    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      particles.push({
        x,
        y,
        baseX: x,
        baseY: y,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2
      });
    }

    // Animation loop
    let animationId: number;
    const animate = () => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, i) => {
        // Update base position
        particle.baseX += particle.vx;
        particle.baseY += particle.vy;

        // Bounce off edges
        if (particle.baseX < 0 || particle.baseX > canvas.width) particle.vx *= -1;
        if (particle.baseY < 0 || particle.baseY > canvas.height) particle.vy *= -1;

        // Mouse interaction - particles move away from mouse
        const dx = mouse.x - particle.baseX;
        const dy = mouse.y - particle.baseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 150;

        if (distance < maxDistance) {
          const force = (maxDistance - distance) / maxDistance;
          const angle = Math.atan2(dy, dx);
          particle.x = particle.baseX - Math.cos(angle) * force * 50;
          particle.y = particle.baseY - Math.sin(angle) * force * 50;
        } else {
          // Smoothly return to base position
          particle.x += (particle.baseX - particle.x) * 0.05;
          particle.y += (particle.baseY - particle.y) * 0.05;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(96, 165, 250, ${particle.opacity})`;
        ctx.fill();

        // Draw connections
        particles.slice(i + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.15 * (1 - distance / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

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
