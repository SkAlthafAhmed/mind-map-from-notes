import React, { useEffect, useRef, useState } from "react";
import { DataSet, Network } from "vis-network/standalone/esm/vis-network";
import "./App.css"; // or "./styles.css" if you're using custom styles

export default function App() {
  const containerRef = useRef(null);
  const [notes, setNotes] = useState(`AI
- Machine Learning
  - Supervised Learning
    - Classification
    - Regression
  - Unsupervised Learning
    - Clustering
- Deep Learning
  - CNN
  - RNN`);

  useEffect(() => {
    renderMindMap();
  }, [notes]);

  const renderMindMap = () => {
    if (!containerRef.current) return;

    // Don't trim - keep indentation for hierarchy
    const lines = notes.split("\n").map((line) => line.replace(/\r/g, ""));
    const nodes = [];
    const edges = [];

    let nodeId = 1;
    const idMap = {};

    lines.forEach((line, index) => {
      if (line.trim().length === 0) return;

      const level = line.search(/\S|$/) / 2; // detect indentation level
      const name = line.replace(/^- /, "").trim();
      const currentId = nodeId++;

      nodes.push({ id: currentId, label: name, shape: "box" });

      // Find parent for this level
      if (level > 0) {
        const parentLine = lines
          .slice(0, index)
          .reverse()
          .find((l) => l.search(/\S|$/) / 2 === level - 1);

        if (parentLine) {
          const parentName = parentLine.replace(/^- /, "").trim();
          const parentId = idMap[level - 1 + parentName];
          if (parentId) {
            edges.push({ from: parentId, to: currentId });
          }
        }
      }

      idMap[level + name] = currentId;
    });

    const data = {
      nodes: new DataSet(nodes),
      edges: new DataSet(edges),
    };

    const options = {
      layout: {
        hierarchical: {
          direction: "UD",
          sortMethod: "directed",
        },
      },
      edges: {
        arrows: {
          to: { enabled: true, scaleFactor: 0.6 },
        },
      },
    };

    new Network(containerRef.current, data, options);
  };

  return (
    <div className="App">
      <h1>🧠 Mind Map Generator</h1>
      <textarea
        rows={10}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Paste your notes in indented format..."
      />
      <div ref={containerRef} className="graph" />
    </div>
  );
}
