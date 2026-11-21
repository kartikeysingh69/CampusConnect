// routes/assessment.js — In-Browser Online Coding & Technical Assessment APIs
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth');
const { sendNotification } = require('./notifications');

const SAMPLE_PROBLEMS = [
  {
    id: 'two-sum',
    title: 'Two Sum Problem',
    difficulty: 'Easy',
    stream: 'Computer Science',
    description: `Given an array of integers 'nums' and an integer 'target', return indices of the two numbers such that they add up to target.\n\nExample 1:\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].`,
    starterCode: {
      javascript: `function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}`,
      python: `def two_sum(nums, target):\n    lookup = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in lookup:\n            return [lookup[diff], i]\n        lookup[num] = i\n    return []`
    },
    testCases: [
      { input: 'nums = [2, 7, 11, 15], target = 9', expected: '[0, 1]' },
      { input: 'nums = [3, 2, 4], target = 6', expected: '[1, 2]' },
      { input: 'nums = [3, 3], target = 6', expected: '[0, 1]' }
    ]
  },
  {
    id: 'valid-palindrome',
    title: 'Valid Palindrome String',
    difficulty: 'Easy',
    stream: 'Computer Science',
    description: `A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.\n\nExample:\nInput: s = "A man, a plan, a canal: Panama"\nOutput: true`,
    starterCode: {
      javascript: `function isPalindrome(s) {\n  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');\n  return cleaned === cleaned.split('').reverse().join('');\n}`,
      python: `def is_palindrome(s):\n    cleaned = "".join(c.lower() for c in s if c.isalnum())\n    return cleaned == cleaned[::-1]`
    },
    testCases: [
      { input: 's = "race a car"', expected: 'false' },
      { input: 's = "A man, a plan, a canal: Panama"', expected: 'true' },
      { input: 's = " "', expected: 'true' }
    ]
  },
  {
    id: 'fibonacci-dp',
    title: 'N-th Fibonacci Number (DP)',
    difficulty: 'Medium',
    stream: 'Computer Science',
    description: `The Fibonacci numbers, commonly denoted F(n) form a sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1.\nGiven n, calculate F(n).\n\nExample:\nInput: n = 4\nOutput: 3`,
    starterCode: {
      javascript: `function fib(n) {\n  if (n <= 1) return n;\n  let a = 0, b = 1;\n  for (let i = 2; i <= n; i++) {\n    const temp = a + b;\n    a = b;\n    b = temp;\n  }\n  return b;\n}`,
      python: `def fib(n):\n    if n <= 1: return n\n    a, b = 0, 1\n    for _ in range(2, n + 1):\n        a, b = b, a + b\n    return b`
    },
    testCases: [
      { input: 'n = 2', expected: '1' },
      { input: 'n = 4', expected: '3' },
      { input: 'n = 10', expected: '55' }
    ]
  }
];

// ---- GET /api/assessment/problems — Get challenge questions ----
router.get('/problems', async (req, res) => {
  res.json({ problems: SAMPLE_PROBLEMS });
});

// ---- POST /api/assessment/submit — Submit test results ----
router.post('/submit', verifyToken, async (req, res) => {
  const {
    job_id,
    problem_title,
    language,
    code_submitted,
    test_cases_passed,
    total_test_cases,
    execution_time_ms = 45
  } = req.body;

  if (!job_id || !problem_title) {
    return res.status(400).json({ message: 'Missing job ID or problem title' });
  }

  const passed = Number(test_cases_passed) || 0;
  const total = Number(total_test_cases) || 1;
  const scorePercent = Math.round((passed / total) * 100);

  try {
    const [subRes] = await db.query(
      `INSERT INTO assessment_submissions 
       (student_id, job_id, problem_title, language, code_submitted, test_cases_passed, total_test_cases, score_percent, execution_time_ms) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, job_id, problem_title, language || 'javascript', code_submitted || '', passed, total, scorePercent, execution_time_ms]
    );

    // Link with student application if exists
    const [apps] = await db.query(
      'SELECT id FROM applications WHERE student_id = ? AND job_id = ?',
      [req.user.id, job_id]
    );

    if (apps.length > 0) {
      const appId = apps[0].id;
      // Convert 0-100% to 1-5 rating
      const ratingOutOf5 = Math.max(1, Math.min(5, Math.round((scorePercent / 100) * 5)));
      
      // Auto-upsert into candidate_evaluations
      const [existingEval] = await db.query(
        'SELECT id FROM candidate_evaluations WHERE application_id = ? AND recruiter_id = 1',
        [appId]
      );

      const notes = `Automated Online Coding Assessment: ${problem_title} (${passed}/${total} test cases passed, ${scorePercent}%, Execution time: ${execution_time_ms}ms).`;

      if (existingEval.length > 0) {
        await db.query(
          'UPDATE candidate_evaluations SET technical_score = ?, feedback_notes = CONCAT(IFNULL(feedback_notes,""), ?) WHERE id = ?',
          [ratingOutOf5, ` | ${notes}`, existingEval[0].id]
        );
      } else {
        await db.query(
          `INSERT INTO candidate_evaluations 
           (application_id, recruiter_id, technical_score, communication_score, problem_solving_score, recommendation, feedback_notes) 
           VALUES (?, 1, ?, 4, ?, ?, ?)`,
          [appId, ratingOutOf5, ratingOutOf5, scorePercent >= 70 ? 'hire' : 'hold', notes]
        );
      }
    }

    res.status(201).json({
      message: '✅ Assessment submitted and evaluated!',
      submissionId: subRes.insertId,
      scorePercent,
      test_cases_passed: passed,
      total_test_cases: total
    });
  } catch (err) {
    res.status(500).json({ message: 'Error submitting assessment', error: err.message });
  }
});

// ---- GET /api/assessment/my — Get student's past submissions ----
router.get('/my', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT s.*, j.title as job_title, j.company 
       FROM assessment_submissions s 
       JOIN jobs j ON s.job_id = j.id 
       WHERE s.student_id = ? 
       ORDER BY s.created_at DESC`,
      [req.user.id]
    );
    res.json({ submissions: rows });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching submissions', error: err.message });
  }
});

module.exports = router;
