import React, { useState } from 'react';
import miLogo from './assets/bombilla.png';
import './App.css';
import AIChat from './components/AIChat';
import ExportOptions from './components/ExportOptions';

const App: React.FC = () => {
    const [content, setContent] = useState('');
    const [idea, setIdea] = useState('');

    return (
        <div className="App">
            <header className="App-header">
                <img src={miLogo} className="App-logo" alt="logo" />
                <h1 className="App-title">NarrateAI</h1>
                <AIChat content={content} onChange={setContent} setIdea={setIdea} />
                {idea && <p className="idea">Idea Generada: {idea}</p>}
                <ExportOptions content={content} />
            </header>
        </div>
    );
};

export default App;