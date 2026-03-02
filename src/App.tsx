import { invoke } from '@tauri-apps/api/core';
import { useEffect, useState } from 'react';

type Profile = {
  id: string;
  name: string;
  os?: string | null;
  description?: string | null;
  modules: string[];
  cisControls?: string[];
};

type StepResult = {
  stage: string;
  status: string;
  message: string;
};

type ModuleResult = {
  module: string;
  steps: StepResult[];
};

type RunResult = {
  profile?: string | null;
  modules: ModuleResult[];
};

type NetworkCheck = {
  id: string;
  title: string;
  status: string;
  details: string;
};

type Recommendation = {
  id: string;
  title: string;
  severity: string;
  details: string;
  relatedModules: string[];
};

type ActiveTab = 'hardening' | 'network' | 'ai';

function App() {
  const [modules, setModules] = useState<string[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('hardening');

  const [networkChecks, setNetworkChecks] = useState<NetworkCheck[] | null>(null);
  const [loadingNetwork, setLoadingNetwork] = useState(false);

  const [aiRecs, setAiRecs] = useState<Recommendation[] | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    invoke<string[]>('get_available_modules')
      .then((res) => {
        setModules(res);
        // Default to all modules selected when no profile is chosen yet.
        setSelectedModules(res);
      })
      .catch((err) => {
        console.error(err);
        setError((err as Error)?.message ?? String(err));
      });

    invoke<Profile[]>('get_profiles')
      .then((res) => {
        setProfiles(res);
      })
      .catch((err) => {
        console.error(err);
        setError((err as Error)?.message ?? String(err));
      });
  }, []);

  useEffect(() => {
    if (!selectedProfileId) {
      return;
    }

    const profile = profiles.find((p) => p.id === selectedProfileId);
    if (!profile) {
      return;
    }

    if (profile.modules && profile.modules.length > 0) {
      const allowed = profile.modules.filter((m) => modules.includes(m));
      setSelectedModules(allowed);
    }
  }, [selectedProfileId, profiles, modules]);

  useEffect(() => {
    if (activeTab === 'network' && networkChecks === null && !loadingNetwork) {
      setLoadingNetwork(true);
      invoke<NetworkCheck[]>('get_network_checks')
        .then((checks) => setNetworkChecks(checks))
        .catch((err) => {
          console.error(err);
          setError((err as Error)?.message ?? String(err));
        })
        .finally(() => setLoadingNetwork(false));
    }
  }, [activeTab, networkChecks, loadingNetwork]);

  useEffect(() => {
    if (activeTab === 'ai' && aiRecs === null && !loadingAi) {
      if (!runResult) {
        setAiRecs([]);
        return;
      }

      setLoadingAi(true);
      invoke<Recommendation[]>('get_ai_recommendations', { run_result: runResult })
        .then((recs) => setAiRecs(recs))
        .catch((err) => {
          console.error(err);
          setError((err as Error)?.message ?? String(err));
        })
        .finally(() => setLoadingAi(false));
    }
  }, [activeTab, aiRecs, loadingAi, runResult]);

  const handleToggleModule = (module: string, checked: boolean) => {
    setSelectedModules((prev) => {
      if (checked) {
        if (prev.includes(module)) return prev;
        return [...prev, module];
      }
      return prev.filter((m) => m !== module);
    });
  };

  const handleRunSequence = async () => {
    setError(null);
    setIsRunning(true);
    setRunResult(null);

    try {
      const effectiveModules =
        selectedModules.length > 0 ? selectedModules : modules;

      const result = await invoke<RunResult>('run_full_sequence', {
        profile_name: selectedProfileId || null,
        modules: effectiveModules,
      });

      setRunResult(result);
      setActiveTab('hardening');
      // Invalidate AI recommendations so that tab recomputes with latest results.
      setAiRecs(null);
    } catch (err) {
      console.error(err);
      setError((err as Error)?.message ?? String(err));
    } finally {
      setIsRunning(false);
    }
  };

  const currentProfile =
    selectedProfileId && profiles.length
      ? profiles.find((p) => p.id === selectedProfileId)
      : undefined;

  const hasModules = modules.length > 0;

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-blue-800 mb-8">
        HardSecNet - Org Security Suite
      </h1>

      <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg p-6 space-y-6">
        <div className="tabs tabs-boxed mb-4 flex">
          <button
            type="button"
            className={`tab flex-1 ${
              activeTab === 'hardening' ? 'tab-active' : ''
            }`}
            onClick={() => setActiveTab('hardening')}
          >
            Hardening
          </button>
          <button
            type="button"
            className={`tab flex-1 ${
              activeTab === 'network' ? 'tab-active' : ''
            }`}
            onClick={() => setActiveTab('network')}
          >
            Network
          </button>
          <button
            type="button"
            className={`tab flex-1 ${
              activeTab === 'ai' ? 'tab-active' : ''
            }`}
            onClick={() => setActiveTab('ai')}
          >
            AI Advisor
          </button>
        </div>

        {error && (
          <div className="alert alert-error text-sm mb-2">
            <span>{error}</span>
          </div>
        )}

        {activeTab === 'hardening' && (
          <div className="space-y-6">
            <div>
              <label className="block text-lg font-medium mb-2">
                Select Profile
              </label>
              <select
                className="select select-bordered w-full"
                value={selectedProfileId}
                onChange={(e) => setSelectedProfileId(e.target.value)}
              >
                <option value="">-- Choose Profile --</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {currentProfile?.description && (
                <p className="mt-2 text-sm text-gray-600">
                  {currentProfile.description}
                </p>
              )}
            </div>

            <div>
              <p className="text-lg font-medium mb-2">Available Modules</p>
              {!hasModules && (
                <p className="text-sm text-gray-600">
                  No modules found for this OS. Create folders under
                  {' `modules/windows` '} or {'`modules/linux`'} to get
                  started.
                </p>
              )}
              {hasModules && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {modules.map((m) => (
                    <label
                      key={m}
                      className="flex items-center space-x-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary"
                        checked={selectedModules.includes(m)}
                        onChange={(e) =>
                          handleToggleModule(m, e.target.checked)
                        }
                      />
                      <span className="label-text">{m}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              className="btn btn-primary w-full mt-2"
              onClick={handleRunSequence}
              disabled={isRunning || (!hasModules && !selectedProfileId)}
            >
              {isRunning
                ? 'Running sequence...'
                : 'Run Full Sequence (Snapshot → Audit → Harden → Compare)'}
            </button>

            {runResult && (
              <div className="mt-4 border-t pt-4">
                <h2 className="text-xl font-semibold mb-2">
                  Sequence Results
                </h2>
                {runResult.modules.length === 0 ? (
                  <p className="text-sm text-gray-600">
                    No module results returned.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {runResult.modules.map((mod) => (
                      <div
                        key={mod.module}
                        className="rounded-lg border p-3 space-y-1"
                      >
                        <h3 className="font-semibold">{mod.module}</h3>
                        <ul className="text-sm list-disc list-inside space-y-1">
                          {mod.steps.map((step) => (
                            <li key={step.stage}>
                              <span className="font-medium capitalize">
                                {step.stage}:{' '}
                              </span>
                              <span className="uppercase text-xs font-semibold mr-1">
                                [{step.status}]
                              </span>
                              <span>{step.message}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'network' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Network posture checks</h2>
            {loadingNetwork && <p className="text-sm">Loading checks…</p>}
            {!loadingNetwork && networkChecks && networkChecks.length === 0 && (
              <p className="text-sm text-gray-600">
                No network checks defined yet.
              </p>
            )}
            {!loadingNetwork && networkChecks && networkChecks.length > 0 && (
              <div className="space-y-3">
                {networkChecks.map((check) => (
                  <div
                    key={check.id}
                    className="border rounded-lg p-3 space-y-1 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{check.title}</span>
                      <span className="badge badge-outline uppercase">
                        {check.status}
                      </span>
                    </div>
                    <p className="text-gray-700">{check.details}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">AI-style recommendations</h2>
            {!runResult && (
              <p className="text-sm text-gray-600">
                Run at least one baseline sequence to generate data for
                recommendations.
              </p>
            )}
            {loadingAi && <p className="text-sm">Analyzing results…</p>}
            {!loadingAi && aiRecs && aiRecs.length === 0 && (
              <p className="text-sm text-gray-600">
                No recommendations available yet.
              </p>
            )}
            {!loadingAi && aiRecs && aiRecs.length > 0 && (
              <div className="space-y-3">
                {aiRecs.map((rec) => (
                  <div
                    key={rec.id}
                    className="border rounded-lg p-3 space-y-1 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{rec.title}</span>
                      <span className="badge badge-outline uppercase">
                        {rec.severity}
                      </span>
                    </div>
                    <p className="text-gray-700">{rec.details}</p>
                    {rec.relatedModules && rec.relatedModules.length > 0 && (
                      <p className="text-xs text-gray-500">
                        Related modules: {rec.relatedModules.join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;