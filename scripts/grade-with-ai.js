#!/usr/bin/env node

/*
Hybrid Grade Script (JS)
- Runs lightweight local checks (HTMLHint, markdownlint)
- For textual analysis, calls OpenAI if OPENAI_API_KEY is available
- Outputs grading.json in the repo root suitable for posting as PR comment

Notes:
- Place student content under conventional folders:
  - Web assignments: any .html under repo root or src/
  - Articles / reflections: .md files under 'articles/' or 'posts/'

Environment:
- OPENAI_API_KEY (optional) — if present, script calls OpenAI for deep analysis
- GITHUB_EVENT_PATH (optional) — path to GitHub event JSON (workflow)
*/

import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import process from 'process';
import { fileURLToPath } from 'url';

// OpenAI client (only imported/used if key present)
let OpenAI;
try {
  OpenAI = (await import('openai')).default;
} catch (e) {
  // Not fatal — will fallback
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rubric = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'rubric.json'), 'utf8'));

function runLocalHtmlHint() {
  try {
    // Run htmlhint via npx; collect results as text
    const out = execSync('npx htmlhint "**/*.html" --format json', { encoding: 'utf8', stdio: 'pipe' });
    return JSON.parse(out);
  } catch (err) {
    // If htmlhint returns non-zero, it still prints JSON to stdout sometimes; fallback to parse when possible
    try {
      const txt = err.stdout?.toString();
      if (txt) return JSON.parse(txt);
    } catch (e) {}
    return {};
  }
}

function runMarkdownLint(files) {
  try {
    const args = files.map(f => `"${f}"`).join(' ');
    const out = execSync(`npx markdownlint ${args} --json`, { encoding: 'utf8', stdio: 'pipe' });
    // markdownlint prints issues as JSON object
    try { return JSON.parse(out); } catch(e) { return {}; }
  } catch (err) {
    try { return JSON.parse(err.stdout); } catch(e) { return {}; }
  }
}

async function analyzeTextWithOpenAI(text, roleHint) {
  const key = process.env.OPENAI_API_KEY;
  if (!key || !OpenAI) return null;

  const client = new OpenAI({ apiKey: key });

  const prompt = `You are an objective academic grader. Evaluate the following student text according to these rubrics: \n
1) Factual accuracy (0-30)\n2) Structure & clarity (0-25)\n3) References & citations (0-20)\n4) Language & ethics (0-15)\n5) Originality (0-10)\n
Provide JSON output: { "factual":int, "structure":int, "references":int, "language":int, "originality":int, "feedback":string }\n\nText:\n${text}`;

  const resp = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'system', content: 'You are an academic grader.' }, { role: 'user', content: prompt }],
    max_tokens: 600
  });

  const content = resp.choices?.[0]?.message?.content || resp.choices?.[0]?.text;
  try {
    // try to extract JSON from reply
    const jsonStart = content.indexOf('{');
    const jsonText = content.slice(jsonStart);
    return JSON.parse(jsonText);
  } catch (e) {
    return { error: 'OpenAI parse error', raw: content };
  }
}

function simpleHeuristicTextScore(text) {
  // fallback if no OpenAI key: score by length, presence of "References" or "Daftar Pustaka"
  const words = text.split(/\s+/).filter(Boolean).length;
  const refs = /references|daftar pustaka|sumber/i.test(text) ? 1 : 0;

  const factual = Math.min(30, Math.round(words / 20));
  const structure = Math.min(25, Math.round(words / 30));
  const references = Math.min(20, refs ? 18 : 6);
  const language = Math.min(15, Math.round(words / 100));
  const originality = Math.min(10, refs ? 8 : 6);

  return {
    factual, structure, references, language, originality,
    feedback: 'Fallback auto-score (no OpenAI key). Add more references and structure for higher score.'
  };
}

function computeHtmlScore(htmlhintResults) {
  // htmlhintResults example: { "file.html": [{ rule }, ...] }
  const files = Object.keys(htmlhintResults || {});
  if (!files.length) return { score: 20, details: 'No HTML files detected or no issues found.' };
  let totalIssues = 0;
  files.forEach(f => { const issues = htmlhintResults[f] || []; totalIssues += issues.length; });
  // heuristic: fewer issues -> higher score (max 25)
  const score = Math.max(0, 25 - totalIssues * 2);
  return { score, details: `${totalIssues} htmlhint issues across ${files.length} file(s).` };
}

function computeAccessibilityScore(files) {
  // simple checks: images have alt attributes? check naive by searching for <img ...>
  let issues = 0; let imgs = 0;
  files.forEach(file => {
    try {
      const txt = fs.readFileSync(file, 'utf8');
      const matches = txt.match(/<img\s+[^>]*>/gi) || [];
      imgs += matches.length;
      matches.forEach(m => { if (!/alt=/.test(m)) issues++; });
    } catch(e){}
  });
  const score = imgs === 0 ? 20 : Math.max(0, Math.round(20 * (1 - issues / Math.max(1, imgs))));
  return { score, details: `${imgs} images; ${issues} missing alt attributes.` };
}

function computeGitCollabScore() {
  // naive: check commits count and PR files
  try {
    const log = execSync('git rev-list --count HEAD', { encoding: 'utf8' }).trim();
    const commits = parseInt(log || '0', 10);
    // score out of 10
    const score = Math.min(10, Math.round(Math.log10(Math.max(1, commits)) * 3 + Math.min(commits, 5)));
    return { score, details: `${commits} commit(s) in history.` };
  } catch (e) {
    return { score: 5, details: 'Could not determine commit count.' };
  }
}

async function main() {
  const repoRoot = path.join(__dirname, '..');
  // find markdown files in articles/ or posts/
  const mdFiles = [];
  ['articles', 'posts', 'content'].forEach(dir => {
    const p = path.join(repoRoot, dir);
    if (fs.existsSync(p) && fs.statSync(p).isDirectory()) {
      const files = fs.readdirSync(p).filter(f => f.endsWith('.md')).map(f => path.join(p, f));
      mdFiles.push(...files);
    }
  });

  // find html files
  const htmlFiles = [];
  function walk(dir) {
    const items = fs.readdirSync(dir);
    items.forEach(it => {
      const full = path.join(dir, it);
      if (fs.statSync(full).isDirectory()) {
        if (['node_modules', '.git', '.github'].includes(it)) return;
        walk(full);
      } else {
        if (full.endsWith('.html')) htmlFiles.push(full);
      }
    });
  }
  walk(repoRoot);

  // Run local HTMLHint
  let htmlhintResults = {};
  try { htmlhintResults = runLocalHtmlHint(); } catch (e) { htmlhintResults = {}; }
  const htmlScoreObj = computeHtmlScore(htmlhintResults);

  // Accessibility (simple image alt check)
  const accessibility = computeAccessibilityScore(htmlFiles);

  // Git collaboration
  const gitCollab = computeGitCollabScore();

  // Text analysis per markdown file
  const textAnalyses = [];
  for (const mf of mdFiles) {
    const content = fs.readFileSync(mf, 'utf8');
    let analysis = null;
    try {
      analysis = await analyzeTextWithOpenAI(content, 'article');
    } catch (e) {
      analysis = null;
    }
    if (!analysis) analysis = simpleHeuristicTextScore(content);
    textAnalyses.push({ file: path.relative(repoRoot, mf), analysis });
  }

  // Combine scores with rubric weights
  const weights = rubric.tasks;
  const scores = {};

  const writingAvg = textAnalyses.length ? Math.round(textAnalyses.reduce((s,a)=>s + (a.analysis.factual + a.analysis.structure + a.analysis.references + a.analysis.language + a.analysis.originality), 0) / (textAnalyses.length * (30+25+20+15+10)) * 100) : 0;
  // map to rubric sub-scores (normalize to rubric weights)
  scores.web_structure = Math.round(htmlScoreObj.score / 25 * weights.web_structure.weight);
  scores.accessibility = Math.round(accessibility.score / 20 * weights.accessibility.weight);
  scores.writing_quality = Math.round(writingAvg / 100 * weights.writing_quality.weight);
  // originality: use average of originality field if present
  const originalityAvg = textAnalyses.length ? Math.round(textAnalyses.reduce((s,a)=>s + (a.analysis.originality || 0),0) / textAnalyses.length) : 0;
  scores.originality = Math.round(originalityAvg / 10 * weights.originality.weight);
  scores.git_collaboration = Math.round(gitCollab.score / 10 * weights.git_collaboration.weight);

  const total = Object.values(scores).reduce((a,b)=>a+b,0);

  const output = {
    summary: {
      total_score: total,
      breakdown: scores,
      details: {
        htmlhint: htmlScoreObj.details,
        accessibility: accessibility.details,
        git: gitCollab.details,
        text_files_evaluated: textAnalyses.map(t => ({ file: t.file, score: t.analysis }))
      }
    }
  };

  fs.writeFileSync(path.join(repoRoot, 'grading.json'), JSON.stringify(output, null, 2));
  console.log('Grading completed. Output: grading.json');
}

main().catch(err => { console.error(err); process.exit(0); });