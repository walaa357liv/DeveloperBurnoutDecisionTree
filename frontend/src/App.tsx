import { useState, useEffect } from "react";
import "./App.css";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";

function App() {

  const [sleepHours, setSleepHours] = useState("");
  const [meetingsPerDay, setMeetingsPerDay] = useState("");
  const [workload, setWorkload] = useState("");
  const [stressLevel, setStressLevel] = useState("");
  const [overtime, setOvertime] = useState("");
  const [remoteWork, setRemoteWork] = useState("");
  const [gender, setGender] = useState("");
  const [role, setRole] = useState("");
  const [age, setAge] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [exercise, setExercise] = useState("");
  const [prediction, setPrediction] = useState("");

  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  
  const handlePredict = async () => {
  const developerData = {
  Sleep: Number(sleepHours),
  Meetings: Number(meetingsPerDay),
  Workload: Number(workload),
  Overtime: overtime,
  Stress: Number(stressLevel),
  Remote: remoteWork,
  Age: Number(age),
  ExperienceYears: Number(experienceYears),
  Gender: gender,
  Role: role,
  Exercise: exercise,
};

  try {
  const response = await fetch("http://localhost:3000/api/tree/predict", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(developerData),
  });

  const data = await response.json();

  setPrediction(data.prediction);
} catch (error) {
  console.error(error);
  setPrediction("Error: Could not connect to server");
}
};

const convertTreeToFlow = (tree: any) => {
  const newNodes: any[] = [];
  const newEdges: any[] = [];

  const traverse = (node: any, id: string, x: number, y: number) => {
    if (!node) return;

    const label = node.prediction
      ? `Prediction: ${node.prediction}`
      : `${node.feature} <= ${node.threshold}`;

    newNodes.push({
      id,
      position: { x, y },
      data: { label },
    });

    if (node.left) {
      const leftId = `${id}-left`;
      newEdges.push({
        id: `${id}-${leftId}`,
        source: id,
        target: leftId,
        label: "Yes",
      });
      traverse(node.left, leftId, x - 200, y + 120);
    }

    if (node.right) {
      const rightId = `${id}-right`;
      newEdges.push({
        id: `${id}-${rightId}`,
        source: id,
        target: rightId,
        label: "No",
      });
      traverse(node.right, rightId, x + 200, y + 120);
    }
  };

  traverse(tree, "root", 300, 0);

  return { nodes: newNodes, edges: newEdges };
};
const loadTree = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/tree");
    const tree = await response.json();

    const result = convertTreeToFlow(tree);
    setNodes(result.nodes);
    setEdges(result.edges);
    } catch (error) {
    console.error(error);
  }
};
  useEffect(() => {
  loadTree();
}, []);
  return (
    <div className="container">
      <h1>Developer Burnout Analysis</h1>

      <h2>Enter Developer Information</h2>

      <p>
        This application predicts burnout level using a custom Decision Tree
        algorithm.
      </p>

      <div className="form-group">
        <label>Sleep Hours</label>
        <input
          type="number"
          placeholder="Enter average sleep hours"
          value={sleepHours}
          onChange={(e) => setSleepHours(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Meetings Per Day</label>
        <input
           type="number"
           placeholder="Enter meetings per day"
           value={meetingsPerDay}
           onChange={(e) => setMeetingsPerDay(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Workload</label>
        <input
           type="number"
           placeholder="Enter workload (1-10)"
           value={workload}
           onChange={(e) => setWorkload(e.target.value)}
         />
     </div>

     <div className="form-group">
        <label>Stress Level</label>
        <input
        type="number"
        placeholder="Enter stress level (1-10)"
        value={stressLevel}
        onChange={(e) => setStressLevel(e.target.value)}
        />
     </div>
     
    <div className="form-group">
        <label>Overtime</label>

        <select
        value={overtime}
        onChange={(e) => setOvertime(e.target.value)}
>
        <option value="">Select Overtime</option>
        <option value="Yes">Yes</option>
        <option value="No">No</option>
       </select>
    </div>

    <div className="form-group">
        <label>Remote Work</label>

        <select
        value={remoteWork}
        onChange={(e) => setRemoteWork(e.target.value)}
>
        <option value="">Select Remote Work</option>
        <option value="Yes">Yes</option>
        <option value="No">No</option>
       </select>
    </div>

<div className="form-group">
  <label>Age</label>

<input
  type="number"
  placeholder="Enter age"
  value={age}
  onChange={(e) => setAge(e.target.value)}
/>
</div>

<div className="form-group">
  <label>Experience Years</label>

  <input
  type="number"
  placeholder="Enter years of experience"
  value={experienceYears}
  onChange={(e) => setExperienceYears(e.target.value)}
  />
</div>

<div className="form-group">
  <label>Gender</label>

  <select
  value={gender}
  onChange={(e) => setGender(e.target.value)}
>
  <option value="">Select Gender</option>
  <option value="Male">Male</option>
  <option value="Female">Female</option>
  </select>
</div>

<div className="form-group">
  <label>Exercise</label>

  <select
  value={exercise}
  onChange={(e) => setExercise(e.target.value)}
>
  <option value="">Select Exercise</option>
  <option value="Yes">Yes</option>
  <option value="No">No</option>
  </select>
</div>

<div className="form-group">
  <label>Role</label>

  <select
  value={role}
  onChange={(e) => setRole(e.target.value)}
>
  <option value="">Select Role</option>
  <option value="Frontend Developer">Frontend Developer</option>
  <option value="Backend Developer">Backend Developer</option>
  <option value="Full Stack Developer">Full Stack Developer</option>
  <option value="QA Engineer">QA Engineer</option>
  <option value="DevOps Engineer">DevOps Engineer</option>
  </select>
</div>

<button onClick={handlePredict}>Predict Burnout</button>

{prediction && (
  <div className="result">
    <h2>Prediction Result</h2>

    <div className="prediction-display">
      <span className={`prediction-dot ${prediction.toLowerCase()}`}></span>

      <p className={`prediction-${prediction.toLowerCase()}`}>
        {prediction}
      </p>
    </div>
  </div>
)}

<div
  style={{
    height: "650px",
    border: "1px solid #ccc",
    marginTop: "30px",
    borderRadius: "10px",
    padding: "10px",
  }}
>
  <h2 className="tree-title">Decision Tree Visualizer</h2>

  <ReactFlow nodes={nodes} edges={edges} fitView>
    <Background />
    <Controls />
  </ReactFlow>
</div>
</div>
  );
}

export default App;