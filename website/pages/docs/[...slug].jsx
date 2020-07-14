import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import matter from 'gray-matter'
import git from 'nodegit'
import { pathToRegexp, match } from 'path-to-regexp'
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
import siteManifest from '../../site-manifest.json'

const DEFAULT_COMPONENTS = { Placement }

export default function DocsDocsPage({
  renderedContent,
  frontMatter,
  resourceUrl,
  url,
}) {
  const router = useRouter()
  if (router.isFallback) {
    return <div></div>
  }

  if (!renderedContent) {
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
        resourceURL={resourceUrl}
      >
        {hydratedContent}
      </DocsPage>
    </MDXProvider>
  )
}

export async function getStaticProps({ params }) {
  const url = `docs/${params.slug.join('/')}`

  const firstMatchingRoute = siteManifest.routes.find((route) =>
    pathToRegexp(route.pattern).test('/' + url)
  )

  const { version: versionParam, path: contentPathParam } = match(
    firstMatchingRoute.pattern
  )(`/${url}`).params

  const versionConfig =
    versionParam === 'stable'
      ? firstMatchingRoute.versions[0]
      : firstMatchingRoute.versions.find((v) => v.slug === versionParam)

  const filePath = `${firstMatchingRoute.directory}/${contentPathParam.join(
    '/'
  )}.mdx`
  const gitPath = `${versionConfig?.sha_lock || 'master'}/${filePath}`

  let fileContent
  if (process.env.USE_LOCAL_VERSIONED_CONTENT === 'true') {
    if (!versionConfig && versionParam !== 'latest') {
      // probably want a 404 or redirect
      return {
        props: {},
      }
    }

    if (versionParam === 'latest') {
      // For latest version, just use local files, which may include in-progress changes from the developer
      fileContent = (
        await promisify(fs.readFile)(`${process.cwd()}/../${filePath}`)
      ).toString()
    } else {
      const repo = await git.Repository.open(path.resolve(process.cwd(), '..'))
      const commit = await repo.getCommit(versionConfig.sha_lock)
      const entry = await commit.getEntry(filePath)
      const blob = await entry.getBlob()

      fileContent = blob.toString()
    }
  } else {
    if (!versionConfig) {
      // probably want a 404 or redirect
      return {
        props: {},
      }
    }

    fileContent = await (
      await fetch(`https://raw.githubusercontent.com/roaks3/nomad/${gitPath}`)
    ).text()
  }

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
      resourceUrl: `https://github.com/roaks3/nomad/blob/${gitPath}`,
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
