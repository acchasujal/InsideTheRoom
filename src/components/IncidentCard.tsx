import React, { useState } from 'react';
import './IncidentCard.css';

interface IncidentCardProps {
  title: string;
  mediaUrl: string;
  mediaType: 'video' | 'gif' | 'image';
  description: string;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({ title, mediaUrl, mediaType, description }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="incident-card glass-panel fade-in">
      {/* Enterprise header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <span style={{ fontSize: '0.62rem', fontFamily: 'monospace', color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>
          INCIDENT EVIDENCE RECORD
        </span>
        <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', background: 'rgba(234,179,8,0.08)', color: '#EAB308', border: '1px solid rgba(234,179,8,0.2)', padding: '2px 7px', borderRadius: '3px', letterSpacing: '0.5px' }}>
          IBM WATSONX GOVERNANCE
        </span>
      </div>
      <h2 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', fontWeight: 700, color: '#f5f5f5', letterSpacing: '0.3px' }}>{title}</h2>
      <div className="media-container">
        {mediaType === 'video' ? (
          <video src={mediaUrl} autoPlay loop muted playsInline />
        ) : imgError ? (
          // Graceful fallback: never show a broken image icon on stage
          <div style={{
            width: '100%',
            minHeight: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '8px',
            color: 'var(--text-muted)',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <span style={{ fontSize: '2rem' }}>📋</span>
            <span>Incident Evidence</span>
          </div>
        ) : (
          <img
            src={mediaUrl}
            alt={title}
            onError={() => setImgError(true)}
          />
        )}
      </div>
      <p className="description">{description}</p>
    </div>
  );
};
