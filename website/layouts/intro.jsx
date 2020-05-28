import DocsPage from '@hashicorp/react-docs-page'
import Head from 'next/head'
import Link from 'next/link'

const STUBBED_SIDENAV_DATA = [
  {
    layout: 'intro',
    page_title: 'Test',
    sidebar_title: 'use-cases',
    description: 'Test',
    __resourcePath: 'intro/use-cases.mdx',
  },
]
const STUBBED_ORDER = ['use-cases']

function IntroLayoutWrapper(pageMeta) {
  function IntroLayout(props) {
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
          category: 'intro',
          currentPage: props.path,
          data: STUBBED_SIDENAV_DATA,
          order: STUBBED_ORDER,
        }}
        resourceURL={`https://github.com/hashicorp/nomad/blob/master/website/pages/${pageMeta.__resourcePath}`}
      />
    )
  }

  IntroLayout.getInitialProps = ({ asPath }) => ({ path: asPath })

  return IntroLayout
}

export default IntroLayoutWrapper
