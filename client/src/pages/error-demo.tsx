import React from 'react';
import Head from 'next/head';
import { NextPage } from 'next';
import { ErrorDemo } from '../components/common/ErrorDemo';

const ErrorDemoPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Error Handling Demo</title>
        <meta name="description" content="Demonstration of error handling capabilities" />
      </Head>
      <main>
        <ErrorDemo />
      </main>
    </>
  );
};

export default ErrorDemoPage; 