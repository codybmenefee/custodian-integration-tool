import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

const baseStyles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#666',
    marginBottom: '2rem',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  button: {
    backgroundColor: '#3182CE',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '0.6rem 1.2rem',
    fontWeight: '500',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  navLink: {
    display: 'inline-block',
    marginRight: '1rem',
    color: '#3182CE',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '500',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem',
    marginTop: '2rem',
  },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    padding: '1.5rem',
    height: '100%',
  },
  featureIcon: {
    backgroundColor: '#EBF8FF',
    color: '#3182CE',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem',
    fontSize: '1.2rem',
  },
  featureTitle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
  },
  featureDescription: {
    color: '#666',
    lineHeight: '1.5',
  },
};

export default function Home() {
  return (
    <div style={{ backgroundColor: '#f7f9fc', minHeight: '100vh' }}>
      <Head>
        <title>Schema Custodian</title>
        <meta name="description" content="Manage your data schemas with ease" />
      </Head>

      <div style={baseStyles.container}>
        <header style={baseStyles.header}>
          <h1 style={baseStyles.title}>Schema Custodian</h1>
          <p style={baseStyles.subtitle}>
            Easily manage, version, and validate your data schemas
          </p>
          <nav>
            <Link href="/schemas" style={baseStyles.navLink}>
              Schemas
            </Link>
            <Link href="/docs" style={baseStyles.navLink}>
              Documentation
            </Link>
            <Link href="/about" style={baseStyles.navLink}>
              About
            </Link>
          </nav>
        </header>

        <main>
          <div style={baseStyles.card}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Get Started
            </h2>
            <p style={{ marginBottom: '1.5rem' }}>
              Create, edit, and manage your data schemas with our intuitive interface.
            </p>
            <button 
              style={baseStyles.button}
              onClick={() => window.location.href = '/schemas/new'}
            >
              Create New Schema
            </button>
          </div>

          <div style={baseStyles.grid}>
            <div style={baseStyles.featureCard}>
              <div style={baseStyles.featureIcon}>📋</div>
              <h3 style={baseStyles.featureTitle}>Schema Management</h3>
              <p style={baseStyles.featureDescription}>
                Create, edit, and delete schemas with an intuitive interface.
              </p>
            </div>

            <div style={baseStyles.featureCard}>
              <div style={baseStyles.featureIcon}>🔄</div>
              <h3 style={baseStyles.featureTitle}>Versioning</h3>
              <p style={baseStyles.featureDescription}>
                Track changes to your schemas over time with robust versioning.
              </p>
            </div>

            <div style={baseStyles.featureCard}>
              <div style={baseStyles.featureIcon}>✓</div>
              <h3 style={baseStyles.featureTitle}>Validation</h3>
              <p style={baseStyles.featureDescription}>
                Add validation rules to ensure data quality and consistency.
              </p>
            </div>

            <div style={baseStyles.featureCard}>
              <div style={baseStyles.featureIcon}>📊</div>
              <h3 style={baseStyles.featureTitle}>Reporting</h3>
              <p style={baseStyles.featureDescription}>
                Generate reports on schema usage and validation results.
              </p>
            </div>
          </div>
        </main>

        <footer style={{ marginTop: '3rem', textAlign: 'center', color: '#666', padding: '1rem 0' }}>
          <p>&copy; {new Date().getFullYear()} Schema Custodian. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
} 