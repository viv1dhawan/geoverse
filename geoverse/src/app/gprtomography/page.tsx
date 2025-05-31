"use client";

import React, { useState } from "react";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ZAxis
} from 'recharts';

interface GPRDataPoint {
  x: number; // Horizontal position (e.g., along survey line)
  y: number; // Depth or Two-Way Travel Time (TWTT)
  z: number; // GPR Amplitude or Reflectivity value
}

export default function GPRTomography() {
  // State for GPR data and UI
  const [gprData, setGprData] = useState<GPRDataPoint[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false); // State for showing explanation modal

  // State for GPR simulation parameters
  const [numTraces, setNumTraces] = useState(50); // Number of GPR traces
  const [traceSpacing, setTraceSpacing] = useState(0.1); // Spacing between traces (m)
  const [pointsPerTrace, setPointsPerTrace] = useState(100); // Number of data points per trace (depth/TWTT samples)
  const [maxDepthOrTWTT, setMaxDepthOrTWTT] = useState(10); // Maximum depth or TWTT for simulation

  // State for LLM interpretation
  const [interpretationLoading, setInterpretationLoading] = useState(false);
  const [interpretationText, setInterpretationText] = useState('');
  const [interpretationError, setInterpretationError] = useState('');

  /**
   * Simulates GPR data based on user-defined parameters.
   * Generates a dummy GPR profile with a simulated anomaly.
   */
  const simulateGPRData = () => {
    setIsLoading(true);
    setErrorMessage('');
    setShowResults(false);
    setInterpretationText('');
    setInterpretationError('');
    setGprData([]); // Clear previous data

    setTimeout(() => {
      try {
        const simulatedData: GPRDataPoint[] = [];
        const horizontalExtent = numTraces * traceSpacing;

        for (let i = 0; i < numTraces; i++) {
          const currentX = i * traceSpacing;
          for (let j = 0; j < pointsPerTrace; j++) {
            const currentY = (j / pointsPerTrace) * maxDepthOrTWTT; // Normalize to max depth/TWTT

            let gprValue = Math.sin(currentY * 5) * 20 + Math.random() * 10; // Basic wave-like pattern
            gprValue += Math.cos(currentX * 2) * 15; // Add some horizontal variation

            // Simulate a subsurface anomaly (e.g., a buried object or layer change)
            // This anomaly will appear as a distinct change in GPR amplitude/reflectivity
            const anomalyStartX = horizontalExtent * 0.3;
            const anomalyEndX = horizontalExtent * 0.7;
            const anomalyDepthStart = maxDepthOrTWTT * 0.4;
            const anomalyDepthEnd = maxDepthOrTWTT * 0.6;

            if (currentX > anomalyStartX && currentX < anomalyEndX &&
                currentY > anomalyDepthStart && currentY < anomalyDepthEnd) {
              gprValue += 50 + Math.random() * 30; // Higher amplitude for anomaly
            } else {
              gprValue += 20 + Math.random() * 5; // Background amplitude
            }
            simulatedData.push({ x: currentX, y: currentY, z: gprValue });
          }
        }
        setGprData(simulatedData);
        setShowResults(true);
      } catch (error: any) {
        setErrorMessage('Error during GPR data simulation: ' + error.message);
        console.error('Simulation error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 1000); // Simulate loading time
  };

  /**
   * Handles CSV file uploads for GPR data.
   * Parses the CSV and updates the state.
   * Expected CSV format: "horizontal_position, depth_or_twtt, gpr_value"
   * @param event The file input change event.
   */
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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
    setGprData([]); // Clear previous data
    setShowResults(false);
    setInterpretationText('');
    setInterpretationError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      try {
        const lines = text.split('\n').filter(line => line.trim() !== '');
        // Assuming the first line is a header and skipping it.
        const parsedData = lines.slice(1).map((line, index) => {
          const parts = line.split(',').map(part => part.trim());
          if (parts.length !== 3) {
            throw new Error(`Line ${index + 2} has incorrect number of columns. Expected 3, got ${parts.length}.`);
          }
          const [x, y, z] = parts.map(Number);
          if (isNaN(x) || isNaN(y) || isNaN(z)) {
            throw new Error(`Line ${index + 2} contains non-numeric data. Please ensure all values are numbers.`);
          }
          return { x, y, z };
        }) as GPRDataPoint[];

        if (parsedData.length === 0) {
          setErrorMessage('CSV file is empty or contains only headers.');
          setIsLoading(false);
          return;
        }

        setGprData(parsedData);
        setShowResults(true);
      } catch (error: any) {
        setErrorMessage(`Error parsing CSV: ${error.message}`);
        console.error('CSV parsing error:', error);
        setGprData([]);
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
   * Helper function to get a color based on the GPR value.
   * Uses an HSL color scale from blue (low value) to red (high value),
   * similar to the resistivity color scheme for consistency.
   * @param value The GPR amplitude or velocity value.
   * @returns An HSL color string.
   */
  const getGPRColor = (value: number) => {
    if (gprData.length === 0) return 'hsl(240, 100%, 50%)'; // Default blue

    const zValues = gprData.map(d => d.z);
    const minVal = Math.min(...zValues);
    const maxVal = Math.max(...zValues);

    if (maxVal === minVal) {
      return 'hsl(240, 100%, 50%)'; // If all values are the same, return a single color
    }

    const normalized = (value - minVal) / (maxVal - minVal);
    // Hue ranges from 240 (blue) to 0 (red).
    // (1 - normalized) makes lower values blue and higher values red.
    const hue = (1 - normalized) * 240;
    return `hsl(${hue.toFixed(0)}, 100%, 50%)`;
  };

  /**
   * Calls the Gemini API to get an interpretation of the GPR data.
   * Extracts anomaly characteristics from the GPR data to form the prompt.
   */
  const interpretGPRResults = async () => {
    setInterpretationLoading(true);
    setInterpretationText('');
    setInterpretationError('');

    if (gprData.length === 0) {
      setInterpretationError('No GPR data to interpret. Please simulate or upload data first.');
      setInterpretationLoading(false);
      return;
    }

    const zValues = gprData.map(d => d.z);
    if (zValues.length === 0) {
      setInterpretationError('GPR data is empty, cannot interpret.');
      setInterpretationLoading(false);
      return;
    }

    const sortedZ = [...zValues].sort((a, b) => a - b);
    const minGPRValue = sortedZ[0];
    const maxGPRValue = sortedZ[sortedZ.length - 1];

    // Identify anomaly points based on a threshold (e.g., top 10% of highest/lowest values)
    // For GPR, anomalies can be high amplitude reflections (e.g., buried objects)
    // or low amplitude areas (e.g., voids, highly attenuating materials).
    // Let's focus on high amplitude for this example.
    const highAmplitudeThreshold = sortedZ[Math.floor(sortedZ.length * 0.9)];
    const highAmplitudeAnomalyPoints = gprData.filter(d => d.z >= highAmplitudeThreshold);

    let x1_anomaly, x2_anomaly, y1_anomaly, y2_anomaly, avg_anomaly_amplitude;
    let avg_background_amplitude;

    if (highAmplitudeAnomalyPoints.length > 0) {
      x1_anomaly = Math.min(...highAmplitudeAnomalyPoints.map(p => p.x)).toFixed(1);
      x2_anomaly = Math.max(...highAmplitudeAnomalyPoints.map(p => p.x)).toFixed(1);
      y1_anomaly = Math.min(...highAmplitudeAnomalyPoints.map(p => p.y)).toFixed(1);
      y2_anomaly = Math.max(...highAmplitudeAnomalyPoints.map(p => p.y)).toFixed(1);
      avg_anomaly_amplitude = (highAmplitudeAnomalyPoints.reduce((sum, p) => sum + p.z, 0) / highAmplitudeAnomalyPoints.length).toFixed(1);

      const backgroundPoints = gprData.filter(d => d.z < highAmplitudeThreshold);
      if (backgroundPoints.length > 0) {
        avg_background_amplitude = (backgroundPoints.reduce((sum, p) => sum + p.z, 0) / backgroundPoints.length).toFixed(1);
      } else {
        avg_background_amplitude = minGPRValue.toFixed(1); // Fallback if no clear background points
      }

    } else {
      setInterpretationError('Could not identify a clear high-amplitude anomaly for interpretation. The GPR data might be uniform or the anomaly threshold needs adjustment.');
      setInterpretationLoading(false);
      return;
    }

    const prompt = `Based on Ground Penetrating Radar (GPR) data, a significant high-amplitude reflection anomaly was detected. It is located horizontally between ${x1_anomaly} meters and ${x2_anomaly} meters, and at depths (or two-way travel times) between ${y1_anomaly} and ${y2_anomaly} units. The anomaly exhibits an average amplitude of approximately ${avg_anomaly_amplitude}, compared to a background amplitude of around ${avg_background_amplitude}. What are some possible subsurface features or materials that could cause such a high-amplitude GPR anomaly in this context? Provide a brief, concise interpretation.`;

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
        setInterpretationError('Failed to get interpretation from LLM. Unexpected response structure.');
        console.error('LLM response error:', result);
      }
    } catch (error: any) {
      setInterpretationError('Error calling LLM: ' + error.message);
      console.error('LLM fetch error:', error);
    } finally {
      setInterpretationLoading(false);
    }
  };

  /**
   * Resets all state variables to their initial values, clearing inputs and results.
   */
  const resetApplication = () => {
    setNumTraces(50);
    setTraceSpacing(0.1);
    setPointsPerTrace(100);
    setMaxDepthOrTWTT(10);
    setGprData([]);
    setErrorMessage('');
    setIsLoading(false);
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
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-green-500">
          Ground Penetrating Radar (GPR) Tomography
        </h1>
        <p className="text-gray-400 mt-3 text-lg">Simulate or Upload GPR data for visualization and AI interpretation.</p>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row w-full max-w-7xl gap-8">
        {/* Input Panel */}
        <div className="w-full lg:w-1/4 dark:bg-dark p-6 rounded-xl shadow-2xl flex flex-col space-y-6 border border-gray-700">
          <h2 className="text-2xl font-bold text-teal-300 mb-4">GPR Parameters & Data Input</h2>

          {/* Simulation Parameters */}
          <div className="border-b border-gray-700 pb-6">
            <h3 className="text-xl font-bold text-teal-300 mb-4">Simulate GPR Data</h3>
            <div>
              <label htmlFor="numTraces" className="block text-gray-400 text-sm font-medium mb-2">
                Number of Traces
              </label>
              <input
                type="number"
                id="numTraces"
                className="w-full p-3 dark:bg-dark border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-200"
                value={numTraces}
                onChange={(e) => setNumTraces(Math.max(10, parseInt(e.target.value) || 10))}
                min="10"
              />
            </div>
            <div className="mt-4">
              <label htmlFor="traceSpacing" className="block text-gray-400 text-sm font-medium mb-2">
                Trace Spacing (m)
              </label>
              <input
                type="number"
                id="traceSpacing"
                className="w-full p-3 dark:bg-dark border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-200"
                value={traceSpacing}
                onChange={(e) => setTraceSpacing(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
                step="0.01"
                min="0.01"
              />
            </div>
            <div className="mt-4">
              <label htmlFor="maxDepthOrTWTT" className="block text-gray-400 text-sm font-medium mb-2">
                Max Depth / TWTT
              </label>
              <input
                type="number"
                id="maxDepthOrTWTT"
                className="w-full p-3 dark:bg-dark border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-200"
                value={maxDepthOrTWTT}
                onChange={(e) => setMaxDepthOrTWTT(Math.max(1, parseFloat(e.target.value) || 1))}
                step="0.1"
                min="1"
              />
            </div>
            <button
              onClick={simulateGPRData}
              className="w-full py-3 px-6 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out
                          focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-gray-900 mt-6"
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
                'Simulate GPR Data'
              )}
            </button>
          </div>

          {/* CSV Upload Section */}
          <div className="border-t border-gray-700 pt-6 mt-6">
            <h3 className="text-xl font-bold text-teal-300 mb-4">Upload Your GPR Data (CSV)</h3>
            <div>
              <label htmlFor="gprUpload" className="block text-gray-400 text-sm font-medium mb-2">
                Upload GPR CSV
              </label>
              <input
                type="file"
                id="gprUpload"
                accept=".csv"
                className="w-full p-2 dark:bg-dark border border-gray-600 rounded-lg text-gray-200 file:mr-4 file:py-2 file:px-4
                           file:rounded-full file:border-0 file:text-sm file:font-semibold
                           file:bg-teal-500 file:text-white hover:file:bg-teal-600 cursor-pointer"
                onChange={handleFileUpload}
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
          <h2 className="text-2xl font-bold text-teal-300">GPR Results</h2>

          {!showResults && !isLoading && (
            <div className="text-center text-gray-500 py-16">
              <p className="text-lg">Simulate GPR data or upload your own CSV file to see results.</p>
              <button
                onClick={() => setShowExplanation(true)}
                className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition duration-300"
              >
                What is GPR?
              </button>
            </div>
          )}

          {isLoading && (
            <div className="text-center text-gray-400 py-16">
              <p className="text-lg">Processing data...</p>
              <div className="mt-4">
                <svg className="animate-spin h-8 w-8 text-teal-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            </div>
          )}

          {showResults && (
            <>
              {/* GPR Data Plot */}
              <div className="dark:bg-dark p-4 rounded-lg shadow-xl border border-gray-700">
                <h3 className="text-xl font-medium text-gray-200 mb-4">GPR Profile</h3>
                <p className="text-gray-400 text-sm mb-2">
                  GPR amplitude/reflectivity values plotted against horizontal position and depth/TWTT.
                </p>
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#4a4a4a" />
                    <XAxis type="number" dataKey="x" name="Horizontal Position (m)" stroke="#b0bec5" tickFormatter={(value) => value.toFixed(1)} />
                    {/* Y-axis can represent Two-Way Travel Time (TWTT) or converted Depth */}
                    <YAxis type="number" dataKey="y" name="Depth / TWTT" stroke="#b0bec5" reversed tickFormatter={(value) => value.toFixed(1)} />
                    <ZAxis type="number" dataKey="z" name="GPR Value" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff', borderRadius: '8px' }} formatter={(value: any) => [`${value.toFixed(2)}`, 'Value']} />
                    <Legend wrapperStyle={{ color: '#b0bec5', paddingTop: '10px' }} />
                    <Scatter name="GPR Value" data={gprData} fill="#82ca9d">
                      {gprData.map((entry, index) => (
                        <Scatter key={`gpr-point-${index}`} fill={getGPRColor(entry.z)} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
                <div className="flex justify-center items-center mt-2">
                  <div className="w-full h-4 bg-gradient-to-r from-blue-500 to-red-500 rounded-full"></div>
                  <span className="ml-2 text-gray-400 text-xs">Low Value - High Value</span>
                </div>
              </div>

              {/* LLM Interpretation */}
              <div className="dark:bg-dark p-4 rounded-lg shadow-xl border border-gray-700 flex flex-col">
                <h3 className="text-xl font-medium text-gray-200 mb-4">Geological Interpretation</h3>
                <p className="text-gray-400 text-sm mb-2">
                  Get an AI-powered interpretation of the GPR data.
                </p>
                <button
                  onClick={interpretGPRResults}
                  className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out
                             focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 mt-auto" // mt-auto pushes button to bottom
                  disabled={interpretationLoading || gprData.length === 0}
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
            <h3 className="text-2xl font-bold text-teal-300 mb-4">What is Ground Penetrating Radar (GPR)?</h3>
            <div className="text-gray-300 space-y-4 text-base max-h-96 overflow-y-auto pr-4">
              <p>
                <strong>Ground Penetrating Radar (GPR)</strong> is a geophysical method that uses radar pulses to image the subsurface. It's a non-invasive technique primarily used for shallow investigations, typically ranging from a few centimeters to tens of meters in depth, depending on the material properties and antenna frequency.
              </p>
              <p>
                <strong>How GPR Works:</strong>
                <br/>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li><strong>Antenna:</strong> A GPR system consists of a transmitting antenna and a receiving antenna. The transmitting antenna emits high-frequency electromagnetic (radar) waves into the ground.</li>
                  <li><strong>Wave Propagation and Reflection:</strong> These radar waves travel through the subsurface. When they encounter changes in electrical properties (like dielectric permittivity and electrical conductivity) of the materials, a portion of the wave energy is reflected back to the surface.</li>
                  <li><strong>Receiving and Recording:</strong> The receiving antenna detects these reflected waves. The time it takes for a wave to travel from the transmitter, reflect off a subsurface feature, and return to the receiver is called the <strong>Two-Way Travel Time (TWTT)</strong>.</li>
                  <li><strong>Data Collection:</strong> As the GPR system is moved along a survey line, a series of individual radar traces are collected, forming a profile or radargram.</li>
                </ul>
              </p>
              <p>
                <strong>Interpreting GPR Data:</strong>
                <br/>
                GPR data is typically displayed as a 2D profile (radargram) where the horizontal axis represents distance along the survey line, and the vertical axis represents TWTT (or converted depth). Reflections appear as distinct events, often hyperbolas, which are characteristic of point targets (like buried pipes or boulders) or dipping layers.
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li><strong>High Amplitude Reflections:</strong> Often indicate strong contrasts in material properties, such as the boundary between soil and a buried concrete slab, metal object, or a significant change in water content.</li>
                  <li><strong>Hyperbolas:</strong> The classic signature of discrete buried objects (e.g., pipes, drums, rocks). The apex of the hyperbola corresponds to the object's horizontal position, and its depth can be estimated from the TWTT.</li>
                  <li><strong>Layered Reflections:</strong> Horizontal or gently dipping reflections can indicate sedimentary layering, soil horizons, or bedrock interfaces.</li>
                  <li><strong>Diffractions:</strong> Similar to hyperbolas, but can also arise from edges of features or small scatterers.</li>
                  <li><strong>Signal Attenuation:</strong> The loss of GPR signal strength. High attenuation can be caused by conductive materials (like clay or saline water), limiting depth penetration.</li>
                </ul>
              </p>
              <p>
                <strong>Common Applications of GPR:</strong>
                <br/>
                GPR is a versatile tool used in various fields:
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li><strong>Utility Locating:</strong> Finding buried pipes, cables, and other infrastructure.</li>
                  <li><strong>Environmental Site Characterization:</strong> Mapping contaminant plumes, buried waste, and groundwater levels.</li>
                  <li><strong>Archaeology:</strong> Detecting buried foundations, artifacts, and ancient structures.</li>
                  <li><strong>Forensics:</strong> Locating buried evidence or clandestine graves.</li>
                  <li><strong>Geotechnical Engineering:</strong> Assessing concrete structures, pavement thickness, bridge decks, and identifying voids or sinkholes.</li>
                  <li><strong>Geology and Hydrogeology:</strong> Mapping shallow bedrock, soil layers, and groundwater aquifers.</li>
                </ul>
              </p>
              <p>
                The interpretation of GPR data requires understanding of wave propagation physics and geological contexts to accurately identify and characterize subsurface features.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
