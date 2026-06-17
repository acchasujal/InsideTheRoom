import { useState } from 'react'
import './App.css'
import { IncidentCard } from './components/IncidentCard'
import { DecisionPanel } from './components/DecisionPanel'
import { PerspectiveCard } from './components/PerspectiveCard'
import { RevealSection } from './components/RevealSection'

function App() {
  const [showReveal, setShowReveal] = useState(false);

  return (
    <div className="app-container">
      <header className="header">
        <h2>VAR Room - Component Library Sandbox</h2>
      </header>

      <main className="main-content" style={{ gap: '64px' }}>
        
        {/* Component 1: IncidentCard */}
        <section style={{ width: '100%' }}>
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>1. IncidentCard</h3>
          <IncidentCard 
            title="Perišić Handball"
            mediaType="image"
            mediaUrl="https://via.placeholder.com/800x400/111111/FFFFFF?text=Incident+Evidence+(Placeholder)"
            description="Ivan Perišić's arm makes contact with the ball in the penalty area during the 2018 World Cup Final."
          />
        </section>

        {/* Component 2: PerspectiveCard */}
        <section style={{ width: '100%' }}>
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>2. PerspectiveCard (Themes)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <PerspectiveCard 
              persona="VAR"
              colorTheme="var"
              text="The arm position was unnaturally bigger, creating a barrier. This is a clear and obvious error by the referee."
            />
            <PerspectiveCard 
              persona="Rulebook"
              colorTheme="rulebook"
              text="It is an offense if a player deliberately touches the ball or makes their body unnaturally bigger."
            />
          </div>
        </section>

        {/* Component 3: RevealSection */}
        <section style={{ width: '100%' }}>
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>3. RevealSection</h3>
          <button className="btn-ghost" onClick={() => setShowReveal(!showReveal)} style={{ marginBottom: '16px' }}>
            {showReveal ? 'Hide Reveal' : 'Trigger Reveal Animation'}
          </button>
          <RevealSection 
            isVisible={showReveal}
            lawCitation="Law 12 (Fouls and Misconduct - Handling the ball)"
            lawText="It is an offense if a player deliberately touches the ball or makes their body unnaturally bigger."
            undefinedTerm="deliberately"
            explanation="The word 'deliberately' appears four times in Law 12 and has no definition."
          />
        </section>

        {/* Component 4: DecisionPanel */}
        <section style={{ width: '100%' }}>
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>4. DecisionPanel</h3>
          <DecisionPanel 
            title="What is the correct call?"
            options={["Penalty", "No Penalty"]}
            onSelect={(val) => console.log("Selected:", val)}
          />
        </section>

      </main>
    </div>
  )
}

export default App
