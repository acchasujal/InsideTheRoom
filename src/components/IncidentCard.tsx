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
      <h2>{title}</h2>
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
