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
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice. Return the indices in any order.`,
    examples: [
      { input: 'nums = [2, 7, 11, 15], target = 9', output: '[0, 1]' },
      { input: 'nums = [3, 2, 4], target = 6', output: '[1, 2]' },
      { input: 'nums = [3, 3], target = 6', output: '[0, 1]' }
    ],
    starterCode: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
    starterCodePython: `def two_sum(nums, target):
    lookup = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in lookup:
            return [lookup[diff], i]
        lookup[num] = i
    return []`,
    testCases: [
      { input: [[2, 7, 11, 15], 9], expected: [0, 1], display: 'nums = [2, 7, 11, 15], target = 9' },
      { input: [[3, 2, 4], 6], expected: [1, 2], display: 'nums = [3, 2, 4], target = 6' },
      { input: [[3, 3], 6], expected: [0, 1], display: 'nums = [3, 3], target = 6' }
    ]
  },
  {
    id: 'valid-palindrome',
    title: 'Valid Palindrome String',
    difficulty: 'Easy',
    stream: 'Computer Science',
    description: `A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.\n\nAlphanumeric characters include letters and numbers. Empty strings or single space strings are valid palindromes.`,
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: 'true' },
      { input: 's = "race a car"', output: 'false' },
      { input: 's = " "', output: 'true' }
    ],
    starterCode: `function isPalindrome(s) {
  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned === cleaned.split('').reverse().join('');
}`,
    starterCodePython: `def is_palindrome(s):
    cleaned = "".join(c.lower() for c in s if c.isalnum())
    return cleaned == cleaned[::-1]`,
    testCases: [
      { input: ['A man, a plan, a canal: Panama'], expected: true, display: 's = "A man, a plan, a canal: Panama"' },
      { input: ['race a car'], expected: false, display: 's = "race a car"' },
      { input: [' '], expected: true, display: 's = " "' }
    ]
  },
  {
    id: 'fibonacci-dp',
    title: 'N-th Fibonacci Number (DP)',
    difficulty: 'Medium',
    stream: 'Computer Science',
    description: `The Fibonacci numbers, commonly denoted F(n) form a sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1.\n\nGiven an integer n, calculate F(n).\nExample: F(4) = F(3) + F(2) = 2 + 1 = 3.`,
    examples: [
      { input: 'n = 2', output: '1' },
      { input: 'n = 4', output: '3' },
      { input: 'n = 10', output: '55' }
    ],
    starterCode: `function fib(n) {
  if (n <= 1) return n;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    const temp = a + b;
    a = b;
    b = temp;
  }
  return b;
}`,
    starterCodePython: `def fib(n):
    if n <= 1: return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b`,
    testCases: [
      { input: [2], expected: 1, display: 'n = 2' },
      { input: [4], expected: 3, display: 'n = 4' },
      { input: [10], expected: 55, display: 'n = 10' }
    ]
  }
];

// ---- GET /api/assessment/problems — Get challenge questions ----
router.get('/problems', async (req, res) => {
  res.json(SAMPLE_PROBLEMS);
});

// ---- POST /api/assessment/submit — Submit test results ----
router.post('/submit', verifyToken, async (req, res) => {
  const {
    job_id = null,
    problem_title,
    language = 'javascript',
    code_submitted = '',
    test_cases_passed,
    total_test_cases,
    execution_time_ms = 45
  } = req.body;

  if (!problem_title) {
    return res.status(400).json({ message: 'Problem title is required' });
  }

  const passed = Number(test_cases_passed) || 0;
  const total = Number(total_test_cases) || 1;
  const scorePercent = Math.round((passed / total) * 100);

  try {
    const [subRes] = await db.query(
      `INSERT INTO assessment_submissions 
       (student_id, job_id, problem_title, language, code_submitted, test_cases_passed, total_test_cases, score_percent, execution_time_ms) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, job_id || null, problem_title, language, code_submitted, passed, total, scorePercent, execution_time_ms]
    );

    // If job_id was specified, link with student application evaluation
    if (job_id) {
      const [apps] = await db.query(
        'SELECT id FROM applications WHERE student_id = ? AND job_id = ?',
        [req.user.id, job_id]
      );

      if (apps.length > 0) {
        const appId = apps[0].id;
        const ratingOutOf5 = Math.max(1, Math.min(5, Math.round((scorePercent / 100) * 5)));
        const notes = `Automated Online Coding Assessment: ${passed}/${total} test cases passed (${scorePercent}%).`;

        const [existingEval] = await db.query(
          'SELECT id FROM candidate_evaluations WHERE application_id = ?',
          [appId]
        );

        if (existingEval.length > 0) {
          await db.query(
            `UPDATE candidate_evaluations 
             SET technical_score = ?, problem_solving_score = ?,
                 feedback_notes = TRIM(BOTH '\n' FROM CONCAT(COALESCE(feedback_notes, ''), '\n', ?))
             WHERE application_id = ?`,
            [ratingOutOf5, ratingOutOf5, notes, appId]
          );
        } else {
          const [evalUsers] = await db.query(
            "SELECT id FROM users WHERE role IN ('admin', 'recruiter') ORDER BY id ASC LIMIT 1"
          );
          const recruiterId = evalUsers[0]?.id || req.user.id;
          await db.query(
            `INSERT INTO candidate_evaluations 
             (application_id, recruiter_id, technical_score, communication_score, problem_solving_score, recommendation, feedback_notes)
             VALUES (?, ?, ?, 4, ?, ?, ?)`,
            [appId, recruiterId, ratingOutOf5, ratingOutOf5, scorePercent >= 70 ? 'hire' : 'hold', notes]
          );
        }
      }
    }

    res.status(201).json({
      message: '✅ Assessment submitted successfully!',
      submissionId: subRes.insertId,
      score_percent: scorePercent,
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
       LEFT JOIN jobs j ON s.job_id = j.id 
       WHERE s.student_id = ? 
       ORDER BY s.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching submissions', error: err.message });
  }
});

module.exports = router;