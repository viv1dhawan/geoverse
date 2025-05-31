"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis // ZAxis is not used in this specific app, but kept for consistency if needed for future enhancements
} from 'recharts';

// Main React component for the Seismic Data Interpretation application
export default function SeismicInterpretation() {
  // State variables for user inputs
  const [numTraces, setNumTraces] = useState(50);
  const [samplingInterval, setSamplingInterval] = useState(4); // ms
  const [velocity1, setVelocity1] = useState(1500); // m/s (top layer)
  const [velocity2, setVelocity2] = useState(2500); // m/s (bottom layer)
  const [depthOfInterface, setDepthOfInterface] = useState(100); // meters

  // State variables for graph data
  const [seismicTracesData, setSeismicTracesData] = useState<any[]>([]);
  const [velocityModelData, setVelocityModelData] = useState<any[]>([]);
  const [convergenceData, setConvergenceData] = useState<any[]>([]); // Dummy convergence for consistency

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false); // State for showing explanation modal

  // LLM interpretation state
  const [interpretationLoading, setInterpretationLoading] = useState(false);
  const [interpretationText, setInterpretationText] = useState('');
  const [interpretationError, setInterpretationError] = useState('');

  // Effect to reset interpretation when data changes or simulation parameters change
  useEffect(() => {
    setInterpretationText('');
    setInterpretationError('');
  }, [numTraces, samplingInterval, velocity1, velocity2, depthOfInterface, seismicTracesData, velocityModelData]);

  /**
   * Simulates seismic data including synthetic traces and a simple two-layer velocity model.
   * Also simulates dummy convergence data.
   */
  const simulateSeismicData = () => {
    setIsLoading(true);
    setErrorMessage('');
    setShowResults(false);
    setInterpretationText('');
    setInterpretationError('');

    setTimeout(() => {
      try {
        const tempSeismicTraces: any[] = [];
        const tempVelocityModel: any[] = [];
        const tempConvergenceData: any[] = [];

        // Calculate two-way travel time (TWT) to the interface
        const twtInterface = (2 * depthOfInterface / velocity1) * 1000; // in ms

        // Determine max time for traces based on interface depth and second layer velocity
        const maxSimulatedDepth = depthOfInterface + 100; // Simulate a bit deeper than interface
        const twtMax = (2 * depthOfInterface / velocity1 + 2 * (maxSimulatedDepth - depthOfInterface) / velocity2) * 1000; // in ms
        const numTimeSamples = Math.ceil(twtMax / samplingInterval); // Number of samples

        // Simulate seismic traces
        for (let t = 0; t < numTimeSamples; t++) {
          const time = t * samplingInterval; // in ms
          const trace: { time: number; [key: string]: number } = { time: time };

          for (let i = 0; i < numTraces; i++) {
            let amplitude = 0;
            // Simulate a reflection at the interface
            // Apply a Ricker wavelet approximation for a more realistic reflection
            if (time >= twtInterface - 20 && time <= twtInterface + 20) { // Wider window for wavelet
              const peakTime = twtInterface + (Math.random() - 0.5) * 5; // Small random perturbation for realism
              const freq = 30; // Dominant frequency in Hz
              const t_norm = (time - peakTime) / 1000; // Convert to seconds
              // Ricker wavelet formula: (1 - 2*pi^2*f^2*t^2) * exp(-pi^2*f^2*t^2)
              amplitude = (1 - 2 * (Math.PI ** 2) * (freq ** 2) * (t_norm ** 2)) * Math.exp(-(Math.PI ** 2) * (freq ** 2) * (t_norm ** 2));
              amplitude *= 100; // Scale amplitude for visibility
            }
            // Add some background noise
            amplitude += (Math.random() - 0.5) * 5;
            trace[`trace${i + 1}`] = amplitude;
          }
          tempSeismicTraces.push(trace);
        }

        // Simulate Velocity Model (simple two-layer model with some noise)
        for (let d = 0; d <= maxSimulatedDepth; d += 10) {
          tempVelocityModel.push({
            depth: d,
            velocity: d <= depthOfInterface ? velocity1 + (Math.random() - 0.5) * 20 : velocity2 + (Math.random() - 0.5) * 20
          });
        }

        // Simulate Convergence Data (dummy data for an iterative process)
        for (let i = 0; i < 15; i++) {
          tempConvergenceData.push({
            iteration: i + 1,
            rmsError: 0.05 * Math.exp(-0.1 * i) + (Math.random() * 0.002) // Exponential decay with small noise
          });
        }

        setSeismicTracesData(tempSeismicTraces);
        setVelocityModelData(tempVelocityModel);
        setConvergenceData(tempConvergenceData);
        setShowResults(true);

      } catch (error: any) {
        setErrorMessage('Error during simulation: ' + error.message);
        console.error('Simulation error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 1500); // Simulate loading time
  };

  /**
   * Handles CSV file uploads for seismic data.
   * Expected CSV format: "time,trace1,trace2,..." for seismic traces,
   * or "depth,velocity" for velocity model.
   * @param event The file input change event.
   * @param dataType 'traces' or 'velocity_model' to specify which data is being uploaded.
   */
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, dataType: 'traces' | 'velocity_model') => {
    const file = event.target.files?.[0];
    if (!file) {
      setErrorMessage('No file selected.');
      return;
    }

    if (file.type !== 'text/csv') {
      setErrorMessage('Please upload a CSV file.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setInterpretationText('');
    setInterpretationError('');
    setShowResults(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      try {
        const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length === 0) {
          throw new Error('CSV file is empty.');
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const parsedData = lines.slice(1).map((line, index) => {
          const parts = line.split(',').map(part => part.trim());
          if (parts.length !== headers.length) {
            throw new Error(`Line ${index + 2} has incorrect number of columns. Expected ${headers.length}, got ${parts.length}.`);
          }
          const row: { [key: string]: number } = {};
          headers.forEach((header, i) => {
            const value = Number(parts[i]);
            if (isNaN(value)) {
              throw new Error(`Line ${index + 2}, column '${header}' contains non-numeric data.`);
            }
            row[header] = value;
          });
          return row;
        });

        if (parsedData.length === 0) {
          setErrorMessage('CSV file contains only headers or no valid data rows.');
          setIsLoading(false);
          return;
        }

        if (dataType === 'traces') {
          // For seismic traces, we expect 'time' and then 'traceX' columns
          if (!headers.includes('time')) {
            throw new Error("Traces CSV must have a 'time' column.");
          }
          setSeismicTracesData(parsedData);
          setNumTraces(headers.filter(key => key.startsWith('trace')).length); // Update numTraces based on uploaded data
        } else if (dataType === 'velocity_model') {
          // For velocity model, we expect 'depth' and 'velocity' columns
          if (!headers.includes('depth') || !headers.includes('velocity')) {
            throw new Error("Velocity Model CSV must have 'depth' and 'velocity' columns.");
          }
          setVelocityModelData(parsedData);
        }
        setConvergenceData([]); // Clear convergence data for uploaded files, as it's not in CSV
        setShowResults(true);

      } catch (error: any) {
        setErrorMessage(`Error parsing CSV for ${dataType}: ${error.message}`);
        console.error(`CSV parsing error for ${dataType}:`, error);
        setShowResults(false);
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read file.');
      setIsLoading(false);
    };
    reader.readAsText(file);
  };

  /**
   * Calls the Gemini API to get a geological interpretation of the seismic data.
   * Extracts characteristics like reflection times and velocity contrasts to form the prompt.
   */
  const interpretSeismicResults = async () => {
    setInterpretationLoading(true);
    setInterpretationText('');
    setInterpretationError('');

    if (seismicTracesData.length === 0 && velocityModelData.length === 0) {
      setInterpretationError('No seismic data or velocity model to interpret. Please run a simulation or upload data first.');
      setInterpretationLoading(false);
      return;
    }

    let prompt = `Based on the provided seismic data:`;

    // Add seismic traces information if available
    if (seismicTracesData.length > 0) {
      const firstTrace = seismicTracesData[0];
      const traceKeys = Object.keys(firstTrace).filter(key => key.startsWith('trace'));
      const numAvailableTraces = traceKeys.length;
      const maxTime = seismicTracesData[seismicTracesData.length - 1]?.time || 0;

      // Simple detection of a prominent reflection (e.g., highest average amplitude across traces)
      let maxAvgAmplitude = 0;
      let reflectionTime = 0;
      seismicTracesData.forEach(row => {
        let currentAvgAmplitude = 0;
        traceKeys.forEach(key => {
          currentAvgAmplitude += Math.abs(row[key]);
        });
        currentAvgAmplitude /= numAvailableTraces;

        if (currentAvgAmplitude > maxAvgAmplitude) {
          maxAvgAmplitude = currentAvgAmplitude;
          reflectionTime = row.time;
        }
      });

      if (reflectionTime > 0) {
        prompt += ` There is a prominent seismic reflection observed at approximately ${reflectionTime.toFixed(0)} ms two-way travel time.`;
      } else {
        prompt += ` Seismic traces are available, but no clear prominent reflection was detected.`;
      }
      prompt += ` The data spans up to ${maxTime.toFixed(0)} ms and includes ${numAvailableTraces} traces.`;
    }

    // Add velocity model information if available
    if (velocityModelData.length > 0) {
      const minVel = Math.min(...velocityModelData.map(d => d.velocity));
      const maxVel = Math.max(...velocityModelData.map(d => d.velocity));
      const shallowVel = velocityModelData[0]?.velocity;
      const deepVel = velocityModelData[velocityModelData.length - 1]?.velocity;
      const deepestDepth = velocityModelData[velocityModelData.length - 1]?.depth;

      prompt += ` The velocity model shows velocities ranging from ${minVel.toFixed(0)} m/s to ${maxVel.toFixed(0)} m/s, reaching a maximum depth of ${deepestDepth.toFixed(0)} meters.`;

      // Simple detection of a velocity contrast (e.g., if there's a significant jump)
      let velocityContrastDepth = null;
      for (let i = 1; i < velocityModelData.length; i++) {
        const prevVel = velocityModelData[i - 1].velocity;
        const currentVel = velocityModelData[i].velocity;
        if (Math.abs(currentVel - prevVel) > 0.2 * prevVel) { // 20% change as a threshold
          velocityContrastDepth = velocityModelData[i].depth;
          prompt += ` A significant velocity contrast is observed around ${velocityContrastDepth.toFixed(0)} meters depth, indicating a change in lithology or fluid content.`;
          break;
        }
      }
    }

    prompt += ` What are some possible geological or subsurface features that could explain these seismic observations (reflections, velocity variations)? Provide a brief, concise interpretation.`;


    try {
      let chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });
      const payload = { contents: chatHistory };
      const apiKey = ""; // Canvas will automatically provide this in runtime
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const text = result.candidates[0].content.parts[0].text;
        setInterpretationText(text);
      } else {
        setInterpretationError('Failed to get interpretation from AI. Unexpected response structure.');
        console.error('AI response error:', result);
      }
    } catch (error: any) {
      setInterpretationError('Error calling AI: ' + error.message);
      console.error('AI fetch error:', error);
    } finally {
      setInterpretationLoading(false);
    }
  };

  /**
   * Resets all state variables to their initial values, clearing inputs and results.
   */
  const resetApplication = () => {
    setNumTraces(50);
    setSamplingInterval(4);
    setVelocity1(1500);
    setVelocity2(2500);
    setDepthOfInterface(100);
    setSeismicTracesData([]);
    setVelocityModelData([]);
    setConvergenceData([]);
    setIsLoading(false);
    setErrorMessage('');
    setShowResults(false);
    setInterpretationLoading(false);
    setInterpretationText('');
    setInterpretationError('');
    setShowExplanation(false);
  };

  return (
    <div className="min-h-screen dark:bg-dark text-gray-100 font-inter py-20 px-4 sm:px-8 flex flex-col items-center rounded-lg shadow-xl">
      {/* Header */}
      <header className="w-full max-w-4xl text-center py-6 mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-500">
          Geophysical Seismic Data Interpretation
        </h1>
        <p className="text-gray-400 mt-3 text-lg">Data Simulation, Visualization & AI Interpretation</p>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row w-full max-w-7xl gap-8">
        {/* Input Panel */}
        <div className="w-full lg:w-1/4 dark:bg-dark p-6 rounded-xl shadow-2xl flex flex-col space-y-6 border border-gray-700">
          <h2 className="text-2xl font-bold text-purple-300 mb-4">Survey Parameters & Data Input</h2>

          {/* Number of Traces Input */}
          <div>
            <label htmlFor="numTraces" className="block text-gray-400 text-sm font-medium mb-2">
              Number of Traces
            </label>
            <input
              type="number"
              id="numTraces"
              className="w-full p-3 dark:bg-dark border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 transition duration-200"
              value={numTraces}
              onChange={(e) => setNumTraces(Math.max(10, parseInt(e.target.value) || 10))}
              step="1"
              min="10"
            />
          </div>

          {/* Sampling Interval Input */}
          <div>
            <label htmlFor="samplingInterval" className="block text-gray-400 text-sm font-medium mb-2">
              Sampling Interval (ms)
            </label>
            <input
              type="number"
              id="samplingInterval"
              className="w-full p-3 dark:bg-dark border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 transition duration-200"
              value={samplingInterval}
              onChange={(e) => setSamplingInterval(Math.max(1, parseFloat(e.target.value) || 1))}
              step="1"
              min="1"
            />
          </div>

          {/* Velocity Layer 1 Input */}
          <div>
            <label htmlFor="velocity1" className="block text-gray-400 text-sm font-medium mb-2">
              Velocity Layer 1 (m/s)
            </label>
            <input
              type="number"
              id="velocity1"
              className="w-full p-3 dark:bg-dark border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 transition duration-200"
              value={velocity1}
              onChange={(e) => setVelocity1(Math.max(100, parseFloat(e.target.value) || 100))}
              step="10"
              min="100"
            />
          </div>

          {/* Velocity Layer 2 Input */}
          <div>
            <label htmlFor="velocity2" className="block text-gray-400 text-sm font-medium mb-2">
              Velocity Layer 2 (m/s)
            </label>
            <input
              type="number"
              id="velocity2"
              className="w-full p-3 dark:bg-dark border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 transition duration-200"
              value={velocity2}
              onChange={(e) => setVelocity2(Math.max(100, parseFloat(e.target.value) || 100))}
              step="10"
              min="100"
            />
          </div>

          {/* Depth of Interface Input */}
          <div>
            <label htmlFor="depthOfInterface" className="block text-gray-400 text-sm font-medium mb-2">
              Depth of Interface (m)
            </label>
            <input
              type="number"
              id="depthOfInterface"
              className="w-full p-3 dark:bg-dark border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 transition duration-200"
              value={depthOfInterface}
              onChange={(e) => setDepthOfInterface(Math.max(10, parseFloat(e.target.value) || 10))}
              step="1"
              min="10"
            />
          </div>

          {/* Simulate Data Button */}
          <button
            onClick={simulateSeismicData}
            className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out
                       focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 mt-6"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Simulating...
              </span>
            ) : (
              'Simulate & Generate Dummy Data'
            )}
          </button>

          {/* Upload Data Section */}
          <div className="border-t border-gray-700 pt-6 mt-6">
            <h3 className="text-xl font-bold text-purple-300 mb-4">Upload Your Data (CSV)</h3>
            <div className="mb-4">
              <label htmlFor="tracesUpload" className="block text-gray-400 text-sm font-medium mb-2">
                Upload Seismic Traces CSV
              </label>
              <input
                type="file"
                id="tracesUpload"
                accept=".csv"
                className="w-full p-2 dark:bg-dark border border-gray-600 rounded-lg text-gray-200 file:mr-4 file:py-2 file:px-4
                           file:rounded-full file:border-0 file:text-sm file:font-semibold
                           file:bg-pink-500 file:text-white hover:file:bg-pink-600 cursor-pointer"
                onChange={(e) => handleFileUpload(e, 'traces')}
              />
            </div>
            <div>
              <label htmlFor="velocityModelUpload" className="block text-gray-400 text-sm font-medium mb-2">
                Upload Velocity Model CSV
              </label>
              <input
                type="file"
                id="velocityModelUpload"
                accept=".csv"
                className="w-full p-2 dark:bg-dark border border-gray-600 rounded-lg text-gray-200 file:mr-4 file:py-2 file:px-4
                           file:rounded-full file:border-0 file:text-sm file:font-semibold
                           file:bg-pink-500 file:text-white hover:file:bg-pink-600 cursor-pointer"
                onChange={(e) => handleFileUpload(e, 'velocity_model')}
              />
            </div>
          </div>

          {/* Reset Button */}
          <button
            onClick={resetApplication}
            className="w-full py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out
                       focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 mt-6"
          >
            Reset All
          </button>

          {errorMessage && (
            <div className="text-red-400 text-sm mt-4 p-3 bg-red-900 rounded-md border border-red-700">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Results Display Area */}
        <div className="w-full lg:w-3/4 dark:bg-dark p-6 rounded-xl shadow-2xl flex flex-col space-y-8 border border-gray-700">
          <h2 className="text-2xl font-bold text-purple-300">Seismic Interpretation Results</h2>

          {!showResults && !isLoading && (
            <div className="text-center text-gray-500 py-16">
              <p className="text-lg">Enter survey parameters and click "Simulate & Generate Dummy Data" or upload your own CSV files to see results.</p>
              <button
                onClick={() => setShowExplanation(true)}
                className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition duration-300"
              >
                What is Seismic Tomography?
              </button>
            </div>
          )}

          {isLoading && (
            <div className="text-center text-gray-400 py-16">
              <p className="text-lg">Processing seismic data...</p>
              <div className="mt-4">
                <svg className="animate-spin h-8 w-8 text-pink-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            </div>
          )}

          {showResults && (
            <>
              {/* Seismic Traces Plot */}
              <div className="dark:bg-dark p-4 rounded-lg shadow-xl border border-gray-700">
                <h3 className="text-xl font-medium text-gray-200 mb-4">Seismic Traces</h3>
                <p className="text-gray-400 text-sm mb-2">
                  Displays the amplitude variations across different seismic traces over time.
                </p>
                {seismicTracesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={seismicTracesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#4a4a4a" />
                      <XAxis dataKey="time" name="Time (ms)" stroke="#b0bec5" tickFormatter={(value) => value.toFixed(0)} />
                      <YAxis label={{ value: 'Amplitude', angle: -90, position: 'insideLeft', fill: '#b0bec5' }} stroke="#b0bec5" />
                      <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff', borderRadius: '8px' }} />
                      <Legend wrapperStyle={{ color: '#b0bec5', paddingTop: '10px' }} />
                      {/* Dynamically render lines for each trace */}
                      {Object.keys(seismicTracesData[0] || {})
                        .filter(key => key.startsWith('trace'))
                        .map((key, index) => (
                          <Line
                            key={key}
                            type="monotone"
                            dataKey={key}
                            stroke={`hsl(${(index * 70 + 200) % 360}, 70%, 60%)`} // Different color for each trace, adjusted hue
                            dot={false}
                            name={`Trace ${index + 1}`}
                            isAnimationActive={false} // Disable animation for multiple lines
                          />
                        ))}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-gray-500 py-10">
                    <p>No seismic trace data available. Simulate data or upload a CSV.</p>
                  </div>
                )}
              </div>

              {/* Velocity Model Plot */}
              <div className="dark:bg-dark p-4 rounded-lg shadow-xl border border-gray-700">
                <h3 className="text-xl font-medium text-gray-200 mb-4">Velocity Model</h3>
                <p className="text-gray-400 text-sm mb-2">
                  Displays the seismic velocity at different depths.
                </p>
                {velocityModelData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={velocityModelData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#4a4a4a" />
                      <XAxis dataKey="velocity" name="Velocity (m/s)" stroke="#b0bec5" tickFormatter={(value) => value.toFixed(0)} />
                      <YAxis dataKey="depth" name="Depth (m)" reversed stroke="#b0bec5" />
                      <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff', borderRadius: '8px' }} formatter={(value: any) => `${value.toFixed(0)} m/s`} />
                      <Legend wrapperStyle={{ color: '#b0bec5', paddingTop: '10px' }} />
                      <Line type="monotone" dataKey="velocity" stroke="#a78bfa" name="Velocity" dot={false} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-gray-500 py-10">
                    <p>No velocity model data available. Simulate data or upload a CSV.</p>
                  </div>
                )}
              </div>

              {/* Simulated Convergence Plot */}
              <div className="dark:bg-dark p-4 rounded-lg shadow-xl border border-gray-700">
                <h3 className="text-xl font-medium text-gray-200 mb-4">Simulated Inversion Convergence</h3>
                <p className="text-gray-400 text-sm mb-2">
                  Shows how the Root Mean Square (RMS) error decreases with each iteration. (Only available with simulated data)
                </p>
                {convergenceData.length > 0 ? (
                  <div>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart
                        data={convergenceData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#4a4a4a" />
                        <XAxis dataKey="iteration" stroke="#b0bec5" />
                        <YAxis stroke="#b0bec5" label={{ value: 'RMS Error', angle: -90, position: 'insideLeft', fill: '#b0bec5' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff', borderRadius: '8px' }} />
                        <Legend wrapperStyle={{ color: '#b0bec5', paddingTop: '10px' }} />
                        <Line type="monotone" dataKey="rmsError" stroke="#c084fc" activeDot={{ r: 8 }} name="RMS Error" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-10">
                    <p>Convergence data is typically generated during iterative inversion processes, which is not part of the direct CSV upload or simple simulation in this app.</p>
                  </div>
                )}
              </div>

              {/* LLM Interpretation */}
              <div className="dark:bg-dark p-4 rounded-lg shadow-xl border border-gray-700 flex flex-col">
                <h3 className="text-xl font-medium text-gray-200 mb-4">Geological Interpretation</h3>
                <p className="text-gray-400 text-sm mb-2">
                  Get an AI-powered interpretation of the seismic data.
                </p>
                <button
                  onClick={interpretSeismicResults}
                  className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out
                             focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 mt-auto"
                  disabled={interpretationLoading || (seismicTracesData.length === 0 && velocityModelData.length === 0)}
                >
                  {interpretationLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Getting Interpretation...
                    </span>
                  ) : (
                    '✨ Get AI Interpretation'
                  )}
                </button>

                {interpretationText && (
                  <div className="dark:bg-dark p-4 rounded-md mt-4 text-gray-300 text-sm border border-gray-700">
                    <p className="whitespace-pre-wrap">{interpretationText}</p>
                  </div>
                )}

                {interpretationError && (
                  <div className="text-red-400 text-sm mt-4 p-3 bg-red-900 rounded-md border border-red-700">
                    {interpretationError}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Explanation Modal */}
      {showExplanation && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-8 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700 relative">
            <button
              onClick={() => setShowExplanation(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 text-2xl font-bold"
              aria-label="Close explanation"
            >
              &times;
            </button>
            <h3 className="text-2xl font-bold text-purple-300 mb-4">Understanding Seismic Tomography</h3>
            <div className="text-gray-300 space-y-4 text-base max-h-96 overflow-y-auto pr-4">
              <h4 className="font-semibold text-purple-200">What is Seismic?</h4>
              <p>
                <strong>Seismic</strong> refers to vibrations of the Earth, whether from natural events like earthquakes or artificially generated waves used to image the subsurface. In this application, we focus on the latter.
              </p>

              <h4 className="font-semibold text-purple-200">What is Seismic Acquisition?</h4>
              <p>
                <strong>Seismic Acquisition</strong> is the process of generating seismic waves (using a source like a vibrator or air gun) and recording the waves that reflect back from subsurface rock layers using sensors (geophones or hydrophones). This raw data forms the basis of our analysis.
              </p>

              <h4 className="font-semibold text-purple-200">What is Seismic Processing?</h4>
              <p>
                <strong>Seismic Processing</strong> involves applying various computational techniques to the raw seismic data to enhance the signal, reduce noise, and create a clearer image of the Earth's subsurface. This processed data is what we typically interpret.
              </p>

              <h4 className="font-semibold text-purple-200">What is Seismic Interpretation?</h4>
              <p>
                <strong>Seismic Interpretation</strong> is the stage where geoscientists analyze the processed seismic images to extract geological information. This includes identifying rock layers, structural features (like faults and folds), and potentially the presence of hydrocarbons or other subsurface resources. This application aims to help visualize and interpret this type of data.
              </p>

              <p>
                <strong>How Seismic Surveys Work:</strong>
                <br/>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li><strong>Source:</strong> A seismic source (e.g., vibrator, air gun, hammer) generates acoustic energy that travels into the Earth.</li>
                  <li><strong>Propagation and Reflection:</strong> These waves travel through different rock layers. When they encounter an interface between layers with different acoustic properties, a portion of the energy is reflected back to the surface.</li>
                  <li><strong>Receivers:</strong> Geophones (on land) or hydrophones (in water) detect these reflected waves.</li>
                  <li><strong>Two-Way Travel Time (TWT):</strong> The time it takes for a seismic wave to travel from the source to a reflector and back to a receiver. This time is related to the depth of the reflector.</li>
                </ul>
              </p>
              <p>
                <strong>Key Concepts in Seismic Data:</strong>
                <br/>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li><strong>Seismic Traces:</strong> Each trace represents the recorded seismic wavefield at a specific receiver location over time. Reflections appear as distinct events (wavelets) on these traces.</li>
                  <li><strong>Seismic Section:</strong> A collection of adjacent seismic traces plotted side-by-side forms a seismic section, which resembles a geological cross-section in time.</li>
                  <li><strong>Seismic Velocity Model:</strong> This model describes how seismic wave velocity changes with depth in the subsurface. It's crucial for converting two-way travel time to actual depth and for understanding rock properties. Changes in velocity often indicate changes in rock type, porosity, or fluid content.</li>
                  <li><strong>Reflections:</strong> Strong reflections typically indicate significant contrasts in acoustic impedance (product of density and velocity) between rock layers. These can represent geological boundaries, fault planes, or fluid contacts.</li>
                </ul>
              </p>
              <p>
                Seismic interpretation is crucial for understanding the Earth's subsurface for various purposes, including energy exploration, environmental studies, and hazard assessment.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
