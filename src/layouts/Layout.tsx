import React, { useState } from 'react';
import { useNavigate, useLocation, useParams, Link } from 'react-router-dom';
import incidentsData from '../data/incidents.json';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Get active incident title if on incident page
  const activeIncident = id ? incidentsData.find(inc => inc.id === id) : null;

  // Determine active route
  const isHome = location.pathname === '/';
  const isLive = location.pathname.startsWith('/live');
  const isHeatmap = location.pathname.startsWith('/heatmap');
  const isIncident = location.pathname.startsWith('/incident');

  // Breadcrumbs generator
  const renderBreadcrumbs = () => {
    if (isHome) return null;

    const breadcrumbs = [
      { label: 'Home', path: '/' }
    ];

    if (isLive) {
      breadcrumbs.push({ label: 'Framing Test', path: '/live' });
    } else if (isHeatmap) {
      breadcrumbs.push({ label: 'Knowledge Graph', path: '/heatmap' });
    } else if (isIncident && activeIncident) {
      breadcrumbs.push({ label: 'Incident Review', path: `/incident/${activeIncident.id}` });
      breadcrumbs.push({ label: activeIncident.title, path: location.pathname });
    }

    return (
      <nav style={{ 
        width: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        fontSize: '0.72rem', 
        fontFamily: 'monospace', 
        color: 'var(--text-muted)',
        marginBottom: '16px',
        padding: '0 var(--space-4)'
      }}>
        {breadcrumbs.map((bc, idx) => (
          <React.Fragment key={bc.path}>
            {idx > 0 && <span style={{ opacity: 0.5 }}>/</span>}
            {idx === breadcrumbs.length - 1 ? (
              <span style={{ color: '#EAB308', fontWeight: 600 }}>{bc.label}</span>
            ) : (
              <Link to={bc.path} style={{ color: 'var(--text-muted)', textDecoration: 'none' }} className="breadcrumb-link">
                {bc.label}
              </Link>
            )}
          </React.Fragment>
        ))}
      </nav>
    );
  };

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Persistent Navigation Header */}
      <header className="header" style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 100, 
        background: 'rgba(10, 10, 10, 0.85)', 
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)', 
        padding: '12px 24px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        width: '100%',
        margin: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <h2 style={{ margin: 0, fontWeight: 800, fontSize: '1.05rem', letterSpacing: '1px', textTransform: 'uppercase', color: '#f5f5f5' }}>
              Inside the Room
            </h2>
            <span style={{ 
              fontSize: '0.6rem', 
              fontFamily: 'monospace', 
              background: 'rgba(234,179,8,0.1)', 
              color: '#EAB308', 
              border: '1px solid rgba(234,179,8,0.3)', 
              padding: '3px 8px', 
              borderRadius: '3px', 
              letterSpacing: '0.5px', 
              textTransform: 'uppercase',
              fontWeight: 700
            }}>
              IBM SkillsBuild 2026
            </span>
          </div>
        </div>

        {/* Minimal Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link 
            to="/" 
            style={{ 
              fontSize: '0.8rem', 
              textDecoration: 'none', 
              color: isHome ? '#EAB308' : 'var(--text-muted)', 
              fontWeight: isHome ? 700 : 500,
              fontFamily: 'monospace',
              letterSpacing: '0.5px',
              transition: 'color 0.2s'
            }}
          >
            Home
          </Link>
          <Link 
            to="/live" 
            style={{ 
              fontSize: '0.8rem', 
              textDecoration: 'none', 
              color: isLive ? '#EAB308' : 'var(--text-muted)', 
              fontWeight: isLive ? 700 : 500,
              fontFamily: 'monospace',
              letterSpacing: '0.5px',
              transition: 'color 0.2s'
            }}
          >
            Framing Test
          </Link>
          <button 
            onClick={() => setIsAboutOpen(true)}
            style={{ 
              background: 'transparent',
              border: 'none',
              padding: 0,
              fontSize: '0.8rem', 
              color: 'var(--text-muted)', 
              fontWeight: 500,
              fontFamily: 'monospace',
              letterSpacing: '0.5px',
              cursor: 'pointer',
              transition: 'color 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.color = '#EAB308'}
            onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            About
          </button>
        </nav>

        {/* Model Identifier Status Badge */}
        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'monospace', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block', animation: 'livePulse 2s ease-in-out infinite', flexShrink: 0 }} />
          ibm/granite-4-h-small
        </span>
      </header>

      {/* Main Layout Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', padding: '16px 0 0 0' }}>
        {renderBreadcrumbs()}
        <div className="fade-in" style={{ width: '100%', flex: 1 }}>
          {children}
        </div>
      </div>

      {/* Persistent Footer */}
      <footer style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '16px 24px', textAlign: 'center', fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
        Inside the Room © 2026 · Powered by <span style={{ color: '#EAB308' }}>IBM watsonx.ai</span> · Model: <span style={{ color: '#f5f5f5' }}>ibm/granite-4-h-small</span> · Governance Instrument for Discretion Disclosure
      </footer>

      {/* About Modal */}
      {isAboutOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '24px'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '600px',
            width: '100%',
            background: '#121212',
            border: '1px solid rgba(234, 179, 8, 0.25)',
            borderRadius: '12px',
            padding: '24px',
            position: 'relative',
            textAlign: 'left'
          }}>
            <button 
              onClick={() => setIsAboutOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '1.25rem',
                cursor: 'pointer'
              }}
              onMouseOver={e => e.currentTarget.style.color = '#ef4444'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              ✕
            </button>
            <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: '#EAB308', letterSpacing: '2px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              Project Context & thesis
            </span>
            <h3 style={{ color: '#f5f5f5', margin: '0 0 16px 0', fontSize: '1.4rem', fontWeight: 800 }}>
              About Inside the Room
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              <p style={{ margin: 0, fontSize: '0.88rem' }}>
                Governing texts (contracts, rulebooks, policies) contain intentional ambiguities like <em>"deliberate"</em> or <em>"reasonable"</em>. 
                Discretion exists at these points, which is where system failures and legal vulnerabilities hide.
              </p>
              <p style={{ margin: 0, fontSize: '0.88rem' }}>
                <strong>Inside the Room</strong> leverages <strong>IBM Granite</strong> to automatically flag these open-textured terms, generate defensible interpretations, and deliver compliance-ready governance documentation.
              </p>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px', marginTop: '4px' }}>
                <strong style={{ color: '#f5f5f5', display: 'block', marginBottom: '6px', fontSize: '0.8rem', textTransform: 'uppercase', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                  IBM watsonx.governance alignment
                </strong>
                <p style={{ margin: 0, fontSize: '0.82rem' }}>
                  By conducting live framing sensitivity checks and mapping verdict shifts in response to descriptions, we demonstrate auditability and trust alignment in decision orchestration.
                </p>
              </div>
            </div>

            <button 
              className="btn-primary" 
              onClick={() => setIsAboutOpen(false)}
              style={{
                marginTop: '20px',
                width: '100%',
                background: '#EAB308',
                color: '#000',
                border: 'none',
                padding: '10px 0',
                fontWeight: 700,
                fontSize: '0.85rem',
                borderRadius: '5px'
              }}
            >
              Close Overview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
