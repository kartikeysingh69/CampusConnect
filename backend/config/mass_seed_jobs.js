const mysql = require('mysql2/promise');
require('dotenv').config();

const streams = [
  'Computer Science',
  'Mechanical',
  'Electrical',
  'Electronics & Comm',
  'Civil',
  'Business & Management',
  'Finance & Banking',
  'Customer Support & BPO',
  'Marketing & Sales',
  'Human Resources'
];

const jobsTemplate = [
  // Computer Science & IT (15)
  { title: 'Frontend Developer', company: 'Swiggy', stream: 'Computer Science', ctc: '14 LPA', loc: 'Bangalore', exp: 'React, Redux, CSS3' },
  { title: 'Backend Software Engineer', company: 'Razorpay', stream: 'Computer Science', ctc: '20 LPA', loc: 'Bangalore', exp: 'Node.js, MongoDB, Microservices' },
  { title: 'Cloud DevOps Engineer', company: 'Paytm', stream: 'Computer Science', ctc: '16 LPA', loc: 'Noida', exp: 'AWS, Docker, Kubernetes, CI/CD' },
  { title: 'Full Stack Java Engineer', company: 'TCS Digital', stream: 'Computer Science', ctc: '9 LPA', loc: 'Pune', exp: 'Spring Boot, Angular, MySQL' },
  { title: 'Data Scientist', company: 'Fractal Analytics', stream: 'Computer Science', ctc: '15 LPA', loc: 'Mumbai', exp: 'Python, ML, NLP, Pandas' },
  { title: 'Quality Assurance & SDET', company: 'PhonePe', stream: 'Computer Science', ctc: '13 LPA', loc: 'Bangalore', exp: 'Selenium, Postman, Jest' },
  { title: 'Android App Developer', company: 'Urban Company', stream: 'Computer Science', ctc: '16 LPA', loc: 'Gurgaon', exp: 'Kotlin, Android Studio, Jetpack' },
  { title: 'iOS Application Engineer', company: 'Zomato', stream: 'Computer Science', ctc: '18 LPA', loc: 'Gurgaon', exp: 'Swift, UIKit, SwiftUI' },
  { title: 'Cybersecurity Analyst', company: 'Wipro Cybersecurity', stream: 'Computer Science', ctc: '10 LPA', loc: 'Hyderabad', exp: 'SIEM, OWASP, Penetration Testing' },
  { title: 'AI Research Assistant', company: 'Reliance Jio AI', stream: 'Computer Science', ctc: '14 LPA', loc: 'Navi Mumbai', exp: 'PyTorch, Transformers, LLMs' },
  { title: 'Blockchain Developer', company: 'Polygon Labs', stream: 'Computer Science', ctc: '22 LPA', loc: 'Remote', exp: 'Solidity, Web3.js, Smart Contracts' },
  { title: 'Database Administrator', company: 'Oracle India', stream: 'Computer Science', ctc: '14 LPA', loc: 'Hyderabad', exp: 'MySQL, PostgreSQL, Query Tuning' },
  { title: 'Game Developer (Unity)', company: 'Dream11', stream: 'Computer Science', ctc: '18 LPA', loc: 'Mumbai', exp: 'C#, Unity 3D, Physics Engines' },
  { title: 'Infrastructure Engineer', company: 'HCL Technologies', stream: 'Computer Science', ctc: '8.5 LPA', loc: 'Chennai', exp: 'Linux Systems, Bash, DNS, Bash' },
  { title: 'Embedded Software Engineer', company: 'Bosch India', stream: 'Computer Science', ctc: '11 LPA', loc: 'Bangalore', exp: 'C/C++, RTOS, Microcontrollers' },

  // Mechanical Engineering (15)
  { title: 'Design Engineer - CAD/CAM', company: 'Tata Motors', stream: 'Mechanical', ctc: '8.5 LPA', loc: 'Pune', exp: 'CATIA, SolidWorks, AutoCAD' },
  { title: 'Production & Planning Engineer', company: 'Mahindra & Mahindra', stream: 'Mechanical', ctc: '7.8 LPA', loc: 'Nashik', exp: 'Lean Manufacturing, Six Sigma, GD&T' },
  { title: 'Automotive Safety Systems Engineer', company: 'Maruti Suzuki', stream: 'Mechanical', ctc: '9.2 LPA', loc: 'Gurgaon', exp: 'Crash Analysis, FEA, HyperMesh' },
  { title: 'HVAC Design Consultant', company: 'Voltas Limited', stream: 'Mechanical', ctc: '6.5 LPA', loc: 'Ahmedabad', exp: 'HVAC Load Calculation, Revit, MEP' },
  { title: 'Quality Control Specialist', company: 'Larsen & Toubro Heavy', stream: 'Mechanical', ctc: '7.5 LPA', loc: 'Vadodara', exp: 'NDT Level II, ISO 9001, CMM' },
  { title: 'Thermal Systems Engineer', company: 'Thermax Global', stream: 'Mechanical', ctc: '8.0 LPA', loc: 'Pune', exp: 'Boiler Design, Heat Transfer, CFD' },
  { title: 'Robotics & Automation Trainee', company: 'Fanuc India', stream: 'Mechanical', ctc: '9.0 LPA', loc: 'Bangalore', exp: 'PLC Programming, Robotic Arms' },
  { title: 'Aerodynamics Simulation Engineer', company: 'DRDO Aeronautics', stream: 'Mechanical', ctc: '10.5 LPA', loc: 'Hyderabad', exp: 'ANSYS Fluent, OpenFOAM, Aerodynamics' },
  { title: 'Maintenance Lead Engineer', company: 'Jindal Steel & Power', stream: 'Mechanical', ctc: '7.2 LPA', loc: 'Raigarh', exp: 'Preventive Maintenance, Hydraulics' },
  { title: 'Piping Design Engineer', company: 'Technip Energies', stream: 'Mechanical', ctc: '8.2 LPA', loc: 'Chennai', exp: 'SP3D, Caesar II, Plant Piping' },
  { title: 'Power Plant Operations Engineer', company: 'NTPC Limited', stream: 'Mechanical', ctc: '12 LPA', loc: 'Korba', exp: 'Turbine Systems, SCADA Control' },
  { title: 'Tooling & Die Design Engineer', company: 'Godrej & Boyce', stream: 'Mechanical', ctc: '6.8 LPA', loc: 'Mumbai', exp: 'Press Tool Design, Injection Moulding' },
  { title: 'Supply Chain Operations Trainee', company: 'Brembo Brakes India', stream: 'Mechanical', ctc: '6.2 LPA', loc: 'Pune', exp: 'Vendor Management, BOM Analysis' },
  { title: 'Materials & Metallurgy Analyst', company: 'Bharat Forge', stream: 'Mechanical', ctc: '7.6 LPA', loc: 'Pune', exp: 'Heat Treatment, Metallography' },
  { title: 'Heavy Machinery Field Engineer', company: 'Caterpillar India', stream: 'Mechanical', ctc: '9.5 LPA', loc: 'Chennai', exp: 'Excavator Systems, Diagnostics' },

  // Electrical & Power (12)
  { title: 'Power Systems Engineer', company: 'ABB India', stream: 'Electrical', ctc: '9.0 LPA', loc: 'Bangalore', exp: 'Substation Automation, Protection Relays' },
  { title: 'Renewable Energy Design Trainee', company: 'Tata Power Solar', stream: 'Electrical', ctc: '7.5 LPA', loc: 'Bangalore', exp: 'PVsyst, Solar Array Layouts, Inverters' },
  { title: 'Transformer Design Engineer', company: 'Siemens Energy', stream: 'Electrical', ctc: '8.8 LPA', loc: 'Gurgaon', exp: 'Transformer Testing, Maxwell, High Voltage' },
  { title: 'EV Powertrain Engineer', company: 'Ola Electric', stream: 'Electrical', ctc: '13 LPA', loc: 'Bangalore', exp: 'BMS, Motor Controllers, Lithium Cells' },
  { title: 'Electrical Maintenance Engineer', company: 'Adani Transmission', stream: 'Electrical', ctc: '8.2 LPA', loc: 'Ahmedabad', exp: 'Grid Switchyards, HT/LT Panels' },
  { title: 'Electrical CAD Drafter', company: 'Schneider Electric', stream: 'Electrical', ctc: '6.8 LPA', loc: 'Chennai', exp: 'AutoCAD Electrical, SLD Diagramming' },
  { title: 'PLC & SCADA Programmer', company: 'Rockwell Automation', stream: 'Electrical', ctc: '9.5 LPA', loc: 'Noida', exp: 'Allen-Bradley, FactoryTalk, Industrial IoT' },
  { title: 'Battery Management Architect', company: 'Ather Energy', stream: 'Electrical', ctc: '14 LPA', loc: 'Bangalore', exp: 'Thermal runaway prevention, CAN bus' },
  { title: 'Control Panel Quality Auditor', company: 'Havells India', stream: 'Electrical', ctc: '6.0 LPA', loc: 'Alwar', exp: 'Short Circuit Testing, IS Standards' },
  { title: 'Smart Grid Systems Engineer', company: 'L&T Electrical & Automation', stream: 'Electrical', ctc: '8.4 LPA', loc: 'Navi Mumbai', exp: 'AMI, Smart Meters, Communication Protocols' },
  { title: 'Locomotive Electrical Trainee', company: 'Alstom India', stream: 'Electrical', ctc: '8.0 LPA', loc: 'Madhepura', exp: 'Traction Motors, Pantograph Systems' },
  { title: 'Wind Turbine Field Electrical Lead', company: 'Suzlon Energy', stream: 'Electrical', ctc: '7.0 LPA', loc: 'Coimbatore', exp: 'Generators, Pitch Control, Power Factor' },

  // Electronics & Communication (12)
  { title: 'VLSI Design & Verification Engineer', company: 'Intel India', stream: 'Electronics & Comm', ctc: '21 LPA', loc: 'Bangalore', exp: 'SystemVerilog, UVM, FPGA prototyping' },
  { title: 'RF & Microwave Engineer', company: 'Qualcomm India', stream: 'Electronics & Comm', ctc: '19 LPA', loc: 'Hyderabad', exp: '5G NR, Spectrum Analyzers, Antenna Design' },
  { title: 'Telecom Network Specialist', company: 'Bharti Airtel', stream: 'Electronics & Comm', ctc: '8.5 LPA', loc: 'Gurgaon', exp: '4G/5G Core, IP Routing, Microwave Links' },
  { title: 'IoT Hardware Systems Engineer', company: 'Honeywell India', stream: 'Electronics & Comm', ctc: '11 LPA', loc: 'Bangalore', exp: 'ESP32, Zigbee, BLE, Sensor Interfaces' },
  { title: 'PCB Layout & Hardware Designer', company: 'Texas Instruments', stream: 'Electronics & Comm', ctc: '17 LPA', loc: 'Bangalore', exp: 'Altium Designer, Signal Integrity, EMI/EMC' },
  { title: 'DSP Audio Algorithm Engineer', company: 'Harman Connected Services', stream: 'Electronics & Comm', ctc: '12 LPA', loc: 'Pune', exp: 'Digital Signal Processing, MATLAB, Filters' },
  { title: 'Optical Fiber Networks Planner', company: 'Sterlite Technologies (STL)', stream: 'Electronics & Comm', ctc: '7.0 LPA', loc: 'Pune', exp: 'DWDM, OTDR Testing, FTTH Topology' },
  { title: 'Semiconductor Validation Engineer', company: 'AMD India', stream: 'Electronics & Comm', ctc: '18 LPA', loc: 'Bangalore', exp: 'Silicon Post-Silicon Validation, Python Automation' },
  { title: 'Radar Systems Firmware Engineer', company: 'Bharat Electronics (BEL)', stream: 'Electronics & Comm', ctc: '10 LPA', loc: 'Ghaziabad', exp: 'C/C++, Doppler Radar, Microchip PIC' },
  { title: '5G Protocol Stack Developer', company: 'Samsung R&D', stream: 'Electronics & Comm', ctc: '16 LPA', loc: 'Noida', exp: 'LTE/NR Layer 2/Layer 3, Wireshark' },
  { title: 'Drone Avionics Engineer', company: 'IdeaForge', stream: 'Electronics & Comm', ctc: '9.5 LPA', loc: 'Navi Mumbai', exp: 'Flight Controllers, Telemetry, Gyroscopes' },
  { title: 'Automotive Sensor Integration Specialist', company: 'Continental Automotive', stream: 'Electronics & Comm', ctc: '10.5 LPA', loc: 'Bangalore', exp: 'RADAR, LiDAR, Automotive Ethernet' },

  // Civil & Construction (10)
  { title: 'Site Structural Engineer', company: 'Larsen & Toubro Construction', stream: 'Civil', ctc: '7.5 LPA', loc: 'Mumbai', exp: 'STAAD.Pro, RCC Design, Bar Bending Schedule' },
  { title: 'BIM Modeler & Coordinator', company: 'Shapoorji Pallonji', stream: 'Civil', ctc: '6.8 LPA', loc: 'Hyderabad', exp: 'Autodesk Revit, Navisworks, Clash Detection' },
  { title: 'Geotechnical & Soil Analyst', company: 'Afcons Infrastructure', stream: 'Civil', ctc: '7.2 LPA', loc: 'Delhi NCR', exp: 'Soil mechanics, Foundation Piling, Standard Penetration' },
  { title: 'Highway & Transportation Planner', company: 'Dilip Buildcon', stream: 'Civil', ctc: '6.5 LPA', loc: 'Bhopal', exp: 'MX Road, Pavement Design, IRC codes' },
  { title: 'Quantity Surveyor & Estimation Lead', company: 'Sobha Developers', stream: 'Civil', ctc: '6.2 LPA', loc: 'Bangalore', exp: 'Quantity Estimation, MS Excel, Rate Analysis' },
  { title: 'Water Resource & Sewage Project Engineer', company: 'VA Tech Wabag', stream: 'Civil', ctc: '7.0 LPA', loc: 'Chennai', exp: 'STP/ETP Design, Pipe Flow, WaterCAD' },
  { title: 'Urban Planning Project Associate', company: 'JLL India', stream: 'Civil', ctc: '8.0 LPA', loc: 'Gurgaon', exp: 'GIS Mapping, Master Planning, Zoning regulations' },
  { title: 'Metro Rail Tunneling Engineer', company: 'Tata Projects', stream: 'Civil', ctc: '8.5 LPA', loc: 'Pune', exp: 'Tunnel Boring Machine (TBM), Underground Excavation' },
  { title: 'Safety & Environmental Site Officer', company: 'Gammon India', stream: 'Civil', ctc: '5.8 LPA', loc: 'Kolkata', exp: 'OSHA / NEBOSH Certification, Hazard identification' },
  { title: 'Smart City Infrastructure Analyst', company: 'PwC Infrastructure', stream: 'Civil', ctc: '9.0 LPA', loc: 'Noida', exp: 'Civil Assets Lifecycle, Public-Private Partnerships' },

  // Business & Management (12)
  { title: 'Business Analyst - Technology', company: 'Deloitte India', stream: 'Business & Management', ctc: '11.5 LPA', loc: 'Hyderabad', exp: 'BRD, User Stories, Jira, Agile Scrum' },
  { title: 'Management Consultant Trainee', company: 'KPMG India', stream: 'Business & Management', ctc: '12 LPA', loc: 'Gurgaon', exp: 'Market Research, Financial Modeling, Pitch Decks' },
  { title: 'Operations Management Associate', company: 'Amazon Fulfillment', stream: 'Business & Management', ctc: '13 LPA', loc: 'Bangalore', exp: 'Warehousing Metrics, Kaizen, Six Sigma' },
  { title: 'Product Operations Specialist', company: 'Flipkart', stream: 'Business & Management', ctc: '10 LPA', loc: 'Bangalore', exp: 'KPI Tracking, A/B Test Monitoring, SQL' },
  { title: 'Strategic Partnerships Associate', company: 'MakeMyTrip', stream: 'Business & Management', ctc: '9.0 LPA', loc: 'Gurgaon', exp: 'Vendor Negotiation, Contract Structuring' },
  { title: 'Supply Chain Optimization Analyst', company: 'Unilever India', stream: 'Business & Management', ctc: '12.5 LPA', loc: 'Mumbai', exp: 'Inventory Turnover, Demand Forecasting, ERP' },
  { title: 'Business Development Executive', company: 'Byjus Enterprise', stream: 'Business & Management', ctc: '7.5 LPA', loc: 'Bangalore', exp: 'Corporate B2B Sales, CRM pipelines' },
  { title: 'Digital Transformation Specialist', company: 'Accenture Strategy', stream: 'Business & Management', ctc: '13.5 LPA', loc: 'Mumbai', exp: 'Process Mining, Cloud Adoption Roadmaps' },
  { title: 'Customer Experience Program Manager', company: 'Uber India', stream: 'Business & Management', ctc: '14 LPA', loc: 'Hyderabad', exp: 'NPS Tracking, Voice of Customer, Escalation Management' },
  { title: 'E-commerce Category Specialist', company: 'Meesho', stream: 'Business & Management', ctc: '10.5 LPA', loc: 'Bangalore', exp: 'Catalog Quality, GMV Growth, Pricing Analytics' },
  { title: 'Corporate Risk Assessment Analyst', company: 'EY India (Ernst & Young)', stream: 'Business & Management', ctc: '11 LPA', loc: 'Kolkata', exp: 'SOX Compliance, Internal Audit, Enterprise Risk' },
  { title: 'Key Account Manager', company: 'Dunzo For Business', stream: 'Business & Management', ctc: '8.5 LPA', loc: 'Bangalore', exp: 'Client Retention, Upselling, SLA Monitoring' },

  // Finance & Banking (12)
  { title: 'Investment Banking Analyst', company: 'Goldman Sachs India', stream: 'Finance & Banking', ctc: '23 LPA', loc: 'Bangalore', exp: 'DCF Valuation, LBO Models, Pitch Presentations' },
  { title: 'Credit Risk Analyst', company: 'HDFC Bank', stream: 'Finance & Banking', ctc: '8.5 LPA', loc: 'Mumbai', exp: 'Credit Appraisal, Balance Sheet Analysis, CIBIL' },
  { title: 'Financial Planning & Analysis (FP&A)', company: 'American Express', stream: 'Finance & Banking', ctc: '12.5 LPA', loc: 'Gurgaon', exp: 'Variance Analysis, P&L Forecasting, Hyperion' },
  { title: 'Wealth Management Advisor Trainee', company: 'ICICI Securities', stream: 'Finance & Banking', ctc: '7.0 LPA', loc: 'Delhi NCR', exp: 'Mutual Funds, Portfolio Allocation, NISM V-A' },
  { title: 'Equity Research Associate', company: 'Morgan Stanley', stream: 'Finance & Banking', ctc: '19 LPA', loc: 'Mumbai', exp: 'Sector Trends, Earnings Call Summaries, Bloomberg' },
  { title: 'Treasury & Forex Desk Associate', company: 'Axis Bank', stream: 'Finance & Banking', ctc: '9.2 LPA', loc: 'Mumbai', exp: 'Currency Swaps, Interest Rate Derivatives' },
  { title: 'Corporate Banking Relationship Officer', company: 'Kotak Mahindra Bank', stream: 'Finance & Banking', ctc: '8.0 LPA', loc: 'Chennai', exp: 'Working Capital Loans, Letter of Credit, Bank Guarantees' },
  { title: 'Quantitative Trading Analyst', company: 'Tower Research Capital', stream: 'Finance & Banking', ctc: '32 LPA', loc: 'Gurgaon', exp: 'Statistical Arbitrage, Python, C++, Time Series' },
  { title: 'Fraud Risk & AML Analyst', company: 'Standard Chartered', stream: 'Finance & Banking', ctc: '9.0 LPA', loc: 'Bangalore', exp: 'Transaction Monitoring, Anti-Money Laundering, KYC' },
  { title: 'Fintech Product Accountant', company: 'Groww', stream: 'Finance & Banking', ctc: '11 LPA', loc: 'Bangalore', exp: 'Reconciliation Automation, Tally Prime, Tax Reporting' },
  { title: 'Tax & Compliance Associate', company: 'Grant Thornton', stream: 'Finance & Banking', ctc: '7.8 LPA', loc: 'Hyderabad', exp: 'GST Audit, Transfer Pricing, Income Tax Act' },
  { title: 'Private Equity Fund Operations', company: 'Blackstone India', stream: 'Finance & Banking', ctc: '21 LPA', loc: 'Mumbai', exp: 'Capital Call Notices, Fund Accounting, LP Reporting' },

  // Customer Support, BPO & Call Centers (12)
  { title: 'Customer Support Executive (Voice)', company: 'Concentrix India', stream: 'Customer Support & BPO', ctc: '4.8 LPA', loc: 'Gurgaon', exp: 'Fluent English, Problem Resolution, Active Listening' },
  { title: 'Technical Support Engineer (Level 1)', company: 'Dell Technologies', stream: 'Customer Support & BPO', ctc: '5.5 LPA', loc: 'Bangalore', exp: 'Windows Troubleshooting, Hardware Diagnostics' },
  { title: 'Customer Success Specialist', company: 'Freshworks', stream: 'Customer Support & BPO', ctc: '8.0 LPA', loc: 'Chennai', exp: 'SaaS Onboarding, Ticketing, Retention, Zendesk' },
  { title: 'International Inbound Support Associate', company: 'Teleperformance', stream: 'Customer Support & BPO', ctc: '5.2 LPA', loc: 'Jaipur', exp: 'US/UK Accent, Shift Readiness, Call Etiquette' },
  { title: 'Customer Escalation Manager', company: 'Amazon Customer Service', stream: 'Customer Support & BPO', ctc: '6.8 LPA', loc: 'Hyderabad', exp: 'Conflict Resolution, Email Escalations, Root Cause' },
  { title: 'Banking Process Associate (Call / Chat)', company: 'WNS Global Services', stream: 'Customer Support & BPO', ctc: '4.5 LPA', loc: 'Pune', exp: 'Customer verification, Account assistance' },
  { title: 'Health Insurance Claims Representative', company: 'Genpact', stream: 'Customer Support & BPO', ctc: '5.0 LPA', loc: 'Noida', exp: 'US Healthcare Billing, HIPAA guidelines' },
  { title: 'E-commerce Helpdesk Representative', company: 'Flipkart Customer Ops', stream: 'Customer Support & BPO', ctc: '4.6 LPA', loc: 'Bangalore', exp: 'Order refunds, Logistics tracking, CRM systems' },
  { title: 'IT Service Desk Technician', company: 'Cognizant Service Desk', stream: 'Customer Support & BPO', ctc: '5.2 LPA', loc: 'Kolkata', exp: 'Active Directory, Password Resets, ServiceNow' },
  { title: 'Multilingual Support Specialist (Hindi/Eng)', company: 'Foundever', stream: 'Customer Support & BPO', ctc: '4.8 LPA', loc: 'Hyderabad', exp: 'Communication fluency, Typing speed 40+ WPM' },
  { title: 'Airline Reservations & Ticketing Agent', company: 'Wipro BPO Aviation', stream: 'Customer Support & BPO', ctc: '5.4 LPA', loc: 'Gurgaon', exp: 'Amadeus, Sabre GDS, Flight Rebooking' },
  { title: 'Quality & Call Auditing Executive', company: 'TaskUs India', stream: 'Customer Support & BPO', ctc: '5.8 LPA', loc: 'Indore', exp: 'Fatal error analysis, Quality Scorecard, Coaching' },

  // Marketing & Sales (10)
  { title: 'Digital Marketing Strategist', company: 'Ogilvy India', stream: 'Marketing & Sales', ctc: '8.2 LPA', loc: 'Mumbai', exp: 'SEO, Google Ads, Meta Ad Manager, Copywriting' },
  { title: 'Corporate Sales Associate (SaaS)', company: 'Zoho Corporation', stream: 'Marketing & Sales', ctc: '9.0 LPA', loc: 'Chennai', exp: 'Cold Outreach, Product Demos, Deal Closing' },
  { title: 'Content & Brand Marketing Lead', company: 'Nykaa', stream: 'Marketing & Sales', ctc: '7.5 LPA', loc: 'Mumbai', exp: 'Influencer campaigns, Social Media Analytics' },
  { title: 'Field Sales Officer', company: 'Asian Paints', stream: 'Marketing & Sales', ctc: '6.8 LPA', loc: 'Lucknow', exp: 'Dealer Network Management, Secondary Sales' },
  { title: 'Performance Marketer', company: 'Boat Lifestyle', stream: 'Marketing & Sales', ctc: '9.5 LPA', loc: 'Delhi NCR', exp: 'ROAS optimization, Attribution modeling, GA4' },
  { title: 'Territory Sales Manager Trainee', company: 'Nestle India', stream: 'Marketing & Sales', ctc: '8.5 LPA', loc: 'Chandigarh', exp: 'FMCG Distribution, Retail Visibility, Target tracking' },
  { title: 'Public Relations & Communications Coordinator', company: 'Edelman India', stream: 'Marketing & Sales', ctc: '7.0 LPA', loc: 'Gurgaon', exp: 'Press releases, Media pitching, Event planning' },
  { title: 'Growth Marketing Associate', company: 'Cred', stream: 'Marketing & Sales', ctc: '13 LPA', loc: 'Bangalore', exp: 'Gamification campaigns, User activation, Viral loops' },
  { title: 'Industrial Equipment B2B Sales Engineer', company: 'Kirloskar Brothers', stream: 'Marketing & Sales', ctc: '7.2 LPA', loc: 'Pune', exp: 'Pumps & Valves quoting, Technical presentations' },
  { title: 'Real Estate Sales Consultant', company: 'Godrej Properties', stream: 'Marketing & Sales', ctc: '8.0 LPA', loc: 'Noida', exp: 'Site visits, High net-worth client handling' },

  // Human Resources (8)
  { title: 'Talent Acquisition Specialist', company: 'Infosys HR', stream: 'Human Resources', ctc: '6.5 LPA', loc: 'Bangalore', exp: 'LinkedIn Recruiter, Naukri Portal, Tech Screening' },
  { title: 'HR Generalist Trainee', company: 'Tata Consultancy Services', stream: 'Human Resources', ctc: '6.0 LPA', loc: 'Mumbai', exp: 'Employee Onboarding, Leave policies, Statutory rules' },
  { title: 'Compensation & Benefits Associate', company: 'Mercer India', stream: 'Human Resources', ctc: '8.5 LPA', loc: 'Gurgaon', exp: 'Salary Benchmarking, ESOP structure, Tax perks' },
  { title: 'Campus Recruitment Lead', company: 'Capgemini India', stream: 'Human Resources', ctc: '7.2 LPA', loc: 'Pune', exp: 'College placement coordination, Hackathons' },
  { title: 'Employee Relations & Engagement Specialist', company: 'Mindtree / LTIMindtree', stream: 'Human Resources', ctc: '6.8 LPA', loc: 'Bhubaneswar', exp: 'Grievance redressal, Townhalls, Wellness drives' },
  { title: 'HR Operations & Payroll Executive', company: 'ADP India', stream: 'Human Resources', ctc: '6.2 LPA', loc: 'Hyderabad', exp: 'PF, ESI, Gratuity, SAP SuccessFactors' },
  { title: 'Learning & Development Coordinator', company: 'Wipro L&D Academy', stream: 'Human Resources', ctc: '6.5 LPA', loc: 'Chennai', exp: 'Training needs analysis, LMS admin, Certifications' },
  { title: 'Diversity & Inclusion Specialist', company: 'Google People Operations', stream: 'Human Resources', ctc: '16 LPA', loc: 'Bangalore', exp: 'D&I policy formulation, Cultural outreach, ERG groups' }
];

async function seedMassiveJobs() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'campusconnect'
  });

  console.log(`Preparing to seed ${jobsTemplate.length} jobs across multiple streams...`);

  let added = 0;
  for (const j of jobsTemplate) {
    const desc = `${j.title} position at ${j.company}. Key skills and expectations: ${j.exp}. Suitable for candidates passionate about ${j.stream} sector growth.`;
    const elig = `Minimum 60% / CGPA >= 6.0 in graduation. Degree in ${j.stream} or allied disciplines.`;
    const deadline = new Date(Date.now() + (Math.floor(Math.random() * 45) + 15) * 24 * 3600 * 1000).toISOString().slice(0, 10);

    const [existing] = await pool.query('SELECT id FROM jobs WHERE title = ? AND company = ?', [j.title, j.company]);
    if (existing.length === 0) {
      await pool.query(
        'INSERT INTO jobs (title, company, description, location, ctc, eligibility, deadline, status, stream, job_type) VALUES (?, ?, ?, ?, ?, ?, ?, "open", ?, "Full Time")',
        [j.title, j.company, desc, j.loc, j.ctc, elig, deadline, j.stream]
      );
      added++;
    }
  }

  // Update existing older jobs with suitable streams if default
  await pool.query("UPDATE jobs SET stream = 'Computer Science' WHERE stream IS NULL");
  await pool.query("UPDATE jobs SET stream = 'Computer Science' WHERE company IN ('Google', 'Amazon Web Services', 'Microsoft Azure', 'Infosys', 'Meta', 'Uber', 'Netflix', 'NVIDIA')");

  const [total] = await pool.query('SELECT COUNT(*) as count FROM jobs');
  console.log(`✅ Mass seed complete! Newly added: ${added}, Total active jobs in DB: ${total[0].count}`);
  process.exit(0);
}

seedMassiveJobs().catch(err => {
  console.error(err);
  process.exit(1);
});
