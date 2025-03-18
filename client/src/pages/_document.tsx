import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="description" content="Custodian Integration POC" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <body>
          <Main />
          <NextScript />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // Handle client-side navigation for static export
                if (typeof window !== 'undefined') {
                  window.__NEXT_DATA__ = window.__NEXT_DATA__ || {};
                  window.__NEXT_DATA__.nextExport = true;
                }
              `,
            }}
          />
        </body>
      </Html>
    );
  }
}

export default MyDocument; 