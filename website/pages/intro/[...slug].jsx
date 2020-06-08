import path from 'path'
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
import introFiles from '../../data/.tmp/intro-files'
import sidenavData from '../../data/.tmp/intro-frontmatter'
import order from '../../data/intro-navigation.js'

export default function IntroPage({
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
        category: 'intro',
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
  const filePath = `content/intro/${params.slug.join('/')}.mdx`
  const url = `intro/${params.slug.join('/')}`
  const fileContent = await (
    await fetch(
      `https://raw.githubusercontent.com/hashicorp/nomad/stable-website/website/pages/${url}.mdx`
    )
  ).text()

  const { content, data } = matter(fileContent)
  const renderedContent = await renderToString(content, undefined, {
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
  const paths = introFiles.map((filePath) => ({
    params: {
      slug: filePath.replace(/\.mdx/, '').split('/'),
    },
  }))

  return {
    paths,
    fallback: false,
  }
}
