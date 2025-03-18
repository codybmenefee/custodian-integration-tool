import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Schema } from 'shared/src/types';
import * as schemaService from '../../services/schemaService';

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
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
    textDecoration: 'none',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  th: {
    padding: '1rem',
    textAlign: 'left',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    fontWeight: 'bold',
  },
  td: {
    padding: '1rem',
    borderBottom: '1px solid #e2e8f0',
  },
  badge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    borderRadius: '9999px',
    backgroundColor: '#e2e8f0',
    color: '#4a5568',
  },
  activeBadge: {
    backgroundColor: '#c6f6d5',
    color: '#2f855a',
  },
  iconButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#3182CE',
    padding: '0.25rem',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '0.5rem',
  },
  loadingText: {
    textAlign: 'center',
    padding: '2rem',
    fontSize: '1.2rem',
    color: '#718096',
  },
  errorText: {
    textAlign: 'center',
    padding: '2rem',
    fontSize: '1.2rem',
    color: '#e53e3e',
  },
  emptyText: {
    textAlign: 'center',
    padding: '2rem',
    fontSize: '1.2rem',
    color: '#718096',
  },
  navLink: {
    display: 'inline-block',
    marginRight: '1rem',
    color: '#3182CE',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '500',
  },
};

export default function SchemasPage() {
  const [schemas, setSchemas] = useState<Schema[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSchemas = async () => {
      try {
        setLoading(true);
        const data = await schemaService.getSchemas();
        setSchemas(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load schemas:', err);
        setError('Failed to load schemas. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadSchemas();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div style={{ backgroundColor: '#f7f9fc', minHeight: '100vh' }}>
      <Head>
        <title>Schemas | Schema Custodian</title>
      </Head>

      <div style={styles.container}>
        <nav style={{ marginBottom: '2rem' }}>
          <Link href="/" style={styles.navLink}>
            Home
          </Link>
          <span style={styles.navLink}>Schemas</span>
          <Link href="/docs" style={styles.navLink}>
            Documentation
          </Link>
        </nav>

        <div style={styles.header}>
          <h1 style={styles.title}>Schemas</h1>
          <Link href="/schemas/new" style={styles.button}>
            Create New Schema
          </Link>
        </div>

        {loading ? (
          <div style={styles.loadingText}>Loading schemas...</div>
        ) : error ? (
          <div style={styles.errorText}>{error}</div>
        ) : schemas.length === 0 ? (
          <div style={styles.emptyText}>
            No schemas available. Click "Create New Schema" to get started.
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Version</th>
                <th style={styles.th}>Fields</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Created</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {schemas.map((schema) => (
                <tr key={schema.id}>
                  <td style={styles.td}>{schema.name}</td>
                  <td style={styles.td}>{schema.version}</td>
                  <td style={styles.td}>{schema.fields.length}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.badge,
                        ...(schema.status === 'active' ? styles.activeBadge : {}),
                      }}
                    >
                      {schema.status || 'Draft'}
                    </span>
                  </td>
                  <td style={styles.td}>{formatDate(schema.createdAt)}</td>
                  <td style={styles.td}>
                    <Link
                      href={`/schemas/${schema.id}`}
                      style={styles.iconButton}
                      title="View Schema"
                    >
                      👁️
                    </Link>
                    <Link
                      href={`/schemas/${schema.id}/edit`}
                      style={styles.iconButton}
                      title="Edit Schema"
                    >
                      ✏️
                    </Link>
                    <button
                      style={styles.iconButton}
                      title="Delete Schema"
                      onClick={() => alert(`Delete ${schema.name}?`)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
} 