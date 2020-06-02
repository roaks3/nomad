const fs = require('fs')
const { promisify } = require('util')
const matter = require('gray-matter')

async function getAllFrontMatter() {
  const filePaths = await promisify(fs.readdir)(
    `${process.cwd()}/content/api-docs`
  )

  const files = await Promise.all(
    filePaths.map((filePath) =>
      promisify(fs.readFile)(`${process.cwd()}/content/api-docs/${filePath}`)
    )
  )

  return filePaths.map((filePath, index) => ({
    ...matter(files[index].toString()).data,
    __resourcePath: `api-docs/${filePath}`,
  }))
}

function printAllFrontMatter() {
  getAllFrontMatter().then((allFrontMatter) => {
    console.log('module.exports = [')
    allFrontMatter.forEach((frontMatter) =>
      console.log(`  ${JSON.stringify(frontMatter)},`)
    )
    console.log(']')
  })
}

printAllFrontMatter()
