const withHashicorp = require('@hashicorp/nextjs-scripts')

module.exports = withHashicorp({
  defaultLayout: true,
  transpileModules: [
    'is-absolute-url',
    '@hashicorp/react-mega-nav',
    'next-mdx-remote',
  ],
})({
  exportTrailingSlash: true,
  experimental: {
    modern: true,
  },
  env: {
    HASHI_ENV: process.env.HASHI_ENV || 'development',
    SEGMENT_WRITE_KEY: 'qW11yxgipKMsKFKQUCpTVgQUYftYsJj0',
    BUGSNAG_CLIENT_KEY: '4fa712dfcabddd05da29fd1f5ea5a4c0',
    BUGSNAG_SERVER_KEY: '61141296f1ba00a95a8788b7871e1184',
  },
})
