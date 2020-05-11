const fs = require('fs');
const [baseFilePath, diffFilePath] = process.argv.slice(2);

const auditRegex = /Total Tests: (\d+) Total Time: (.*)ms \((.*)\)/;

[, baseCountString, baseMillisecondCommaTimeString] = readFileFirstLine(baseFilePath).match(auditRegex);
[, diffCountString, diffMillisecondCommaTimeString] = readFileFirstLine(diffFilePath).match(auditRegex);

const baseMillisecondTimeString = parseInt(baseMillisecondCommaTimeString.replace(',', ''));
const diffMillisecondTimeString = parseInt(diffMillisecondCommaTimeString.replace(',', ''));

const countDiff = parseInt(diffCountString) - parseInt(baseCountString);
const timeDiff = diffMillisecondTimeString - baseMillisecondTimeString;

console.log(`Change in number of tests run: ${countDiff}`);
console.log(`Change in total milliseconds for tests: ${timeDiff}`);

function readFileFirstLine(path) {
  try {
    const data = fs.readFileSync(path, 'UTF-8');
    return data.split('\n')[0];
  } catch (err) {
      console.error(err);
  }
}