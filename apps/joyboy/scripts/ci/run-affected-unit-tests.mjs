import { spawnSync } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const workspaceRoot = process.cwd();
const reportsDir = path.resolve(process.env.UNIT_TEST_REPORT_DIR || 'artifacts/affected-unit-tests');
const resultsDir = path.join(reportsDir, 'results');
const commentPath = path.join(reportsDir, 'comment.md');
const summaryPath = path.join(reportsDir, 'job-summary.md');
const jsonSummaryPath = path.join(reportsDir, 'summary.json');
const changedFilesPath = process.env.CHANGED_FILES_PATH;

mkdirSync(resultsDir, { recursive: true });

const projectMap = collectProjects(workspaceRoot);
const changedFiles = readChangedFiles(changedFilesPath);
const selection = selectRelatedSpecFiles(changedFiles);

const report = {
  advisoryOnly: true,
  changedFiles,
  directSpecFiles: selection.directSpecFiles,
  matchedSpecFiles: selection.matchedSpecFiles,
  relatedSpecFiles: selection.relatedSpecFiles,
  unmatchedSourceFiles: selection.unmatchedSourceFiles,
  unsupportedSpecFiles: selection.unsupportedSpecFiles,
  testedProjects: [],
  skippedProjects: [],
  failedProjects: [],
  totals: {
    changedFiles: changedFiles.length,
    directSpecFiles: selection.directSpecFiles.length,
    matchedSpecFiles: selection.matchedSpecFiles.length,
    relatedSpecFiles: selection.relatedSpecFiles.length,
    jestProjects: 0,
    skippedProjects: 0,
    failedProjects: 0,
    passedProjects: 0,
    totalSuites: 0,
    passedSuites: 0,
    failedSuites: 0,
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    pendingTests: 0,
  },
};

for (const relatedSpec of selection.relatedSpecFiles) {
  const project = findOwningProject(projectMap, relatedSpec);
  if (!project) {
    report.skippedProjects.push({
      name: relatedSpec,
      reason: 'owning project not found',
    });
    continue;
  }

  const testTarget = project.config.targets?.test;
  if (!testTarget) {
    report.skippedProjects.push({
      name: project.config.name,
      reason: 'no test target',
    });
    continue;
  }

  if (testTarget.executor !== '@nx/jest:jest') {
    report.skippedProjects.push({
      name: project.config.name,
      reason: `unsupported executor: ${testTarget.executor || 'unknown'}`,
    });
    continue;
  }

  const jestConfig = testTarget.options?.jestConfig;
  if (!jestConfig) {
    report.skippedProjects.push({
      name: project.config.name,
      reason: 'missing jestConfig',
    });
    continue;
  }

  const existingGroup = report.testedProjects.find((item) => item.name === project.config.name);
  if (existingGroup) {
    existingGroup.specFiles.push(relatedSpec);
    continue;
  }

  report.testedProjects.push({
    name: project.config.name,
    jestConfig,
    specFiles: [relatedSpec],
  });
}

for (const group of report.testedProjects) {
  const outputFile = path.join(resultsDir, `${group.name}.json`);
  const run = spawnSync(
    'pnpm',
    [
      'exec',
      'jest',
      '--config',
      group.jestConfig,
      '--runInBand',
      '--json',
      '--outputFile',
      outputFile,
      '--passWithNoTests',
      '--runTestsByPath',
      ...group.specFiles,
    ],
    {
      cwd: workspaceRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        CI: 'true',
      },
      maxBuffer: 1024 * 1024 * 50,
    }
  );

  const rawResult = existsSync(outputFile) ? JSON.parse(readFileSync(outputFile, 'utf8')) : null;
  const result = normalizeProjectResult(group.name, group.jestConfig, group.specFiles, run, rawResult);
  Object.assign(group, result);
  report.totals.jestProjects += 1;
  report.totals.totalSuites += group.numTotalTestSuites;
  report.totals.passedSuites += group.numPassedTestSuites;
  report.totals.failedSuites += group.numFailedTestSuites;
  report.totals.totalTests += group.numTotalTests;
  report.totals.passedTests += group.numPassedTests;
  report.totals.failedTests += group.numFailedTests;
  report.totals.pendingTests += group.numPendingTests;

  if (group.status === 'FAIL') {
    report.failedProjects.push(group);
    report.totals.failedProjects += 1;
  } else {
    report.totals.passedProjects += 1;
  }
}

report.totals.skippedProjects = report.skippedProjects.length;

const markdown = renderMarkdown(report);
writeFileSync(commentPath, markdown);
writeFileSync(summaryPath, markdown);
writeFileSync(jsonSummaryPath, JSON.stringify(report, null, 2) + '\n');

if (report.totals.failedProjects > 0) {
  process.exitCode = 1;
}

function readChangedFiles(filePath) {
  if (!filePath || !existsSync(filePath)) {
    return [];
  }

  return readFileSync(filePath, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function collectProjects(root) {
  const projectFiles = [];
  for (const topLevel of ['apps', 'libs', 'tools']) {
    const fullPath = path.join(root, topLevel);
    if (existsSync(fullPath)) {
      walkForProjectJson(fullPath, projectFiles);
    }
  }

  const projects = new Map();
  for (const filePath of projectFiles) {
    const config = parseJsonc(readFileSync(filePath, 'utf8'));
    if (config.name) {
      projects.set(config.name, {
        config,
        path: filePath,
      });
    }
  }
  return projects;
}

function findOwningProject(projects, filePath) {
  let matchedProject = null;

  for (const project of projects.values()) {
    const sourceRoot = project.config.sourceRoot;
    if (!sourceRoot) continue;

    const normalizedSourceRoot = `${sourceRoot}/`;
    if (filePath.startsWith(normalizedSourceRoot) || filePath === sourceRoot) {
      if (!matchedProject || sourceRoot.length > matchedProject.config.sourceRoot.length) {
        matchedProject = project;
      }
    }
  }

  return matchedProject;
}

function walkForProjectJson(dirPath, acc) {
  for (const entry of readdirSync(dirPath, { withFileTypes: true })) {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walkForProjectJson(entryPath, acc);
    } else if (entry.isFile() && entry.name === 'project.json') {
      acc.push(entryPath);
    }
  }
}

function parseJsonc(source) {
  return Function(`"use strict"; return (${source});`)();
}

function selectRelatedSpecFiles(changedFiles) {
  const directSpecFiles = [];
  const matchedSpecFiles = [];
  const relatedSpecFiles = new Set();
  const unmatchedSourceFiles = [];
  const unsupportedSpecFiles = [];

  for (const filePath of changedFiles) {
    if (isUnitSpecFile(filePath)) {
      if (existsSync(path.resolve(workspaceRoot, filePath))) {
        directSpecFiles.push(filePath);
        relatedSpecFiles.add(filePath);
      }
      continue;
    }

    if (isSpecLikeFile(filePath)) {
      unsupportedSpecFiles.push(filePath);
      continue;
    }

    if (!isSupportedSourceFile(filePath)) {
      continue;
    }

    const related = findSameFolderSpec(filePath);
    if (related.length === 0) {
      unmatchedSourceFiles.push(filePath);
      continue;
    }

    matchedSpecFiles.push(...related);
    for (const specFile of related) {
      relatedSpecFiles.add(specFile);
    }
  }

  return {
    directSpecFiles: unique(directSpecFiles),
    matchedSpecFiles: unique(matchedSpecFiles),
    relatedSpecFiles: Array.from(relatedSpecFiles),
    unmatchedSourceFiles: unique(unmatchedSourceFiles),
    unsupportedSpecFiles: unique(unsupportedSpecFiles),
  };
}

function isUnitSpecFile(filePath) {
  return /\.(spec)\.(ts|tsx)$/.test(filePath);
}

function isSpecLikeFile(filePath) {
  return /\.(spec)\./.test(filePath);
}

function isSupportedSourceFile(filePath) {
  return /\.(ts|tsx|js|jsx)$/.test(filePath) && !/\.d\.ts$/.test(filePath);
}

function findSameFolderSpec(sourceFilePath) {
  const absoluteSourcePath = path.resolve(workspaceRoot, sourceFilePath);
  const directory = path.dirname(absoluteSourcePath);
  const extension = path.extname(sourceFilePath);
  const fileName = path.basename(sourceFilePath, extension);
  const baseNames = unique([fileName, stripPresentationSuffix(fileName)]);
  const candidates = [];

  for (const baseName of baseNames) {
    if (!baseName) continue;
    for (const specExtension of ['.spec.ts', '.spec.tsx']) {
      const absoluteCandidate = path.join(directory, `${baseName}${specExtension}`);
      if (existsSync(absoluteCandidate)) {
        candidates.push(path.relative(workspaceRoot, absoluteCandidate));
      }
    }
  }

  return unique(candidates);
}

function stripPresentationSuffix(fileName) {
  return fileName.replace(/\.(server|client)$/, '');
}

function unique(items) {
  return Array.from(new Set(items));
}

function normalizeProjectResult(projectName, jestConfig, specFiles, run, rawResult) {
  const result = {
    name: projectName,
    jestConfig,
    specFiles,
    status: run.status === 0 ? 'PASS' : 'FAIL',
    numTotalTestSuites: rawResult?.numTotalTestSuites ?? 0,
    numPassedTestSuites: rawResult?.numPassedTestSuites ?? 0,
    numFailedTestSuites: rawResult?.numFailedTestSuites ?? 0,
    numTotalTests: rawResult?.numTotalTests ?? 0,
    numPassedTests: rawResult?.numPassedTests ?? 0,
    numFailedTests: rawResult?.numFailedTests ?? 0,
    numPendingTests: rawResult?.numPendingTests ?? 0,
    failedSuites: [],
  };

  if (Array.isArray(rawResult?.testResults)) {
    result.failedSuites = rawResult.testResults
      .filter((suite) => suite.status === 'failed')
      .map((suite) => ({
        name: path.relative(workspaceRoot, suite.name),
        message: extractFailureMessage(suite.message),
      }));
  }

  if (!rawResult && run.stderr) {
    result.failedSuites.push({
      name: path.relative(workspaceRoot, jestConfig),
      message: extractFailureMessage(run.stderr),
    });
  }

  return result;
}

function extractFailureMessage(message = '') {
  return message
    .split('\n')
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .slice(0, 6)
    .join('\n');
}

function renderMarkdown(report) {
  const lines = [
    '## Affected Unit Test Report',
    '',
    '> Advisory only: this report does not block PR merge.',
    '',
    '| Metric | Value |',
    '|--------|-------|',
    `| Changed files | ${report.totals.changedFiles} |`,
    `| Direct spec files changed | ${report.totals.directSpecFiles} |`,
    `| Same-folder matched spec files | ${report.totals.matchedSpecFiles} |`,
    `| Related spec files run | ${report.totals.relatedSpecFiles} |`,
    `| Jest projects run | ${report.totals.jestProjects} |`,
    `| Passed projects | ${report.totals.passedProjects} |`,
    `| Failed projects | ${report.totals.failedProjects} |`,
    `| Skipped projects | ${report.totals.skippedProjects} |`,
    `| Test suites | ${report.totals.passedSuites}/${report.totals.totalSuites} passed |`,
    `| Test cases | ${report.totals.passedTests}/${report.totals.totalTests} passed |`,
  ];

  if (report.relatedSpecFiles.length === 0) {
    lines.push(
      '',
      'No related unit test files were found for this PR. This workflow only runs direct spec changes or same-folder same-name spec files.'
    );
    if (report.unmatchedSourceFiles.length > 0) {
      lines.push(
        '',
        '<details>',
        `<summary>Changed source files without same-folder tests (${report.unmatchedSourceFiles.length})</summary>`,
        ''
      );
      for (const filePath of report.unmatchedSourceFiles) {
        lines.push(`- \`${filePath}\``);
      }
      lines.push('', '</details>');
    }
    if (report.unsupportedSpecFiles.length > 0) {
      lines.push(
        '',
        '<details>',
        `<summary>Changed spec files skipped by unit-test report (${report.unsupportedSpecFiles.length})</summary>`,
        ''
      );
      for (const filePath of report.unsupportedSpecFiles) {
        lines.push(`- \`${filePath}\``);
      }
      lines.push('', '</details>');
    }
    return lines.join('\n') + '\n';
  }

  lines.push('', '| Project | Status | Specs | Suites | Tests |', '|---------|--------|-------|--------|-------|');

  for (const result of report.testedProjects) {
    lines.push(
      `| \`${result.name}\` | ${result.status} | ${result.specFiles.length} | ${result.numPassedTestSuites}/${result.numTotalTestSuites} | ${result.numPassedTests}/${result.numTotalTests} |`
    );
  }

  lines.push('', '<details>', `<summary>Related spec files (${report.relatedSpecFiles.length})</summary>`, '');
  for (const filePath of report.relatedSpecFiles) {
    lines.push(`- \`${filePath}\``);
  }
  lines.push('', '</details>');

  if (report.unmatchedSourceFiles.length > 0) {
    lines.push(
      '',
      '<details>',
      `<summary>Changed source files without same-folder tests (${report.unmatchedSourceFiles.length})</summary>`,
      ''
    );
    for (const filePath of report.unmatchedSourceFiles) {
      lines.push(`- \`${filePath}\``);
    }
    lines.push('', '</details>');
  }

  if (report.skippedProjects.length > 0) {
    lines.push('', '<details>', `<summary>Skipped projects (${report.skippedProjects.length})</summary>`, '');
    for (const project of report.skippedProjects) {
      lines.push(`- \`${project.name}\`: ${project.reason}`);
    }
    lines.push('', '</details>');
  }

  if (report.failedProjects.length > 0) {
    lines.push('', '<details open>', `<summary>Failed suites (${report.failedProjects.length} projects)</summary>`, '');
    for (const project of report.failedProjects) {
      lines.push(`### \`${project.name}\``);
      for (const suite of project.failedSuites) {
        lines.push(`- \`${suite.name}\``);
        if (suite.message) {
          lines.push('', '```text', suite.message, '```');
        }
      }
      lines.push('');
    }
    lines.push('</details>');
  }

  return lines.join('\n') + '\n';
}
