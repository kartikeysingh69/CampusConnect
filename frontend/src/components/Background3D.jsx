// src/components/Background3D.jsx
// Interactive 3D Canvas Background with depth, rotating geometric wireframes & floating particle constellation
import { useEffect, useRef } from 'react';

export default function Background3D() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse coordinates for 3D parallax tilt
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e) => {
      mouse.targetX = (e.clientX - width / 2) * 0.001;
      mouse.targetY = (e.clientY - height / 2) * 0.001;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 3D Particles
    const PARTICLE_COUNT = 70;
    const particles = [];
    const FOV = 400; // 3D Field of view

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 1.5,
        y: (Math.random() - 0.5) * height * 1.5,
        z: Math.random() * 800 + 100,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        color: i % 3 === 0 ? 'rgba(234, 88, 12, 0.22)' : i % 3 === 1 ? 'rgba(249, 115, 22, 0.18)' : 'rgba(245, 158, 11, 0.18)',
      });
    }

    // Floating 3D Geometric Objects (Wireframe Cubes & Octahedrons in warm delicate wireframe)
    const shapes = [
      {
        type: 'cube',
        size: 90,
        x: -width * 0.25,
        y: -height * 0.18,
        z: 350,
        rx: 0,
        ry: 0,
        rz: 0,
        drx: 0.006,
        dry: 0.008,
        drz: 0.004,
        color: 'rgba(234, 88, 12, 0.14)',
      },
      {
        type: 'octahedron',
        size: 110,
        x: width * 0.32,
        y: height * 0.12,
        z: 400,
        rx: 0,
        ry: 0,
        rz: 0,
        drx: -0.007,
        dry: 0.005,
        drz: 0.006,
        color: 'rgba(245, 158, 11, 0.14)',
      },
      {
        type: 'cube',
        size: 75,
        x: width * 0.15,
        y: -height * 0.25,
        z: 480,
        rx: 0,
        ry: 0,
        rz: 0,
        drx: 0.008,
        dry: -0.006,
        drz: 0.005,
        color: 'rgba(234, 88, 12, 0.12)',
      },
    ];

    // Helper: 3D projection onto 2D canvas
    const project = (x, y, z) => {
      const scale = FOV / (FOV + z);
      return {
        x: x * scale + width / 2,
        y: y * scale + height / 2,
        scale,
      };
    };

    // Helper: 3D point rotation
    const rotateX = (p, angle) => ({
      x: p.x,
      y: p.y * Math.cos(angle) - p.z * Math.sin(angle),
      z: p.y * Math.sin(angle) + p.z * Math.cos(angle),
    });

    const rotateY = (p, angle) => ({
      x: p.x * Math.cos(angle) + p.z * Math.sin(angle),
      y: p.y,
      z: -p.x * Math.sin(angle) + p.z * Math.cos(angle),
    });

    const rotateZ = (p, angle) => ({
      x: p.x * Math.cos(angle) - p.y * Math.sin(angle),
      y: p.x * Math.sin(angle) + p.y * Math.cos(angle),
      z: p.z,
    });

    // 3D Cube Vertices & Edges
    const cubeVertices = [
      { x: -1, y: -1, z: -1 },
      { x: 1, y: -1, z: -1 },
      { x: 1, y: 1, z: -1 },
      { x: -1, y: 1, z: -1 },
      { x: -1, y: -1, z: 1 },
      { x: 1, y: -1, z: 1 },
      { x: 1, y: 1, z: 1 },
      { x: -1, y: 1, z: 1 },
    ];
    const cubeEdges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7],
    ];

    // 3D Octahedron Vertices & Edges
    const octaVertices = [
      { x: 0, y: -1.4, z: 0 },
      { x: 0, y: 1.4, z: 0 },
      { x: -1, y: 0, z: -1 },
      { x: 1, y: 0, z: -1 },
      { x: 1, y: 0, z: 1 },
      { x: -1, y: 0, z: 1 },
    ];
    const octaEdges = [
      [0, 2], [0, 3], [0, 4], [0, 5],
      [1, 2], [1, 3], [1, 4], [1, 5],
      [2, 3], [3, 4], [4, 5], [5, 2],
    ];

    // Render loop
    const render = () => {
      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Clean modern light slate / off-white gradient background (matching profile page)
      const bgGradient = ctx.createLinearGradient(0, 0, width, height);
      bgGradient.addColorStop(0, '#f8fafc');
      bgGradient.addColorStop(0.5, '#f1f5f9');
      bgGradient.addColorStop(1, '#f8fafc');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Radial subtle ambient warm glow under cursor
      const radialGlow = ctx.createRadialGradient(
        width / 2 + mouse.x * 200,
        height / 2 + mouse.y * 200,
        40,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.75
      );
      radialGlow.addColorStop(0, 'rgba(249, 115, 22, 0.04)');
      radialGlow.addColorStop(0.5, 'rgba(254, 215, 170, 0.025)');
      radialGlow.addColorStop(1, 'rgba(248, 250, 252, 0)');
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, width, height);

      // 1. Draw 3D Geometric Shapes
      shapes.forEach((shape) => {
        shape.rx += shape.drx;
        shape.ry += shape.dry;
        shape.rz += shape.drz;

        const vertices = shape.type === 'cube' ? cubeVertices : octaVertices;
        const edges = shape.type === 'cube' ? cubeEdges : octaEdges;

        // Transform vertices
        const projectedPoints = vertices.map((v) => {
          let p = {
            x: v.x * shape.size,
            y: v.y * shape.size,
            z: v.z * shape.size,
          };
          p = rotateX(p, shape.rx + mouse.y);
          p = rotateY(p, shape.ry + mouse.x);
          p = rotateZ(p, shape.rz);

          // Add world translation
          return project(p.x + shape.x, p.y + shape.y, p.z + shape.z);
        });

        // Draw edges
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = 1.6;
        edges.forEach(([i, j]) => {
          const p1 = projectedPoints[i];
          const p2 = projectedPoints[j];
          if (p1 && p2) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });

        // Draw node points
        projectedPoints.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.4 * p.scale, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(225, 29, 72, 0.22)';
          ctx.fill();
        });
      });

      // 2. Update & Draw 3D Constellation Particles
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // Boundaries wrap
        if (p.x < -width) p.x = width;
        if (p.x > width) p.x = -width;
        if (p.y < -height) p.y = height;
        if (p.y > height) p.y = -height;
        if (p.z < 50) p.z = 800;
        if (p.z > 800) p.z = 50;

        // Apply mouse tilt
        let tilted = rotateX(p, mouse.y * 0.5);
        tilted = rotateY(tilted, mouse.x * 0.5);

        const proj = project(tilted.x, tilted.y, tilted.z);
        p.proj = proj;

        // Draw particle
        ctx.beginPath();
        const r = Math.max(1, p.radius * proj.scale);
        ctx.arc(proj.x, proj.y, r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.min(1, Math.max(0.2, proj.scale * 1.5));
        ctx.fill();
        ctx.globalAlpha = 1;

        // Connect nearby particles in 3D
        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          if (!p2.proj) continue;
          const dx = p.proj.x - p2.proj.x;
          const dy = p.proj.y - p2.proj.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(p.proj.x, p.proj.y);
            ctx.lineTo(p2.proj.x, p2.proj.y);
            const alpha = (1 - dist / 110) * 0.22;
            ctx.strokeStyle = `rgba(249, 115, 22, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  );
}
