const fs = require('fs');
const [baseFilePath, diffFilePath, sha] = process.argv.slice(2);

const baseReport = JSON.parse(fs.readFileSync(baseFilePath));
const diffReport = JSON.parse(fs.readFileSync(diffFilePath));

const baseCount = baseReport.passes + baseReport.failures + baseReport.flaky;
const diffCount = diffReport.passes + diffReport.failures + diffReport.flaky;

const countDiff = diffCount - baseCount;
const timeDiff = diffReport.duration - baseReport.duration;

console.log(`Change in number of tests run: ${countDiff}`);
console.log(`Change in total milliseconds for tests: ${timeDiff}`);

const output = `
As of ${sha.slice(0, 7)}

|               | base                   | ${sha.slice(0, 7)}     | change                                       |
|---------------|------------------------|------------------------|----------------------------------------------|
| passes        | ${baseReport.passes}   | ${diffReport.passes}   | ${diffReport.passes - baseReport.passes}     |
| failures      | ${baseReport.failures} | ${diffReport.failures} | ${diffReport.failures - baseReport.failures} |
| flaky         | ${baseReport.flaky}    | ${diffReport.flaky}    | ${diffReport.flaky - baseReport.flaky}       |
| duration (ms) | ${baseReport.duration} | ${diffReport.duration} | ${diffReport.duration - baseReport.duration} |
`;

fs.writeFileSync('audit-diff.txt', output);

function readFileFirstLine(path) {
  try {
    const data = fs.readFileSync(path, 'UTF-8');
    return data.split('\n')[0];
  } catch (err) {
      console.error(err);
  }
}