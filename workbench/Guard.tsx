import * as React from "react";

type Props = { name?: string; children: React.ReactNode };
type State = { err: any };

export default class Guard extends React.Component<Props, State> {
  state: State = { err: null };
  static getDerivedStateFromError(err: any) { return { err }; }
  componentDidCatch(err: any, info: any) { console.error("[Workbench Guard]", this.props.name, err, info); }
  render() {
    if (this.state.err) {
      return (
        <div style={{
          position: "fixed", inset: 0, background: "#1a1a1a",
          color: "#ffb3b3", padding: 16, fontFamily: "ui-monospace,Consolas,monospace"
        }}>
          <div style={{ marginBottom: 8 }}>⚠️ Прототип «{this.props.name || "?"}» упал:</div>
          <pre style={{ whiteSpace: "pre-wrap" }}>{String(this.state.err?.message || this.state.err)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
