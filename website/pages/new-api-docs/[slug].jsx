import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import matter from 'gray-matter'
import Head from 'next/head'
import Link from 'next/link'
import hydrate from 'next-mdx-remote/hydrate'
import renderToString from 'next-mdx-remote/render-to-string'
import DocsPage from '@hashicorp/react-docs-page'
import {
  anchorLinks,
  includeMarkdown,
  paragraphCustomAlerts,
  typography,
} from '@hashicorp/remark-plugins'
import { frontMatter as sidenavData } from '../../content/api-docs/**/*.mdx'
import order from '../../data/api-navigation.js'

sidenavData.forEach((d) => {
  d.__resourcePath = d.__resourcePath.replace(
    `${process.cwd().slice(1)}/content/`,
    ''
  )
})

export default function ApiDocsPage({
  renderedContent,
  frontMatter,
  filePath,
  url,
}) {
  const hydratedContent = hydrate(renderedContent)
  return (
    <DocsPage
      product="nomad"
      head={{
        is: Head,
        title: `${frontMatter.page_title} | Nomad by HashiCorp`,
        description: frontMatter.description,
        siteName: 'Nomad by HashiCorp',
      }}
      sidenav={{
        Link,
        category: 'api-docs',
        currentPage: `/${url}`,
        data: sidenavData,
        order,
      }}
      resourceURL={`https://github.com/hashicorp/nomad/blob/master/website/${filePath}`}
    >
      {hydratedContent}
    </DocsPage>
  )
}

export async function getStaticProps({ params }) {
  const filePath = `content/api-docs/${params.slug}.mdx`
  const url = `new-api-docs/${params.slug}`
  const fileContent = (
    await promisify(fs.readFile)(`${process.cwd()}/${filePath}`)
  ).toString()

  const { content, data } = matter(fileContent)

  const renderedContent = await renderToString(content, undefined, {
    remarkPlugins: [
      [includeMarkdown, { resolveFrom: path.join(process.cwd(), 'partials') }],
      anchorLinks,
      paragraphCustomAlerts,
      typography,
    ],
  })
  return { props: { renderedContent, frontMatter: data, filePath, url } }
}

export async function getStaticPaths() {
  const fileNames = await promisify(fs.readdir)(
    `${process.cwd()}/content/api-docs/`
  )

  const paths = fileNames.map((fileName) => ({
    params: {
      slug: fileName.replace(/\.mdx/, ''),
    },
  }))

  return {
    paths,
    fallback: false,
  }
}
