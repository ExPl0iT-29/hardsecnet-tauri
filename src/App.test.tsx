import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import App from "./App";

vi.mock("@tauri-apps/api/core", () => {
  return {
    invoke: vi.fn((command: string) => {
      if (command === "get_available_modules") {
        return Promise.resolve(["baseline_snapshot", "cis_audit"]);
      }
      if (command === "get_profiles") {
        return Promise.resolve([
          {
            id: "default_org_windows",
            name: "Default Org Windows Desktop Baseline",
            modules: ["baseline_snapshot", "cis_audit"],
          },
        ]);
      }
      if (command === "run_full_sequence") {
        return Promise.resolve({
          profile: "default_org_windows",
          modules: [
            {
              module: "baseline_snapshot",
              steps: [
                {
                  stage: "snapshot",
                  status: "ok",
                  message: "Snapshot captured",
                },
              ],
            },
          ],
        });
      }

      if (command === "get_network_checks") {
        return Promise.resolve([]);
      }

      if (command === "get_ai_recommendations") {
        return Promise.resolve([]);
      }

      return Promise.resolve(null);
    }),
  };
});

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders profile dropdown and modules", async () => {
    render(<App />);

    const profileLabel = await screen.findByText(/Select Profile/i);
    expect(profileLabel).toBeInTheDocument();

    const moduleLabel = await screen.findByText(/Available Modules/i);
    expect(moduleLabel).toBeInTheDocument();
  });

  it("invokes run_full_sequence when button is clicked", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    render(<App />);

    const runButton = await screen.findByRole("button", {
      name: /Run Full Sequence/i,
    });

    fireEvent.click(runButton);

    expect(invoke).toHaveBeenCalledWith("run_full_sequence", {
      profile_name: null,
      modules: ["baseline_snapshot", "cis_audit"],
    });
  });
});

