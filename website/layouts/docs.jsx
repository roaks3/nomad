import DocsPage from '@hashicorp/react-docs-page'
import { MDXProvider } from '@mdx-js/react'
import Placement from '../components/placement-table'
import Head from 'next/head'
import Link from 'next/link'

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

function DocsLayoutWrapper(pageMeta) {
  function DocsLayout(props) {
    return (
      <MDXProvider components={DEFAULT_COMPONENTS}>
        <DocsPage
          {...props}
          product="nomad"
          head={{
            is: Head,
            title: `${pageMeta.page_title} | Nomad by HashiCorp`,
            description: pageMeta.description,
            siteName: 'Nomad by HashiCorp',
          }}
          sidenav={{
            Link,
            category: 'docs',
            currentPage: props.path,
            data: STUBBED_SIDENAV_DATA,
            order: STUBBED_ORDER,
          }}
          resourceURL={`https://github.com/hashicorp/nomad/blob/master/website/pages/${pageMeta.__resourcePath}`}
        />
      </MDXProvider>
    )
  }

  DocsLayout.getInitialProps = ({ asPath }) => ({ path: asPath })

  return DocsLayout
}

export default DocsLayoutWrapper
