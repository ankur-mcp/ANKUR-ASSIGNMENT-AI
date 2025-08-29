import React, { useState, useCallback } from "react";
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
} from "react-flow-renderer";

const COMPONENTS = [
  { id: "user-query", type: "input", data: { label: "User  Query" }, position: { x: 0, y: 0 } },
  { id: "knowledge-base", type: "default", data: { label: "KnowledgeBase" }, position: { x: 250, y: 0 } },
  { id: "llm-engine", type: "default", data: { label: "LLM Engine" }, position: { x: 500, y: 0 } },
  { id: "output", type: "output", data: { label: "Output" }, position: { x: 750, y: 0 } },
];

function App() {
  const [elements, setElements] = useState(COMPONENTS);
  const [query, setQuery] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [workflowId, setWorkflowId] = useState(null);

  const onConnect = (params) => setElements((els) => addEdge(params, els));

  const runWorkflow = async () => {
    if (!workflowId) {
      alert("Please save workflow first.");
      return;
    }
    if (!query) {
      alert("Please enter a query.");
      return;
    }
    const res = await fetch("http://localhost:8000/run-workflow/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workflow_id: workflowId, query }),
    });
    const data = await res.json();
    setChatLog((log) => [...log, { user: query, bot: data.response }]);
    setQuery("");
  };

  const saveWorkflow = async () => {
    const wfDef = {
      name: "Demo Workflow",
      definition: { elements },
    };
    const res = await fetch("http://localhost:8000/save-workflow/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(wfDef),
    });
    const data = await res.json();
    setWorkflowId(data.workflow_id);
    alert("Workflow saved with ID: " + data.workflow_id);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: "70%", height: "100%" }}>
        <ReactFlow
          elements={elements}
          onConnect={onConnect}
          snapToGrid={true}
          snapGrid={[15, 15]}
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
        <button onClick={saveWorkflow}>Save Workflow</button>
      </div>
      <div style={{ width: "30%", padding: 10, borderLeft: "1px solid #ddd" }}>
        <h3>Chat Interface</h3>
        <div style={{ height: "70vh", overflowY: "auto", border: "1px solid #ccc", padding: 10 }}>
          {chatLog.map((entry, idx) => (
            <div key={idx}>
              <b>User:</b> {entry.user}
              <br />
              <b>Bot:</b> {entry.bot}
              <hr />
            </div>
          ))}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your query"
          style={{ width: "100%", marginTop: 10 }}
        />
        <button onClick={runWorkflow} style={{ marginTop: 5 }}>
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
