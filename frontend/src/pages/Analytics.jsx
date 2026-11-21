// src/pages/Analytics.jsx — Phase 12: Predictive Placement Analytics & Salary Trends
import { useState, useMemo } from 'react';
import {
  FaChartLine,
  FaCalculator,
  FaGraduationCap,
  FaMoneyBillWave,
  FaBrain,
  FaCheckCircle,
  FaExclamationTriangle,
  FaBuilding,
  FaLightbulb,
  FaArrowUp
} from 'react-icons/fa';

export default function Analytics() {
  // Placement Predictor State
  const [cgpa, setCgpa] = useState(8.2);
  const [backlogs, setBacklogs] = useState(0);
  const [domain, setDomain] = useState('fullstack');
  const [internship, setInternship] = useState('yes');
  const [branch, setBranch] = useState('cse');

  // Probability Calculation Engine
  const prediction = useMemo(() => {
    let score = 50; // base

    // CGPA weight (up to +35)
    if (cgpa >= 9.0) score += 35;
    else if (cgpa >= 8.0) score += 28;
    else if (cgpa >= 7.0) score += 18;
    else if (cgpa >= 6.0) score += 8;
    else score -= 10;

    // Backlogs penalty
    if (backlogs === 0) score += 10;
    else if (backlogs === 1) score -= 12;
    else score -= 25;

    // Domain demand
    if (domain === 'fullstack' || domain === 'ai_ml') score += 12;
    else if (domain === 'cloud_devops') score += 10;
    else score += 5;

    // Internship experience
    if (internship === 'yes') score += 10;

    // Branch weighting
    if (branch === 'cse' || branch === 'it') score += 5;

    const clamped = Math.max(15, Math.min(98, score));

    let tier = 'High Probability';
    let color = '#16a34a';
    let advice = 'You are in prime position for Tier-1 product and consulting companies!';

    if (clamped < 60) {
      tier = 'Needs Upskilling';
      color = '#dc2626';
      advice = 'Focus on clearing backlogs and practicing DSA coding problems in our In-Browser Assessment.';
    } else if (clamped < 80) {
      tier = 'Moderate Probability';
      color = '#d97706';
      advice = 'Good standing! Enhance your ATS resume score and attend 2+ mock interviews to cross 85%.';
    }

    return { score: clamped, tier, color, advice };
  }, [cgpa, backlogs, domain, internship, branch]);

  // 5-Year Historical Salary Trends
  const salaryTrends = [
    { year: '2021', avg: 6.4, highest: 24, offers: 340 },
    { year: '2022', avg: 7.8, highest: 33, offers: 420 },
    { year: '2023', avg: 8.9, highest: 42, offers: 510 },
    { year: '2024', avg: 10.2, highest: 50, offers: 640 },
    { year: '2025/26', avg: 11.8, highest: 58, offers: 780 }
  ];

  // Branch statistics
  const branchData = [
    { name: 'Computer Science & Engg (CSE)', placed: 96, avg: '11.8 LPA', topRecruiter: 'Google, Microsoft' },
    { name: 'Information Technology (IT)', placed: 93, avg: '10.5 LPA', topRecruiter: 'Amazon, Adobe' },
    { name: 'Electronics & Comm (ECE)', placed: 86, avg: '8.8 LPA', topRecruiter: 'Qualcomm, Intel' },
    { name: 'Mechanical Engineering (ME)', placed: 77, avg: '7.2 LPA', topRecruiter: 'Tata Motors, L&T' },
    { name: 'Civil Engineering (CE)', placed: 71, avg: '6.5 LPA', topRecruiter: 'L&T, Afcons' }
  ];

  return (
    <div style={{ maxWidth: '1350px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#ffffff',
          padding: '2rem',
          borderRadius: '20px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}
      >
        <div>
          <span
            style={{
              background: 'rgba(234, 88, 12, 0.25)',
              color: '#fb923c',
              border: '1px solid rgba(234, 88, 12, 0.4)',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 800,
              textTransform: 'uppercase'
            }}
          >
            Predictive AI Engine • Phase 12
          </span>
          <h1 style={{ margin: '0.75rem 0 0.5rem', fontSize: '2rem', fontWeight: 800 }}>
            Institutional Placement Analytics & Probability Estimator
          </h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem', maxWidth: '720px' }}>
            Data-backed placement forecasting, historical CTC progression curves, and stream-wise conversion statistics.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '1rem 1.4rem',
              borderRadius: '14px',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#f97316' }}>58 LPA</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Highest CTC</div>
          </div>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '1rem 1.4rem',
              borderRadius: '14px',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#22c55e' }}>89.4%</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Overall Batch Placed</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Predictor on Left, Salary Chart on Right */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(340px, 460px) 1fr',
          gap: '1.5rem',
          alignItems: 'start',
          marginBottom: '2rem'
        }}
      >
        {/* Probability Calculator Card */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '1.6rem',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            border: '1px solid #f1f5f9'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
            <div
              style={{
                background: '#ffedd5',
                color: '#ea580c',
                padding: '10px',
                borderRadius: '12px',
                fontSize: '1.2rem'
              }}
            >
              <FaCalculator />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                Placement Chance Predictor
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                Simulate your selection probability based on academic profile
              </p>
            </div>
          </div>

          {/* Form Inputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                  Current CGPA:
                </label>
                <span style={{ fontWeight: 800, color: '#ea580c', fontSize: '0.95rem' }}>{cgpa}</span>
              </div>
              <input
                type="range"
                min="5.0"
                max="10.0"
                step="0.1"
                value={cgpa}
                onChange={(e) => setCgpa(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#ea580c' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Active Backlogs
                </label>
                <select
                  value={backlogs}
                  onChange={(e) => setBacklogs(parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem'
                  }}
                >
                  <option value={0}>0 Backlogs</option>
                  <option value={1}>1 Backlog</option>
                  <option value={2}>2+ Backlogs</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Branch
                </label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem'
                  }}
                >
                  <option value="cse">CSE</option>
                  <option value="it">IT</option>
                  <option value="ece">ECE</option>
                  <option value="me">Mechanical</option>
                  <option value="ce">Civil</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Primary Technical Focus
              </label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem'
                }}
              >
                <option value="fullstack">Full Stack Web (MERN / React / Node)</option>
                <option value="ai_ml">AI / Machine Learning / Data Science</option>
                <option value="cloud_devops">Cloud & DevOps (AWS / Docker / K8s)</option>
                <option value="core">Core Embedded / VLSI / Hardware</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Completed Industry Internship?
              </label>
              <select
                value={internship}
                onChange={(e) => setInternship(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem'
                }}
              >
                <option value="yes">Yes (Completed 1+ verified internships)</option>
                <option value="no">No industry internship yet</option>
              </select>
            </div>
          </div>

          {/* Result Gauge Box */}
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1.25rem',
              borderRadius: '14px',
              background: '#f8fafc',
              border: `1.5px solid ${prediction.color}40`,
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
              Calculated Probability
            </div>
            <div
              style={{
                fontSize: '2.5rem',
                fontWeight: 900,
                color: prediction.color,
                margin: '0.25rem 0'
              }}
            >
              {prediction.score}%
            </div>
            <div
              style={{
                display: 'inline-block',
                background: `${prediction.color}15`,
                color: prediction.color,
                fontWeight: 800,
                fontSize: '0.85rem',
                padding: '3px 12px',
                borderRadius: '20px',
                marginBottom: '0.75rem'
              }}
            >
              {prediction.tier}
            </div>
            <p style={{ margin: 0, fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
              💡 {prediction.advice}
            </p>
          </div>
        </div>

        {/* 5-Year Salary Growth Trends Visual Chart */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '1.6rem',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            border: '1px solid #f1f5f9'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
            <div
              style={{
                background: '#dcfce7',
                color: '#16a34a',
                padding: '10px',
                borderRadius: '12px',
                fontSize: '1.2rem'
              }}
            >
              <FaMoneyBillWave />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                5-Year Campus Placement Salary Trend
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                Consistent upward trajectory in both Average and Peak packages (in LPA)
              </p>
            </div>
          </div>

          {/* Visual Column / Bar Graph */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              height: '240px',
              padding: '1.5rem 1rem 0.5rem',
              borderBottom: '2px solid #e2e8f0',
              marginBottom: '1rem'
            }}
          >
            {salaryTrends.map((st) => {
              const maxLpa = 60;
              const heightAvg = (st.avg / maxLpa) * 190;
              const heightPeak = (st.highest / maxLpa) * 190;

              return (
                <div
                  key={st.year}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    flex: 1
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
                    {/* Average bar */}
                    <div
                      title={`Avg CTC: ${st.avg} LPA`}
                      style={{
                        width: '24px',
                        height: `${heightAvg}px`,
                        background: '#ea580c',
                        borderRadius: '6px 6px 0 0',
                        transition: 'height 0.4s ease'
                      }}
                    />
                    {/* Highest bar */}
                    <div
                      title={`Highest CTC: ${st.highest} LPA`}
                      style={{
                        width: '24px',
                        height: `${heightPeak}px`,
                        background: '#38bdf8',
                        borderRadius: '6px 6px 0 0',
                        transition: 'height 0.4s ease'
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                    {st.year}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '2rem',
              fontSize: '0.82rem',
              color: '#64748b'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 12, height: 12, background: '#ea580c', borderRadius: '3px' }} />
              <span>Average Package (LPA)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 12, height: 12, background: '#38bdf8', borderRadius: '3px' }} />
              <span>Highest Package (LPA)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Table: Branch-wise Placement & Top Recruiters */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '18px',
          padding: '1.6rem',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
          border: '1px solid #f1f5f9'
        }}
      >
        <h3
          style={{
            margin: '0 0 1.25rem',
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FaGraduationCap style={{ color: '#ea580c' }} /> Department-wise Placement Conversion Heatmap
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.86rem' }}>
                <th style={{ padding: '0.75rem' }}>Branch / Stream</th>
                <th style={{ padding: '0.75rem' }}>Placement Rate</th>
                <th style={{ padding: '0.75rem' }}>Average Package</th>
                <th style={{ padding: '0.75rem' }}>Top Hiring Partners</th>
              </tr>
            </thead>
            <tbody>
              {branchData.map((b, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' }}>
                  <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: '#0f172a' }}>
                    {b.name}
                  </td>
                  <td style={{ padding: '0.85rem 0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          flex: 1,
                          maxWidth: '120px',
                          height: '8px',
                          background: '#e2e8f0',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}
                      >
                        <div
                          style={{
                            width: `${b.placed}%`,
                            height: '100%',
                            background: b.placed >= 90 ? '#16a34a' : b.placed >= 80 ? '#ea580c' : '#f59e0b',
                            borderRadius: '4px'
                          }}
                        />
                      </div>
                      <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.85rem' }}>
                        {b.placed}%
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: '#16a34a' }}>
                    {b.avg}
                  </td>
                  <td style={{ padding: '0.85rem 0.75rem', color: '#64748b' }}>
                    {b.topRecruiter}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}