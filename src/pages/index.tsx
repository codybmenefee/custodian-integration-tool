import { NextPage } from 'next';
import Head from 'next/head';

const Home: NextPage = () => {
  return (
    <div className="container">
      <Head>
        <title>Custodian Integration Tool</title>
        <meta name="description" content="A tool for automating custodian integration analysis" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="main">
        <h1 className="title">
          Welcome to the Custodian Integration Tool
        </h1>

        <p className="description">
          A tool for analyzing custodian integration patterns
        </p>

        <div className="grid">
          <div className="card">
            <h2>Document Upload &rarr;</h2>
            <p>Upload and analyze integration documentation.</p>
          </div>

          <div className="card">
            <h2>Schema Management &rarr;</h2>
            <p>Define and modify MongoDB schemas.</p>
          </div>

          <div className="card">
            <h2>Mapping Tool &rarr;</h2>
            <p>Automated mapping between custodian data and destination organization.</p>
          </div>

          <div className="card">
            <h2>Integration Logic &rarr;</h2>
            <p>Write and test TypeScript integration logic.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home; 