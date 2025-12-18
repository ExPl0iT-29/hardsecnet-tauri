import { invoke } from '@tauri-apps/api/core';
import { useEffect, useState } from 'react';

function App() {
  const [modules, setModules] = useState<string[]>([]);
  const [profiles, setProfiles] = useState<string[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string>('');

  useEffect(() => {
    invoke('get_available_modules').then((res) => setModules(res as string[])).catch(console.error);
    invoke('get_profiles').then((res) => setProfiles(res as string[])).catch(console.error);
  }, []);

  const handleRunSequence = () => {
    invoke('run_full_sequence', { modules: selectedProfile ? profiles : modules })
      .then((res) => console.log('Sequence done:', res))
      .catch(console.error);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-blue-800 mb-8">HardSecNet - Org Security Suite</h1>

      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-6">
        <div className="tabs tabs-boxed mb-6">
          <button className="tab tab-active">Hardening</button>
          <button className="tab">Network</button>
          <button className="tab">AI Advisor</button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-lg font-medium mb-2">Select Profile</label>
            <select
              className="select select-bordered w-full"
              value={selectedProfile}
              onChange={(e) => setSelectedProfile(e.target.value)}
            >
              <option value="">-- Choose Profile --</option>
              {profiles.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-lg font-medium mb-2">Available Modules:</p>
            <div className="grid grid-cols-2 gap-4">
              {modules.map((m) => (
                <label key={m} className="flex items-center space-x-2">
                  <input type="checkbox" className="checkbox checkbox-primary" />
                  <span className="label-text">{m}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            className="btn btn-primary w-full mt-4"
            onClick={handleRunSequence}
            disabled={!modules.length && !selectedProfile}
          >
            Run Full Sequence (Snapshot → Audit → Harden → Compare)
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;