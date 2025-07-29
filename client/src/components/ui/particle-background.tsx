import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  color: string;
  pulse: number;
  trail: { x: number; y: number; opacity: number }[];
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationIdRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const colors = ['#00D4FF', '#667EEA', '#764BA2', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    
    const createParticle = (): Particle => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      radius: Math.random() * 3 + 0.5,
      opacity: Math.random() * 0.8 + 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
      pulse: Math.random() * Math.PI * 2,
      trail: [],
    });

    const initParticles = () => {
      particlesRef.current = [];
      const particleCount = Math.min(120, Math.floor(canvas.width * canvas.height / 8000));
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push(createParticle());
      }
    };

    const updateParticle = (particle: Particle) => {
      // Update trail
      particle.trail.push({ x: particle.x, y: particle.y, opacity: particle.opacity });
      if (particle.trail.length > 15) {
        particle.trail.shift();
      }

      particle.x += particle.vx;
      particle.y += particle.vy;

      // Bounce off edges with some randomness
      if (particle.x < 0 || particle.x > canvas.width) {
        particle.vx *= -0.8;
        particle.vx += (Math.random() - 0.5) * 0.2;
      }
      if (particle.y < 0 || particle.y > canvas.height) {
        particle.vy *= -0.8;
        particle.vy += (Math.random() - 0.5) * 0.2;
      }

      // Enhanced pulsing effect
      particle.pulse += 0.02;
      particle.opacity = 0.3 + Math.sin(particle.pulse) * 0.4 + Math.sin(Date.now() * 0.001 + particle.x * 0.01) * 0.2;
      
      // Slowly change radius for breathing effect
      const baseRadius = 1.5;
      particle.radius = baseRadius + Math.sin(Date.now() * 0.002 + particle.pulse) * 0.5;
    };

    const drawParticle = (particle: Particle) => {
      ctx.save();
      
      // Draw trail
      particle.trail.forEach((point, index) => {
        const trailOpacity = (index / particle.trail.length) * particle.opacity * 0.3;  
        const trailRadius = Math.max(0.5, particle.radius * 0.3);
        ctx.globalAlpha = trailOpacity;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(point.x, point.y, trailRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw main particle with enhanced glow
      ctx.globalAlpha = particle.opacity;
      ctx.fillStyle = particle.color;
      ctx.shadowBlur = 25;
      ctx.shadowColor = particle.color;
      
      // Multiple glow layers for better effect
      const safeRadius = Math.max(1, particle.radius);
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, safeRadius + i, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Bright core
      ctx.globalAlpha = Math.min(1, particle.opacity * 1.5);
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, Math.max(0.5, safeRadius * 0.4), 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    };

    const drawConnections = () => {
      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.save();
            const opacity = ((150 - distance) / 150) * 0.2;
            ctx.globalAlpha = opacity;
            
            // Create gradient line
            const gradient = ctx.createLinearGradient(
              particles[i].x, particles[i].y,
              particles[j].x, particles[j].y
            );
            gradient.addColorStop(0, particles[i].color);
            gradient.addColorStop(1, particles[j].color);
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = Math.max(0.5, (150 - distance) / 150 * 2);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
            
            // Add glow effect to connections
            ctx.shadowBlur = 10;
            ctx.shadowColor = particles[i].color;
            ctx.stroke();
            
            ctx.restore();
          }
        }
      }
    };

    const drawFloatingOrbs = () => {
      const time = Date.now() * 0.001;
      for (let i = 0; i < 8; i++) {
        const x = canvas.width * 0.5 + Math.sin(time * 0.5 + i) * (canvas.width * 0.3);
        const y = canvas.height * 0.5 + Math.cos(time * 0.3 + i) * (canvas.height * 0.2);
        const radius = 40 + Math.sin(time + i) * 20;
        
        ctx.save();
        ctx.globalAlpha = 0.05;
        ctx.fillStyle = `hsl(${200 + i * 20}, 70%, 60%)`;
        ctx.shadowBlur = 40;
        ctx.shadowColor = `hsl(${200 + i * 20}, 70%, 60%)`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };

    const animate = () => {
      // Create a subtle fade effect instead of clearing
      ctx.fillStyle = 'rgba(26, 26, 46, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawFloatingOrbs();
      drawConnections();
      
      particlesRef.current.forEach(particle => {
        updateParticle(particle);
        drawParticle(particle);
      });

      animationIdRef.current = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      resizeCanvas();
      initParticles();
    };

    resizeCanvas();
    initParticles();
    animate();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 -z-10 pointer-events-none"
      style={{ 
        background: 'radial-gradient(ellipse at center, #1A1A2E 0%, #16213E 40%, #0F1419 100%)' 
      }}
    />
  );
}
