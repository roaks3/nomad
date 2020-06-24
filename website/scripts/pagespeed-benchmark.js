const fetch = require('node-fetch')

const testUrl = 'https://nomadproject.io/docs/commands/deployment/promote/'

printAll()

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getLighthouseLink({
  firstContentfulPaint,
  speedIndex,
  largestContentfulPaint,
  interactive,
  totalBlockingTime,
  cumulativeLayoutShift,
  device,
  version,
}) {
  return `https://googlechrome.github.io/lighthouse/scorecalc/#first-contentful-paint=${firstContentfulPaint}&speed-index=${speedIndex}&largest-contentful-paint=${largestContentfulPaint}&interactive=${interactive}&total-blocking-time=${totalBlockingTime}&cumulative-layout-shift=${cumulativeLayoutShift}&device=${device}&version=${version}`
}

async function fetchBenchmarkStats(url, device) {
  const res = await (
    await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${url}&strategy=${device}`
    )
  ).json()

  if (!res.lighthouseResult) {
    console.log('Bad response!')
    console.log(res)
    console.log(res.error.errors)
    console.log('Trying again ...')
    await sleep(100000)
    return fetchBenchmarkStats(url, device)
  }

  const {
    firstContentfulPaint,
    speedIndex,
    largestContentfulPaint,
    interactive,
    totalBlockingTime,
    cumulativeLayoutShift,
    firstCPUIdle,
    firstMeaningfulPaint,
  } = res.lighthouseResult.audits.metrics.details.items[0]
  const version = res.lighthouseResult.lighthouseVersion

  const totalByteWeight =
    res.lighthouseResult.audits['total-byte-weight'].numericValue
  const serverResponseTime =
    res.lighthouseResult.audits['server-response-time'].numericValue
  const bootupTime =
    res.lighthouseResult.audits['bootup-time'].details.summary.wastedMs

  return {
    firstContentfulPaint,
    speedIndex,
    largestContentfulPaint,
    interactive,
    totalBlockingTime,
    cumulativeLayoutShift,
    firstCPUIdle,
    firstMeaningfulPaint,
    version,
    totalByteWeight,
    serverResponseTime,
    bootupTime,
  }
}

function formatStatResults(results) {
  const avg = results.reduce((sum, val) => sum + val, 0) / results.length
  const roundedAvg = Math.round(avg)

  return `${roundedAvg} - [${results.join(', ')}]`
}

function formatFieldResults(field, allStats, fieldAlias) {
  return `${fieldAlias || field} - ${formatStatResults(
    allStats.map((stats) => stats[field]).filter((val) => val !== undefined)
  )}`
}

async function printBenchmark(url, device) {
  console.log(`Benchmarks for: ${url} on ${device}`)

  const stats1 = await fetchBenchmarkStats(url, device)
  await sleep(100000)
  const stats2 = await fetchBenchmarkStats(url, device)
  await sleep(100000)
  const stats3 = await fetchBenchmarkStats(url, device)

  console.log(
    getLighthouseLink({
      ...stats1,
      device,
    })
  )
  console.log(
    getLighthouseLink({
      ...stats2,
      device,
    })
  )
  console.log(
    getLighthouseLink({
      ...stats3,
      device,
    })
  )
  console.log()
  console.log(
    formatFieldResults('serverResponseTime', [stats1, stats2, stats3], 'TTFB')
  )
  console.log(
    formatFieldResults(
      'largestContentfulPaint',
      [stats1, stats2, stats3],
      'LCP'
    )
  )
  console.log(
    formatFieldResults('totalBlockingTime', [stats1, stats2, stats3], 'TBT')
  )
  console.log()
}

async function printAll() {
  await printBenchmark(testUrl, 'desktop')
  await sleep(100000)
  await printBenchmark(testUrl, 'mobile')
}
