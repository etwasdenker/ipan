import * as React from "react";
import { registry } from "./registry";
import WorkbenchPanel from "./ui/WorkbenchPanel";
import "./ui/wb-theme.css";

function useQueryId(defaultId: string) {
  const [id, setId] = React.useState<string>(() => {
    const p = new URLSearchParams(location.search);
    return p.get("id") || defaultId;
  });
  const update = (next: string) => {
    setId(next);
    const url = new URL(location.href);
    url.searchParams.set("id", next);
    history.replaceState(null, "", url);
  };
  return [id, update] as const;
}

class ErrorBoundary extends React.Component<{ onReset?: () => void }, { err: any }> {
  state = { err: null as any };
  static getDerivedStateFromError(err: any) { return { err }; }
  componentDidCatch(err: any) { console.error("Workbench prototype error:", err); }
  render() {
    if (this.state.err) {
      return (
        <div style={{
          position: "fixed", inset: 0, display: "grid", placeItems: "center",
          background: "var(--wb-app-bg)", color: "var(--wb-app-text)",
          font: "14px ui-monospace,Consolas,monospace"
        }}>
          <div style={{ maxWidth: 820, padding: 20 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Prototype crashed</div>
            <pre style={{ whiteSpace: "pre-wrap" }}>{String(this.state.err?.message || this.state.err)}</pre>
            <button
              onClick={() => { this.setState({ err: null }); this.props.onReset?.(); }}
              style={{ marginTop: 12, padding: "8px 12px", borderRadius: 8, border: "1px solid #444",
                       background: "transparent", color: "var(--wb-app-text)", cursor: "pointer" }}
            >
              Reset
            </button>
          </div>
        </div>
      );
    }
    return this.props.children as any;
  }
}

function Fallback() {
  return (
    <div style={{
      position: "fixed", inset: 0, display: "grid", placeItems: "center",
      background: "var(--wb-app-bg)", color: "var(--wb-app-text)",
      font: "13px ui-monospace,Consolas,monospace"
    }}>
      Loading prototype…
    </div>
  );
}

export default function WorkbenchApp() {
  const defaultId = registry[0]?.id || "menu-v1";
  const [activeId, setActiveId] = useQueryId(defaultId);

  const item = React.useMemo(() => registry.find(x => x.id === activeId), [activeId]);
  const Comp = item?.component;

  // Чтобы панель Tools знала, кому отдавать JSON
  React.useEffect(() => {
    window.dispatchEvent(new CustomEvent("wb:tools:request-config", { detail: { target: activeId } }));
  }, [activeId]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "var(--wb-app-bg)", color: "var(--wb-app-text)" }}>
      <ErrorBoundary onReset={() => setActiveId(defaultId)}>
        <React.Suspense fallback={<Fallback />}>
          {Comp ? <Comp key={activeId} /> : <Fallback />}
        </React.Suspense>
      </ErrorBoundary>

      <WorkbenchPanel
        activeId={activeId}
        onSelect={(id) => setActiveId(id)}
      />
    </div>
  );
}
