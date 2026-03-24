## Person B – Frontend & UX owner

You own the React UI and user flow quality across Hardening, Network, and AI Advisor tabs.

### Your primary roadmap issues

- **Issue 1.3** – Show clear empty states for modules/profiles.
- **Issue 2.1** – Profile-driven module selection state.
- **Issue 2.2** – Pipeline payload alignment (with Person A).
- **Issue 3.2** – Wire Run Full Sequence button and states.
- **Issue 4.1** – Sequence results panel.
- **Issue 7.1** – Network tab UI part.
- **Issue 7.2** – AI Advisor UI part.
- **Issue 9.1** – Final UI/copy polish.

### Core files you should work in

- `src/App.tsx`
- `src/App.css`
- `src/index.css`
- `src/App.test.tsx` (with Person C)

### Responsibilities

- Keep selection flow reliable:
  - Profile selection pre-selects modules correctly.
  - Checkbox toggles remain in sync with state.
- Keep run flow clean:
  - Loading, success, and error states are obvious.
  - Results are readable for non-technical evaluators.
- Keep tabs production-ready:
  - Network checks readable and structured.
  - AI recommendations readable and informative.
- Maintain visual consistency and accessibility.

### Definition of done for your PRs

- `npm run build` passes.
- `npm run lint` passes.
- `npm test` passes.
- Any behavior changes are reflected in docs (usually `docs/ARCHITECTURE.md` or `docs/IMPLEMENTATION_STATUS.md`).

