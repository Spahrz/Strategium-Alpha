import React, { useState } from 'react';
import { configureFirebase } from '../services/firebase';

interface FirebaseSetupProps {
    onConfigured: () => void;
}

const FirebaseSetup: React.FC<FirebaseSetupProps> = ({ onConfigured }) => {
    const [configJson, setConfigJson] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Basic cleanup of input if user pasted "const firebaseConfig = { ... }"
            let jsonStr = configJson;
            if (jsonStr.includes('=')) {
                jsonStr = jsonStr.substring(jsonStr.indexOf('=') + 1);
            }
            if (jsonStr.trim().endsWith(';')) {
                jsonStr = jsonStr.trim().slice(0, -1);
            }
            
            const config = JSON.parse(jsonStr);
            
            if (!config.apiKey || !config.projectId) {
                throw new Error("Invalid Config: Missing apiKey or projectId");
            }
            
            configureFirebase(config);
            onConfigured();
        } catch (err) {
            console.error(err);
            setError("Invalid JSON format. Please paste the configuration object strictly as JSON (keys in quotes).");
        }
    };

    return (
        <div className="min-h-screen bg-auspex-bg flex items-center justify-center p-4">
            <div className="max-w-lg w-full bg-auspex-panel border border-auspex-border rounded-lg shadow-2xl p-8">
                 <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-imperial-gold rounded-full flex items-center justify-center text-auspex-bg font-bold text-3xl border-4 border-white shadow-glow">
                        ⚙
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-center text-imperial-gold uppercase tracking-widest mb-4">System Initialization</h1>
                <p className="text-gray-400 text-sm mb-6 text-center">
                    To link this terminal to the Strategium Network (Firebase), please input your Vox-Caster frequency codes.
                </p>

                <ol className="list-decimal list-inside text-xs text-text-secondary mb-4 space-y-1">
                    <li>Go to <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Firebase Console</a></li>
                    <li>Create Project &rarr; Add Web App</li>
                    <li>Copy the `firebaseConfig` object</li>
                    <li>Format it as JSON (keys must have quotes!)</li>
                </ol>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <textarea 
                        value={configJson}
                        onChange={e => setConfigJson(e.target.value)}
                        placeholder='{ "apiKey": "...", "authDomain": "...", ... }'
                        className="w-full h-48 bg-black/50 border border-gray-600 text-white font-mono text-xs rounded p-4 focus:border-imperial-gold outline-none"
                    />
                    {error && <div className="text-red-500 text-xs">{error}</div>}
                    <button type="submit" className="w-full bg-imperial-gold text-black font-bold uppercase py-3 rounded hover:bg-yellow-400">
                        Establish Uplink
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FirebaseSetup;