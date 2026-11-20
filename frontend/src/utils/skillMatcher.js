// src/utils/skillMatcher.js — AI-Powered Candidate Skill Match & Fit Analysis Engine

export const KNOWN_SKILLS = [
  // Web & Full Stack
  'React', 'Node.js', 'JavaScript', 'TypeScript', 'Next.js', 'Vue', 'Angular',
  'HTML', 'CSS', 'Tailwind', 'Bootstrap', 'Redux', 'Express', 'REST APIs', 'GraphQL',
  // Backend & Languages
  'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby', 'Spring Boot', 'Django', 'Flask',
  // Database & Storage
  'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Firebase', 'Oracle', 'Cassandra',
  // Cloud & DevOps
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Git', 'Linux', 'Terraform', 'DevOps',
  // AI, Data & Analytics
  'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'Data Science',
  'Pandas', 'NumPy', 'Power BI', 'Tableau', 'Excel', 'Data Analysis', 'Snowflake', 'Kafka', 'Spark',
  // Mobile
  'React Native', 'Flutter', 'Android', 'iOS', 'Swift', 'Kotlin',
  // Core Engineering & Domain
  'CAD', 'SolidWorks', 'AutoCAD', 'Embedded Systems', 'IoT', 'Circuit Design', 'VLSI', 'MATLAB',
  // Business, Product & Management
  'Agile', 'Scrum', 'Product Management', 'Digital Marketing', 'Financial Modeling', 'Business Analytics', 'SEO', 'Communication'
];

export const STREAM_DEFAULT_SKILLS = {
  'Computer Science': ['React', 'Node.js', 'Python', 'SQL', 'Git', 'Data Structures', 'REST APIs'],
  'Mechanical': ['CAD', 'SolidWorks', 'Thermodynamics', 'AutoCAD', 'Manufacturing', 'Quality Assurance'],
  'Electrical': ['Circuit Design', 'MATLAB', 'Power Systems', 'Embedded Systems', 'IoT', 'PLC'],
  'Electronics & Comm': ['Embedded Systems', 'VLSI', 'Circuit Design', 'IoT', 'C++', 'Signal Processing'],
  'Civil': ['AutoCAD', 'Structural Analysis', 'Project Management', 'Surveying', 'Estimation'],
  'Business & Management': ['Agile', 'Product Management', 'Data Analysis', 'Excel', 'Communication', 'Strategic Planning'],
  'Finance & Banking': ['Financial Modeling', 'Excel', 'SQL', 'Risk Analysis', 'Accounting', 'Data Analysis'],
  'Customer Support & BPO': ['Communication', 'CRM', 'Problem Solving', 'Customer Service', 'Excel'],
  'Marketing & Sales': ['Digital Marketing', 'SEO', 'CRM', 'Communication', 'Market Research', 'Lead Generation'],
  'Human Resources': ['Talent Acquisition', 'HRIS', 'Communication', 'Payroll Management', 'Employee Relations']
};

/**
 * Normalizes and extracts recognized skills from any text or list.
 */
export function extractSkillsFromText(text) {
  if (!text) return [];
  const found = new Set();
  const lower = text.toLowerCase();

  KNOWN_SKILLS.forEach((skill) => {
    // Check with word boundaries or specific variations
    const escaped = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(^|[^a-zA-Z0-9_+#])${escaped}([^a-zA-Z0-9_+#]|$)`, 'i');
    if (regex.test(lower)) {
      found.add(skill);
    }
  });

  return Array.from(found);
}

/**
 * Parses user skills string into an array of skills.
 */
export function parseStudentSkills(rawSkills) {
  if (!rawSkills) return [];
  if (Array.isArray(rawSkills)) return rawSkills.map(s => String(s).trim()).filter(Boolean);
  return String(rawSkills)
    .split(/[,;\n|]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Computes AI Skill Match between a Job and Student Profile
 * @param {Object} job - The job posting object (title, description, skills, stream, eligibility)
 * @param {Object} student - The logged-in student profile (skills, branch, cgpa)
 * @returns {Object} Fit analysis including score, matchedSkills, missingSkills, rating
 */
export function calculateSkillMatch(job, student) {
  if (!job) return null;

  // 1. Identify Target Job Skills
  let targetSkills = [];
  if (job.skills) {
    targetSkills = parseStudentSkills(job.skills);
  }
  if (targetSkills.length < 3) {
    const fromText = extractSkillsFromText(`${job.title || ''} ${job.description || ''} ${job.eligibility || ''}`);
    targetSkills = Array.from(new Set([...targetSkills, ...fromText]));
  }
  if (targetSkills.length < 2 && job.stream && STREAM_DEFAULT_SKILLS[job.stream]) {
    targetSkills = Array.from(new Set([...targetSkills, ...STREAM_DEFAULT_SKILLS[job.stream].slice(0, 5)]));
  }
  if (targetSkills.length === 0) {
    targetSkills = ['Problem Solving', 'Communication', 'Domain Knowledge', 'Analytical Thinking'];
  }

  // 2. Identify Student Skills
  let studentSkills = parseStudentSkills(student?.skills);
  if (studentSkills.length === 0 && student?.bio) {
    studentSkills = extractSkillsFromText(student.bio);
  }

  // Case A: Student has NOT populated their profile skills yet
  if (studentSkills.length === 0) {
    const branchMatch =
      student?.branch &&
      job.stream &&
      (job.stream.toLowerCase().includes(student.branch.toLowerCase()) ||
        student.branch.toLowerCase().includes(job.stream.toLowerCase()));

    const baseScore = branchMatch ? 76 : 58;

    return {
      score: baseScore,
      matchedSkills: targetSkills.slice(0, 2),
      missingSkills: targetSkills.slice(2, 5),
      totalJobSkills: targetSkills,
      hasCustomSkills: false,
      ratingLabel: branchMatch ? 'Stream Relevant Match' : 'General Fit',
      badgeText: `${baseScore}% Fit`,
      color: branchMatch ? '#0284c7' : '#ea580c',
      bg: branchMatch ? '#f0f9ff' : '#fff7ed',
      border: branchMatch ? '#bae6fd' : '#fed7aa',
      advice: 'Add your technical skills in your Profile to get 100% accurate AI match scoring.'
    };
  }

  // Case B: Student has specified skills
  const studentSkillsLower = studentSkills.map((s) => s.toLowerCase());
  const matchedSkills = [];
  const missingSkills = [];

  targetSkills.forEach((tSkill) => {
    const tLower = tSkill.toLowerCase();
    const isMatch = studentSkillsLower.some(
      (sLower) => sLower === tLower || sLower.includes(tLower) || tLower.includes(sLower)
    );
    if (isMatch) {
      matchedSkills.push(tSkill);
    } else {
      missingSkills.push(tSkill);
    }
  });

  // Calculate percentage: 70% weighted on skills + 20% on branch + 10% on CGPA
  const skillRatio = targetSkills.length > 0 ? (matchedSkills.length / targetSkills.length) : 0.5;
  let rawScore = skillRatio * 70;

  // Stream/Branch affinity bonus
  if (student?.branch && job.stream) {
    if (
      job.stream.toLowerCase().includes(student.branch.toLowerCase()) ||
      student.branch.toLowerCase().includes(job.stream.toLowerCase())
    ) {
      rawScore += 20;
    } else {
      rawScore += 8;
    }
  } else {
    rawScore += 15;
  }

  // CGPA Cutoff bonus / deduction
  if (student?.cgpa) {
    const studentCgpa = parseFloat(student.cgpa);
    if (studentCgpa >= 8.0) rawScore += 10;
    else if (studentCgpa >= 7.0) rawScore += 7;
    else rawScore += 4;
  } else {
    rawScore += 5;
  }

  const finalScore = Math.min(98, Math.max(30, Math.round(rawScore)));

  // UI styling based on score bracket
  let ratingLabel = 'Moderate Match';
  let badgeText = `${finalScore}% Match`;
  let color = '#d97706';
  let bg = '#fffbeb';
  let border = '#fde68a';
  let advice = 'You have a fair match. Brush up on the missing skills to ace the technical interview.';

  if (finalScore >= 82) {
    ratingLabel = 'Exceptional Match';
    color = '#16a34a';
    bg = '#f0fdf4';
    border = '#bbf7d0';
    advice = 'Your profile is highly aligned with this role! Strong candidate for initial shortlisting.';
  } else if (finalScore >= 68) {
    ratingLabel = 'Strong Match';
    color = '#0284c7';
    bg = '#f0f9ff';
    border = '#bae6fd';
    advice = 'Good match! You satisfy most core requirements. Review the key highlights before applying.';
  } else if (finalScore < 50) {
    ratingLabel = 'Skill Gap Detected';
    color = '#64748b';
    bg = '#f8fafc';
    border = '#e2e8f0';
    advice = 'Consider reviewing the required tools and frameworks before the technical evaluation round.';
  }

  return {
    score: finalScore,
    matchedSkills,
    missingSkills,
    totalJobSkills: targetSkills,
    hasCustomSkills: true,
    ratingLabel,
    badgeText,
    color,
    bg,
    border,
    advice
  };
}
