import path from 'path'
import matter from 'gray-matter'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import highlight from '@mapbox/rehype-prism'
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
import sidenavData from '../../data/.tmp/docs-frontmatter'
import order from '../../data/docs-navigation.js'

const DEFAULT_COMPONENTS = { Placement }

export default function DocsDocsPage({
  renderedContent,
  frontMatter,
  filePath,
  url,
}) {
  const router = useRouter()
  if (router.isFallback) {
    return <div></div>
  }

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
          data: sidenavData,
          order,
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

  const fileContent = await (
    await fetch(
      `https://raw.githubusercontent.com/hashicorp/nomad/stable-website/website/pages/${url}.mdx`
    )
  ).text()

  const { content, data } = matter(fileContent)
  const renderedContent = await renderToString(content, DEFAULT_COMPONENTS, {
    remarkPlugins: [
      [includeMarkdown, { resolveFrom: path.join(process.cwd(), 'partials') }],
      anchorLinks,
      paragraphCustomAlerts,
      typography,
    ],
    rehypePlugins: [[highlight, { ignoreMissing: true }]],
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
  return {
    paths: [],
    fallback: true,
  }
}
