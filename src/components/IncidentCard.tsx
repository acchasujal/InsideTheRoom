import React from 'react';
import './IncidentCard.css';

interface IncidentCardProps {
  title: string;
  mediaUrl: string;
  mediaType: 'video' | 'gif' | 'image';
  description: string;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({ title, mediaUrl, mediaType, description }) => {
  return (
    <div className="incident-card glass-panel fade-in">
      <h2>{title}</h2>
      <div className="media-container">
        {mediaType === 'video' ? (
          <video src={mediaUrl} autoPlay loop muted playsInline />
        ) : (
          <img src={mediaUrl} alt={title} />
        )}
      </div>
      <p className="description">{description}</p>
    </div>
  );
};
