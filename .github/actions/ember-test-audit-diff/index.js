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

const output = `A
As of ${sha.slice(0, 7)}

Change in number of tests run: ${countDiff}
Change in total milliseconds for tests: ${timeDiff}
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