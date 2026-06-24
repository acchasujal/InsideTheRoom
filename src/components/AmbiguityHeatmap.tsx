import React, { useState, useEffect, useRef } from 'react';
import './AmbiguityHeatmap.css';

interface InterpretationReading {
  school: string;
  shortName: string;
  reading: string;
  penaltyLikelihood: number; // 0-100
  color: string;
}

interface AmbiguityTerm {
  term: string;
  score: number; // 0-10
  incidentId: string;
  incidentTitle: string;
  ruleText: string;
  interpretations: InterpretationReading[];
  category: string;
}

interface AmbiguityHeatmapProps {
  terms?: AmbiguityTerm[];
  activeTermId?: string;
  mode?: 'full' | 'compact' | 'demo';
  onTermSelect?: (term: AmbiguityTerm) => void;
}

// Default dataset: all incidents with enriched ambiguity data
const DEFAULT_TERMS: AmbiguityTerm[] = [
  {
    term: 'deliberately',
    score: 8.5,
    incidentId: 'perisic',
    incidentTitle: 'Perišić Handball',
    ruleText: 'A handball offense occurs if a player deliberately touches the ball with their hand/arm.',
    category: 'Intent',
    interpretations: [
      {
        school: 'Purposive',
        shortName: 'Fan',
        reading: 'Intent is visible from body position — an extended arm was chosen, not forced.',
        penaltyLikelihood: 91,
        color: '#ef4444'
      },
      {
        school: 'Contextual',
        shortName: 'Referee',
        reading: 'Intent requires conscious decision-making. Natural running posture negates deliberateness.',
        penaltyLikelihood: 38,
        color: '#3b82f6'
      },
      {
        school: 'Procedural',
        shortName: 'VAR',
        reading: 'Unnaturally bigger silhouette meets threshold regardless of inner intent.',
        penaltyLikelihood: 71,
        color: '#10b981'
      },
      {
        school: 'Strict Constructionist',
        shortName: 'Rulebook',
        reading: 'Law text says "deliberately" — without a definition, enforcement is discretionary.',
        penaltyLikelihood: 50,
        color: '#eab308'
      }
    ]
  },
  {
    term: 'clear and obvious error',
    score: 9.2,
    incidentId: 'var_nested',
    incidentTitle: 'VAR Protocol',
    ruleText: 'VAR may only intervene in the event of a "clear and obvious error" or "serious missed incident."',
    category: 'Threshold',
    interpretations: [
      {
        school: 'Purposive',
        shortName: 'Fan',
        reading: 'Any wrong call is clear and obvious — the technology exists to get it right.',
        penaltyLikelihood: 95,
        color: '#ef4444'
      },
      {
        school: 'Contextual',
        shortName: 'Referee',
        reading: 'A 50/50 borderline call cannot simultaneously be "clear" AND "obvious" — both are required.',
        penaltyLikelihood: 25,
        color: '#3b82f6'
      },
      {
        school: 'Procedural',
        shortName: 'VAR',
        reading: 'A frame-by-frame review either confirms or denies the factual basis for intervention.',
        penaltyLikelihood: 78,
        color: '#10b981'
      },
      {
        school: 'Strict Constructionist',
        shortName: 'Rulebook',
        reading: 'Protocol defines intervention trigger — but the word "obvious" is an undefined threshold.',
        penaltyLikelihood: 55,
        color: '#eab308'
      }
    ]
  },
  {
    term: 'serious foul play / reckless',
    score: 7.8,
    incidentId: 'dejong',
    incidentTitle: 'De Jong Chest Kick',
    ruleText: 'A tackle or challenge that endangers the safety of an opponent or uses excessive force must be sanctioned as serious foul play.',
    category: 'Force',
    interpretations: [
      {
        school: 'Purposive',
        shortName: 'Fan',
        reading: 'A boot to the chest is assault by any moral standard — context makes it serious.',
        penaltyLikelihood: 97,
        color: '#ef4444'
      },
      {
        school: 'Contextual',
        shortName: 'Referee',
        reading: 'Intent and competitive context determine if force was excessive vs. reckless.',
        penaltyLikelihood: 48,
        color: '#3b82f6'
      },
      {
        school: 'Procedural',
        shortName: 'VAR',
        reading: '"Excessive force" requires demonstrable endangerment exceeding recklessness threshold.',
        penaltyLikelihood: 82,
        color: '#10b981'
      },
      {
        school: 'Strict Constructionist',
        shortName: 'Rulebook',
        reading: 'The rule separates reckless (yellow) from excessive force (red) — but gives no measurement.',
        penaltyLikelihood: 62,
        color: '#eab308'
      }
    ]
  },
  {
    term: 'deliberately played',
    score: 8.4,
    incidentId: 'mbappe',
    incidentTitle: 'Mbappé Offside',
    ruleText: 'A player in an offside position is not penalized if the ball was deliberately played by an opponent.',
    category: 'Intent',
    interpretations: [
      {
        school: 'Purposive',
        shortName: 'Fan',
        reading: 'The defender chose to move for the ball — any intentional motion is deliberate play.',
        penaltyLikelihood: 89,
        color: '#ef4444'
      },
      {
        school: 'Contextual',
        shortName: 'Referee',
        reading: '"Deliberately" requires conscious choice — a reaction is not the same as a deliberate play.',
        penaltyLikelihood: 42,
        color: '#3b82f6'
      },
      {
        school: 'Procedural',
        shortName: 'VAR',
        reading: 'Observable body movement toward the ball constitutes deliberate play by procedural standard.',
        penaltyLikelihood: 74,
        color: '#10b981'
      },
      {
        school: 'Strict Constructionist',
        shortName: 'Rulebook',
        reading: 'Law text uses "deliberately" in both Law 11 and Law 12 — neither instance is defined.',
        penaltyLikelihood: 57,
        color: '#eab308'
      }
    ]
  },
  {
    term: 'procedural vs substantive justice',
    score: 9.5,
    incidentId: 'suarez',
    incidentTitle: 'Suárez Handball',
    ruleText: 'Denying a goal-scoring opportunity by handball results in a sending-off and a penalty kick.',
    category: 'Justice',
    interpretations: [
      {
        school: 'Purposive',
        shortName: 'Fan',
        reading: 'A procedural remedy that allows the offender to advance fails the moral purpose of the law.',
        penaltyLikelihood: 99,
        color: '#ef4444'
      },
      {
        school: 'Contextual',
        shortName: 'Referee',
        reading: 'The law defines a specific remedy. Substantive outcomes beyond that are outside referee discretion.',
        penaltyLikelihood: 30,
        color: '#3b82f6'
      },
      {
        school: 'Procedural',
        shortName: 'VAR',
        reading: 'Red card and penalty are the maximum intervention available — protocol is satisfied.',
        penaltyLikelihood: 55,
        color: '#10b981'
      },
      {
        school: 'Strict Constructionist',
        shortName: 'Rulebook',
        reading: 'The rulebook prescribes sanctions — it is entirely silent on whether justice results.',
        penaltyLikelihood: 40,
        color: '#eab308'
      }
    ]
  }
];

export const AmbiguityHeatmap: React.FC<AmbiguityHeatmapProps> = ({
  terms = DEFAULT_TERMS,
  activeTermId,
  mode = 'full',
  onTermSelect
}) => {
  const [selectedTerm, setSelectedTerm] = useState<AmbiguityTerm | null>(null);
  const [animatedBars, setAnimatedBars] = useState(false);
  const [highlightPulse, setHighlightPulse] = useState(false);
  const spreadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTermId) {
      const found = terms.find(t => t.incidentId === activeTermId);
      if (found) {
        setSelectedTerm(found);
      }
    } else if (!selectedTerm && terms.length > 0) {
      setSelectedTerm(terms[0]);
    }
  }, [activeTermId, terms]);

  useEffect(() => {
    if (selectedTerm) {
      setAnimatedBars(false);
      setHighlightPulse(true);
      const t1 = setTimeout(() => setAnimatedBars(true), 80);
      const t2 = setTimeout(() => setHighlightPulse(false), 900);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [selectedTerm]);

  const handleSelect = (term: AmbiguityTerm) => {
    setSelectedTerm(term);
    onTermSelect?.(term);
  };

  const getHeatColor = (score: number) => {
    if (score >= 9) return '#ef4444';
    if (score >= 8) return '#f97316';
    if (score >= 7) return '#eab308';
    return '#10b981';
  };

  const getSpread = () => {
    if (!selectedTerm) return 0;
    const vals = selectedTerm.interpretations.map(i => i.penaltyLikelihood);
    return Math.max(...vals) - Math.min(...vals);
  };

  const spreadValue = getSpread();

  // Highlight the tension word in rule text
  const highlightRuleText = (ruleText: string, term: string) => {
    // Find the core word(s) to highlight from term (take first chunk before '/')
    const coreTerm = term.split('/')[0].split(' vs')[0].trim().toLowerCase();
    const words = coreTerm.split(' ');

    let highlighted = ruleText;
    words.forEach(word => {
      if (word.length > 3) {
        const regex = new RegExp(`(${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        highlighted = highlighted.replace(regex, `<mark class="heatmap-mark">$1</mark>`);
      }
    });
    return highlighted;
  };

  if (mode === 'compact') {
    return (
      <div className="heatmap-compact">
        <div className="heatmap-term-chips">
          {terms.map(t => (
            <button
              key={t.incidentId}
              className={`heatmap-chip ${selectedTerm?.incidentId === t.incidentId ? 'active' : ''}`}
              onClick={() => handleSelect(t)}
              style={{ '--heat-color': getHeatColor(t.score) } as React.CSSProperties}
            >
              <span className="chip-term">"{t.term}"</span>
              <span className="chip-score" style={{ color: getHeatColor(t.score) }}>{t.score}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="ambiguity-heatmap-root">
      {/* Left: Term Selector / Score Ladder */}
      <div className="heatmap-sidebar">
        <div className="heatmap-sidebar-label">
          <span>AMBIGUITY INDEX</span>
          <span className="heatmap-sidebar-sub">5 undefined terms · 5 incidents</span>
        </div>
        <div className="heatmap-term-list">
          {terms.map(t => (
            <button
              key={t.incidentId}
              className={`heatmap-term-row ${selectedTerm?.incidentId === t.incidentId ? 'active' : ''}`}
              onClick={() => handleSelect(t)}
            >
              <div className="heatmap-term-row-left">
                <span className="heatmap-term-word">"{t.term}"</span>
                <span className="heatmap-term-incident">{t.incidentTitle}</span>
              </div>
              <div className="heatmap-score-bar-wrap">
                <div
                  className="heatmap-score-bar"
                  style={{
                    width: `${(t.score / 10) * 100}%`,
                    background: getHeatColor(t.score)
                  }}
                />
                <span className="heatmap-score-num" style={{ color: getHeatColor(t.score) }}>
                  {t.score}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Selected Term Spread */}
      <div className="heatmap-detail" ref={spreadRef}>
        {selectedTerm ? (
          <>
            {/* Term Focus Header */}
            <div className={`heatmap-focus-header ${highlightPulse ? 'pulse' : ''}`}>
              <div className="heatmap-focus-label">TENSION TERM</div>
              <h2 className="heatmap-focus-term" style={{ color: getHeatColor(selectedTerm.score) }}>
                "{selectedTerm.term}"
              </h2>
              <div className="heatmap-focus-meta">
                <span className="heatmap-badge" style={{ borderColor: getHeatColor(selectedTerm.score), color: getHeatColor(selectedTerm.score) }}>
                  Ambiguity {selectedTerm.score}/10
                </span>
                <span className="heatmap-badge heatmap-badge-muted">
                  {selectedTerm.category}
                </span>
                <span className="heatmap-badge heatmap-badge-spread" style={{ borderColor: spreadValue > 50 ? '#ef4444' : '#eab308', color: spreadValue > 50 ? '#ef4444' : '#eab308' }}>
                  ↔ {spreadValue}pt interpretation spread
                </span>
              </div>
            </div>

            {/* Rule Text with Highlighted Term */}
            <div className="heatmap-rule-box">
              <span className="heatmap-rule-label">GOVERNING RULE TEXT</span>
              <p
                className="heatmap-rule-text"
                dangerouslySetInnerHTML={{ __html: highlightRuleText(selectedTerm.ruleText, selectedTerm.term) }}
              />
              <div className="heatmap-rule-note">
                ↑ This word is never defined. Every disagreement originates here.
              </div>
            </div>

            {/* Interpretation Spread — divergence spectrum */}
            <div className="heatmap-spread-section">
              <div className="heatmap-spread-label">
                <span>INTERPRETATION SPREAD</span>
                <span className="heatmap-spread-sub">Penalty / Sanction likelihood per reading school</span>
              </div>

              <div className="heatmap-spread-axis">
                <span>No Offense</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>← Interpretation Divergence →</span>
                <span>Clear Offense</span>
              </div>

              <div className="heatmap-interpretations">
                {selectedTerm.interpretations.map((interp, idx) => (
                  <div key={idx} className="heatmap-interp-row" style={{ animationDelay: `${idx * 80}ms` }}>
                    <div className="heatmap-interp-label">
                      <span className="heatmap-interp-school" style={{ color: interp.color }}>{interp.school}</span>
                      <span className="heatmap-interp-persona">({interp.shortName})</span>
                    </div>

                    <div className="heatmap-interp-bar-track">
                      <div
                        className={`heatmap-interp-bar ${animatedBars ? 'animated' : ''}`}
                        style={{
                          '--bar-width': `${interp.penaltyLikelihood}%`,
                          background: `linear-gradient(90deg, ${interp.color}33, ${interp.color})`,
                          border: `1px solid ${interp.color}55`
                        } as React.CSSProperties}
                      />
                      <div
                        className="heatmap-interp-dot"
                        style={{
                          left: `${animatedBars ? interp.penaltyLikelihood : 0}%`,
                          background: interp.color,
                          boxShadow: `0 0 8px ${interp.color}`
                        }}
                      />
                    </div>

                    <span className="heatmap-interp-pct" style={{ color: interp.color }}>
                      {interp.penaltyLikelihood}%
                    </span>
                  </div>
                ))}
              </div>

              {/* Reading detail */}
              <div className="heatmap-readings-grid">
                {selectedTerm.interpretations.map((interp, idx) => (
                  <div key={idx} className="heatmap-reading-card" style={{ borderColor: `${interp.color}33` }}>
                    <div className="heatmap-reading-header" style={{ color: interp.color }}>
                      <span className="heatmap-reading-school">{interp.school}</span>
                      <span className="heatmap-reading-pct">{interp.penaltyLikelihood}%</span>
                    </div>
                    <p className="heatmap-reading-text">{interp.reading}</p>
                  </div>
                ))}
              </div>

              {/* Divergence verdict */}
              <div className={`heatmap-verdict ${spreadValue > 50 ? 'high' : 'medium'}`}>
                <span className="heatmap-verdict-icon">{spreadValue > 50 ? '🔴' : '🟡'}</span>
                <div>
                  <strong>
                    {spreadValue > 50
                      ? `${spreadValue}pt spread — Maximum disagreement.`
                      : `${spreadValue}pt spread — Significant disagreement.`}
                  </strong>
                  <span> The disagreement originates from this word. Not from the evidence. Not from the AI. From the language itself.</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="heatmap-empty">
            <span>← Select an undefined term</span>
          </div>
        )}
      </div>
    </div>
  );
};

export { DEFAULT_TERMS };
export type { AmbiguityTerm };
