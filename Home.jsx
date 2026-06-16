// src/components/Home.jsx
import { useMemo } from 'react';
import '../styles/home.css';

const PARTICLE_COUNT = 45;
const CONNECTION_DISTANCE = 160; // in the 1000x600 viewBox coordinate space

// Lightweight seeded PRNG so the background layout is stable for the life
// of the component — no reshuffling particles on every re-render.
function createRng(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function generateParticles() {
  const rng = createRng(7919);
  const particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      id: i,
      x: rng() * 1000,
      y: rng() * 600,
      r: 1.2 + rng() * 1.8,
      duration: 6 + rng() * 8,
      delay: rng() * -10,
    });
  }
  return particles;
}

// Connects any two particles close enough together — this is what gives
// the background its "faint neural network" look rather than just floating
// dots. Fainter lines for farther-apart pairs.
function generateConnections(particles) {
  const lines = [];
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i];
      const b = particles[j];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (dist < CONNECTION_DISTANCE) {
        lines.push({
          id: `${a.id}-${b.id}`,
          x1: a.x,
          y1: a.y,
          x2: b.x,
          y2: b.y,
          opacity: Math.max(0, 1 - dist / CONNECTION_DISTANCE) * 0.18,
        });
      }
    }
  }
  return lines;
}

function Home({ isExiting, onEnter }) {
  const particles = useMemo(() => generateParticles(), []);
  const connections = useMemo(() => generateConnections(particles), [particles]);

  return (
    <div className={`home ${isExiting ? 'home--exiting' : ''}`}>
      <svg
        className="home__bg"
        viewBox="0 0 1000 600"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {connections.map((line) => (
          <line
            key={line.id}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            className="home__bg-line"
            style={{ opacity: line.opacity }}
          />
        ))}
        {particles.map((p) => (
          <circle
            key={p.id}
            cx={p.x}
            cy={p.y}
            r={p.r}
            className="home__bg-particle"
            style={{
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </svg>

      <div className="home__content">
        <h1 className="home__name">SHAMBHAVI PAHADE</h1>
        <p className="home__tagline">BUILDING INTELLIGENT AND SECURE SYSTEMS</p>
        <button className="home__enter" onClick={onEnter}>
          <span className="home__enter-bracket">[</span>
          <span className="home__enter-label">ENTER NETWORK</span>
          <span className="home__enter-bracket">]</span>
        </button>
      </div>
    </div>
  );
}

export default Home;