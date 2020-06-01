import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import matter from 'gray-matter'
import Head from 'next/head'
import Link from 'next/link'
import { MDXProvider } from '@mdx-js/react'
import hydrate from 'next-mdx-remote/hydrate'
import renderToString from 'next-mdx-remote/render-to-string'
import DocsPage from '@hashicorp/react-docs-page'
import {
  anchorLinks,
  includeMarkdown,
  paragraphCustomAlerts,
  typography,
} from '@hashicorp/remark-plugins'
import Placement from '../../components/placement-table'
import docFiles from '../../data/.tmp/docs-files'

const DEFAULT_COMPONENTS = { Placement }

const STUBBED_SIDENAV_DATA = [
  {
    layout: 'docs',
    page_title: 'Test',
    sidebar_title: 'faq',
    description: 'Test',
    __resourcePath: 'docs/faq.mdx',
  },
]
const STUBBED_ORDER = ['faq']

export default function DocsDocsPage({
  renderedContent,
  frontMatter,
  filePath,
  url,
}) {
  const hydratedContent = hydrate(renderedContent)
  return (
    <MDXProvider components={DEFAULT_COMPONENTS}>
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
          category: 'docs',
          currentPage: `/${url}`,
          data: STUBBED_SIDENAV_DATA,
          order: STUBBED_ORDER,
        }}
        resourceURL={`https://github.com/hashicorp/nomad/blob/master/website/${filePath}`}
      >
        {hydratedContent}
      </DocsPage>
    </MDXProvider>
  )
}

export async function getStaticProps({ params }) {
  const filePath = `content/docs/${params.slug.join('/')}.mdx`
  const url = `docs/${params.slug.join('/')}`
  const fileContent = (
    await promisify(fs.readFile)(`${process.cwd()}/${filePath}`)
  ).toString()

  const { content, data } = matter(fileContent)
  const renderedContent = await renderToString(content, DEFAULT_COMPONENTS, {
    remarkPlugins: [
      [includeMarkdown, { resolveFrom: path.join(process.cwd(), 'partials') }],
      anchorLinks,
      paragraphCustomAlerts,
      typography,
    ],
  })

  return {
    props: {
      renderedContent,
      frontMatter: data,
      filePath,
      url,
    },
  }
}

export async function getStaticPaths() {
  const paths = docFiles.map((filePath) => ({
    params: {
      slug: filePath.replace(/\.mdx/, '').split('/'),
    },
  }))

  return {
    paths,
    fallback: false,
  }
}
