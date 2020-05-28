import DocsPage from '@hashicorp/react-docs-page'
import Head from 'next/head'
import Link from 'next/link'

const STUBBED_SIDENAV_DATA = [
  {
    layout: 'api',
    page_title: 'Test',
    sidebar_title: 'namespaces',
    description: 'Test',
    __resourcePath: 'api-docs/namespaces.mdx',
  },
]
const STUBBED_ORDER = ['namespaces']

function ApiLayoutWrapper(pageMeta) {
  function ApiLayout(props) {
    return (
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
          category: 'api-docs',
          currentPage: props.path,
          data: STUBBED_SIDENAV_DATA,
          order: STUBBED_ORDER,
        }}
        resourceURL={`https://github.com/hashicorp/nomad/blob/master/website/pages/${pageMeta.__resourcePath}`}
      />
    )
  }

  ApiLayout.getInitialProps = ({ asPath }) => ({ path: asPath })

  return ApiLayout
}

export default ApiLayoutWrapper
