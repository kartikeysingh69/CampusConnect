const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateDB() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'campusconnect'
  });

  // 1. Fix admin password so admin can log in with 'admin123'
  const adminPass = await bcrypt.hash('admin123', 10);
  await pool.query('UPDATE users SET password = ? WHERE email = ?', [adminPass, 'admin@campus.edu']);

  // 2. Add 12+ real-world placement job profiles
  const newJobs = [
    ['Frontend Engineer', 'Meta', 'Build responsive, accessible user interfaces using React, TypeScript, and modern web architectures.', 'Bangalore / Remote', '28 LPA', 'CGPA >= 7.5, JavaScript & React', '2026-12-30'],
    ['Cloud Solutions Architect', 'Oracle Cloud', 'Design and deploy resilient, scalable enterprise architectures on Oracle Cloud Infrastructure.', 'Bangalore', '22 LPA', 'CGPA >= 7.0, Networking & Cloud basics', '2026-12-28'],
    ['Backend Distributed Systems Engineer', 'Uber', 'Design high-throughput microservices handling millions of ride and delivery requests daily.', 'Hyderabad', '26 LPA', 'CGPA >= 8.0, Go/Node.js/Java', '2026-12-25'],
    ['Cyber Security Analyst', 'Cisco', 'Implement vulnerability assessment, zero-trust network segmentation, and penetration testing.', 'Bangalore', '16 LPA', 'CGPA >= 6.8, Networking & Linux', '2026-12-22'],
    ['Big Data & Pipeline Engineer', 'Netflix', 'Build real-time streaming data pipelines using Apache Kafka, Apache Spark, and Snowflake.', 'Mumbai', '32 LPA', 'CGPA >= 8.0, Python & SQL', '2026-12-29'],
    ['Machine Learning Engineer', 'NVIDIA', 'Optimize deep neural network inference on GPU clusters using CUDA, TensorRT, and PyTorch.', 'Pune', '30 LPA', 'CGPA >= 8.0, Python/PyTorch/C++', '2026-12-26'],
    ['Site Reliability Engineer (SRE)', 'Atlassian', 'Ensure 99.99% uptime for Jira and Confluence using Kubernetes, Prometheus, and SLOs.', 'Remote', '24 LPA', 'CGPA >= 7.0, DevOps & Linux', '2026-12-24'],
    ['Mobile App Engineer', 'Swiggy', 'Develop fast, resilient cross-platform delivery experiences with React Native and native iOS/Android modules.', 'Bangalore', '18 LPA', 'CGPA >= 6.5, React Native/Flutter', '2026-12-20'],
    ['GenAI Solutions Engineer', 'Adobe', 'Integrate generative AI capabilities and LLM workflows into Adobe Creative Cloud web tools.', 'Noida', '25 LPA', 'CGPA >= 7.5, Python & REST APIs', '2026-12-23'],
    ['DevOps & Infrastructure Automation Engineer', 'IBM', 'Automate multi-cluster hybrid cloud deployments with Terraform, Ansible, and Helm.', 'Gurgaon', '17 LPA', 'CGPA >= 7.0, Docker & Git', '2026-12-18'],
    ['Systems Software Engineer', 'Qualcomm', 'Develop device drivers and low-level firmware for next-generation 5G Snapdragon mobile chipsets.', 'Hyderabad', '21 LPA', 'CGPA >= 7.5, C/C++ & OS concepts', '2026-12-27'],
    ['Product Data Analyst', 'Zomato', 'Analyze order retention metrics, user acquisition funnels, and restaurant performance dashboards.', 'Gurgaon', '15 LPA', 'CGPA >= 6.5, SQL & Excel/Python', '2026-12-19']
  ];

  for (const job of newJobs) {
    const [existing] = await pool.query('SELECT id FROM jobs WHERE title = ? AND company = ?', [job[0], job[1]]);
    if (existing.length === 0) {
      await pool.query(
        'INSERT INTO jobs (title, company, description, location, ctc, eligibility, deadline, status) VALUES (?, ?, ?, ?, ?, ?, ?, "open")',
        job
      );
    }
  }

  const [rows] = await pool.query('SELECT COUNT(*) as count FROM jobs');
  console.log(`✅ Success! Total jobs in database now: ${rows[0].count}`);
  console.log('✅ Admin login credentials: admin@campus.edu / admin123');
  process.exit(0);
}

updateDB().catch(e => {
  console.error('Update failed:', e);
  process.exit(1);
});
