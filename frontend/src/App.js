import React, { useState } from 'react';
import axios from 'axios';
import './styles.css';

function App() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [emergencyMessage, setEmergencyMessage] = useState("");
  const [emergencyLane, setEmergencyLane] = useState("NORTH"); // default lane

  // ✅ Use environment variable for API URL
  const API_URL = process.env.REACT_APP_API_URL;

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (selectedFiles.length !== 4) {
      alert('Please upload exactly 4 videos.');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach(file => formData.append('videos', file));

    try {
      const response = await axios.post(`${API_URL}/emergency`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(response.data);
    } catch (error) {
      console.error('Error uploading files:', error);
    }
    setLoading(false);
  };

  const handleEmergency = async () => {
    try {
      const response = await axios.post(`${API_URL}/emergency`, { lane: emergencyLane });
      setEmergencyMessage(
        response.data?.message || `🚨 Emergency Vehicle in ${emergencyLane} lane! Priority for 10 seconds.`
      );
      setTimeout(() => setEmergencyMessage(""), 10000);
    } catch (error) {
      console.error("Error activating emergency mode:", error);
    }
  };

  return (
    <div className="App">
      <h1>🚗 AI Based Traffic Management</h1>
      <hr />

      <div className='main-container'>
        <div className='left'>
          <section id="hero" className="hero">
            <h2>🚦 Optimize Traffic Flow with AI 🤖</h2>
            <p>Enhance your city's traffic management with our smart adaptive system.</p>
          </section>

          <section id="upload" className="upload">
            <h2>📹 Upload Your Traffic Videos</h2>
            <form onSubmit={handleSubmit}>
              <input type="file" multiple accept="video/*" onChange={handleFileChange} />
              <br />
              <button type="submit">Run Model</button>
            </form>

            {/* Emergency Vehicle Dropdown + Button */}
            <div style={{ marginTop: "15px" }}>
              <label>Select Emergency Lane: </label>
              <select value={emergencyLane} onChange={(e) => setEmergencyLane(e.target.value)}>
                <option value="NORTH">North</option>
                <option value="SOUTH">South</option>
                <option value="EAST">East</option>
                <option value="WEST">West</option>
              </select>
            </div>

            <button
              onClick={handleEmergency}
              style={{ background: "red", color: "white", padding: "10px", marginTop: "10px" }}
            >
              🚨 Activate Emergency Vehicle
            </button>

            {emergencyMessage && (
              <div style={{
                background: "yellow",
                color: "red",
                padding: "10px",
                fontWeight: "bold",
                border: "2px solid red",
                marginTop: "15px"
              }}>
                {emergencyMessage}
              </div>
            )}
          </section>
        </div>

        <section id="result" className="result">
          {!loading && !result && <p className='placeholder'>Optimization results will show here 🚦🚦🚦🚦</p>}
          {loading && <p className='loader'>Processing videos, it may take a few minutes...</p>}
          {result && !result.error && (
            <>
              <h2>✅ Optimization Results</h2>
              <ul>
                <li>🟢West: {result.west} seconds</li>
                <li>🟢North: {result.north} seconds</li>
                <li>🟢South: {result.south} seconds</li>
                <li>🟢East: {result.east} seconds</li>
              </ul>
            </>
          )}
          {result && result.error && (
            <div>
              <h2>Error:</h2>
              <p>{result.error}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default App;
