"use client";

import React, { useState, useRef, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis
} from 'recharts';

// Main React component for the Resistivity Tomography application
export default function ResistivityTomography() {
  // State variables for user inputs
  const [technique, setTechnique] = useState('wenner');
  const [numElectrodes, setNumElectrodes] = useState(20);
  const [electrodeSpacing, setElectrodeSpacing] = useState(1.0);

  // State variables for graph data (can be simulated or uploaded)
  const [pseudosectionData, setPseudosectionData] = useState<any[]>([]);
  const [resistivityModelData, setResistivityModelData] = useState<any[]>([]);
  const [convergenceData, setConvergenceData] = useState<any[]>([]);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false); // State for showing explanation modal

  // State for LLM interpretation
  const [interpretationLoading, setInterpretationLoading] = useState(false);
  const [interpretationText, setInterpretationText] = useState('');
  const [interpretationError, setInterpretationError] = useState('');

  // Map of techniques to their descriptions
  const techniqueDescriptions: { [key: string]: string } = useMemo(() => ({
    'wenner': 'High signal strength, good vertical resolution. Ideal for stratigraphy and groundwater mapping.',
    'schlumberger': 'Moderate signal strength, good depth penetration. Suitable for deeper investigations.',
    'dipole-dipole': 'High horizontal resolution, but lower signal-to-noise ratio. Good for mapping faults and lateral changes.',
    'pole-dipole': 'Asymmetric array, good for complex geology and steeply dipping features.',
    'pole-pole': 'Offers the deepest penetration, but requires remote electrodes and is more susceptible to noise. Used for very deep investigations.',
    'gradient': 'Fast acquisition method, but generally less accurate for detailed imaging. Useful for rapid scanning.',
    'induced-polarization': 'Measures the ability of the subsurface to store electrical charge in addition to resistivity. Used in mineral exploration (e.g., sulfides), clay mapping, and contaminant detection.',
    'time-lapse': 'Repeated ERT surveys over time to monitor dynamic changes in subsurface resistivity. Applications include monitoring infiltration, leaks, seasonal groundwater changes, and remediation progress.',
    '3d-resistivity': 'Uses a grid of electrodes in both x and y directions to create full 3D resistivity models. Ideal for complex sites, archaeological investigations, and landslide studies.',
    'cross-borehole': 'Electrodes placed in boreholes to image the subsurface between them. Provides higher resolution at depth compared to surface ERT. Used for detailed site characterization, remediation monitoring, and reservoir monitoring.',
    'marine-underwater': 'ERT surveys adapted for lakebeds, rivers, or offshore settings, often using towed arrays or seabed electrodes. Applications include saltwater intrusion studies, sediment mapping, and offshore engineering projects.',
    'high-resolution-ultra-shallow': 'Employs very short electrode spacing (e.g., <1 m) to achieve fine-scale imaging of the shallow subsurface. Commonly used in archaeology, forensic studies, and detailed engineering site assessments.'
  }), []);

  const currentTechniqueDescription = techniqueDescriptions[technique];


  /**
   * Simulates the inversion process and generates dummy data for
   * pseudosection, resistivity model, and convergence plots.
   */
  const simulateInversion = () => {
    setIsLoading(true);
    setErrorMessage('');
    setShowResults(false); // Hide previous results
    setInterpretationText(''); // Clear previous interpretation
    setInterpretationError(''); // Clear previous interpretation error

    // Simulate a network request or heavy computation
    setTimeout(() => {
      try {
        const pseudoTempData: any[] = [];
        const modelTempData: any[] = [];
        const convergenceTempData: any[] = [];

        // --- Simulate Pseudosection Data ---
        // Generates apparent resistivity data points for a pseudosection plot.
        // The 'x' represents horizontal position, 'y' represents apparent depth,
        // and 'z' represents apparent resistivity. A high resistivity anomaly
        // is simulated in the center.
        for (let i = 0; i < numElectrodes - 1; i++) {
          for (let n = 1; n <= Math.floor((numElectrodes - 1 - i) / 2); n++) {
            const x = (i + n + (i + n + n)) / 2 * electrodeSpacing;
            const depth = n * electrodeSpacing * 0.5;

            let apparentResistivity = 100;
            // Simulate an anomaly in the middle
            if (x > (numElectrodes * electrodeSpacing / 4) && x < (numElectrodes * electrodeSpacing * 3 / 4) && depth < (numElectrodes * electrodeSpacing / 5)) {
              apparentResistivity = 500 + Math.random() * 200; // Higher resistivity for anomaly
            } else {
              apparentResistivity = 80 + Math.random() * 40; // Background resistivity
            }
            pseudoTempData.push({ x: x, y: depth, z: apparentResistivity });
          }
        }

        // --- Simulate Resistivity Model Data (Inverted Result) ---
        // Generates inverted true resistivity data points.
        // 'x' is horizontal position, 'y' is true depth (negative for plotting),
        // and 'z' is true resistivity. A deeper, more defined anomaly is simulated.
        const gridX = Array.from({ length: numElectrodes * 2 }, (_, i) => i * electrodeSpacing / 2);
        const gridY = Array.from({ length: 10 }, (_, i) => i * electrodeSpacing * 0.5);

        gridX.forEach(x => {
          gridY.forEach(y => {
            let trueResistivity = 100;
            // Simulate a true anomaly
            if (x > (numElectrodes * electrodeSpacing / 3) && x < (numElectrodes * electrodeSpacing * 2 / 3) && y > (electrodeSpacing * 2) && y < (electrodeSpacing * 5)) {
              trueResistivity = 600 + Math.random() * 100; // Higher resistivity for anomaly
            } else {
              trueResistivity = 90 + Math.random() * 20; // Background resistivity
            }
            modelTempData.push({ x: x, y: -y, z: trueResistivity }); // Negate Y for depth plotting
          });
        });

        // --- Simulate Convergence Data ---
        // Generates data for the RMS error reduction over inversion iterations.
        for (let i = 0; i < 15; i++) {
          convergenceTempData.push({
            iteration: i + 1,
            rmsError: 0.2 * Math.exp(-0.2 * i) + (Math.random() * 0.01) // Exponential decay with noise
          });
        }

        setPseudosectionData(pseudoTempData);
        setResistivityModelData(modelTempData);
        setConvergenceData(convergenceTempData);
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
   * Handles CSV file uploads for pseudosection or resistivity model data.
   * Parses the CSV and updates the corresponding state.
   * Expected CSV format: "horizontal_position,depth,resistivity_value"
   * @param event The file input change event.
   * @param dataType 'pseudosection' or 'model' to specify which data is being uploaded.
   */
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, dataType: 'pseudosection' | 'model') => {
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
        // Assuming the first line is a header and skipping it.
        const parsedData = lines.slice(1).map((line, index) => {
          const parts = line.split(',').map(part => part.trim()); // Trim whitespace from each part
          if (parts.length !== 3) {
            throw new Error(`Line ${index + 2} has incorrect number of columns. Expected 3, got ${parts.length}.`);
          }
          const [x, y, z] = parts.map(Number);
          if (isNaN(x) || isNaN(y) || isNaN(z)) {
            throw new Error(`Line ${index + 2} contains non-numeric data. Please ensure all values are numbers.`);
          }
          // Negate Y for depth in model data for correct plotting (deeper is more negative)
          return { x, y: dataType === 'model' ? -y : y, z };
        });

        if (parsedData.length === 0) {
          setErrorMessage('CSV file is empty or contains only headers.');
          setIsLoading(false);
          return;
        }

        if (dataType === 'pseudosection') {
          setPseudosectionData(parsedData);
        } else if (dataType === 'model') {
          setResistivityModelData(parsedData);
        }
        setConvergenceData([]); // Clear convergence data for uploaded files, as it's not in CSV
        setShowResults(true);
      } catch (error: any) {
        setErrorMessage(`Error parsing CSV for ${dataType}: ${error.message}. Please ensure format is 'x,y,z' and check for header rows or empty lines.`);
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
   * Helper function to get a color based on resistivity value for scatter plots.
   * Uses an HSL color scale from blue (low resistivity) to red (high resistivity).
   * @param value The resistivity value.
   * @returns An HSL color string.
   */
  const getResistivityColor = (value: number) => {
    // Determine min/max dynamically from current data for better scaling
    const allZValues = [...pseudosectionData.map(d => d.z), ...resistivityModelData.map(d => d.z)];
    const minVal = allZValues.length > 0 ? Math.min(...allZValues) : 50;
    const maxVal = allZValues.length > 0 ? Math.max(...allZValues) : 700;

    const normalized = (value - minVal) / (maxVal - minVal);
    const hue = (1 - normalized) * 240; // Blue (240) to Red (0)
    return `hsl(${hue}, 100%, 50%)`;
  };

  /**
   * Calls the Gemini API to get a geological interpretation of the resistivity model.
   * Extracts anomaly characteristics from the resistivityModelData to form the prompt.
   */
  const interpretResults = async () => {
    setInterpretationLoading(true);
    setInterpretationText('');
    setInterpretationError('');

    if (resistivityModelData.length === 0) {
      setInterpretationError('No resistivity model data to interpret. Please run a simulation or upload model data first.');
      setInterpretationLoading(false);
      return;
    }

    // Dynamically extract anomaly characteristics from resistivityModelData
    const zValues = resistivityModelData.map(d => d.z);
    if (zValues.length === 0) {
      setInterpretationError('Resistivity model data is empty, cannot interpret.');
      setInterpretationLoading(false);
      return;
    }

    const sortedZ = [...zValues].sort((a, b) => a - b);
    const minResistivity = sortedZ[0];
    const maxResistivity = sortedZ[sortedZ.length - 1];

    // Identify anomaly points (e.g., top 20% of highest resistivity values)
    const anomalyThreshold = sortedZ[Math.floor(sortedZ.length * 0.8)];
    const anomalyPoints = resistivityModelData.filter(d => d.z >= anomalyThreshold);

    let x1_anomaly, x2_anomaly, d1_anomaly, d2_anomaly, avg_anomaly_resistivity;
    let avg_background_resistivity;

    if (anomalyPoints.length > 0) {
      x1_anomaly = Math.min(...anomalyPoints.map(p => p.x)).toFixed(1);
      x2_anomaly = Math.max(...anomalyPoints.map(p => p.x)).toFixed(1);
      // Depths are negative in data for plotting, so we need to adjust for positive interpretation
      d1_anomaly = Math.abs(Math.max(...anomalyPoints.map(p => p.y))).toFixed(1); // Max of negative Y is shallowest depth (closest to 0)
      d2_anomaly = Math.abs(Math.min(...anomalyPoints.map(p => p.y))).toFixed(1); // Min of negative Y is deepest depth (most negative)
      avg_anomaly_resistivity = (anomalyPoints.reduce((sum, p) => sum + p.z, 0) / anomalyPoints.length).toFixed(1);

      const backgroundPoints = resistivityModelData.filter(d => d.z < anomalyThreshold);
      if (backgroundPoints.length > 0) {
        avg_background_resistivity = (backgroundPoints.reduce((sum, p) => sum + p.z, 0) / backgroundPoints.length).toFixed(1);
      } else {
        avg_background_resistivity = minResistivity.toFixed(1); // Fallback if no clear background points
      }

    } else {
      // Fallback if no clear anomaly is detected based on threshold
      setInterpretationError('Could not identify a clear anomaly for interpretation. The data might be uniform or the anomaly threshold needs adjustment.');
      setInterpretationLoading(false);
      return;
    }

    // Construct the prompt for the LLM based on extracted anomaly characteristics
    const prompt = `Based on geophysical resistivity tomography data, a significant anomaly was detected.
    It is located horizontally between ${x1_anomaly} meters and ${x2_anomaly} meters,
    and at depths between ${d1_anomaly} meters and ${d2_anomaly} meters from the surface.
    The anomaly exhibits a high resistivity of approximately ${avg_anomaly_resistivity} Ohm-m,
    compared to a background resistivity of around ${avg_background_resistivity} Ohm-m.

    Considering these characteristics (high resistivity, location, and depth range),
    what are some possible geological or subsurface features that could cause such an anomaly?
    Provide a brief, concise, and geologically plausible interpretation.`;

    try {
      let chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });
      const payload = { contents: chatHistory };
      // IMPORTANT: API key is automatically provided by Canvas at runtime when left empty.
      const apiKey = "";
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
    setTechnique('wenner');
    setNumElectrodes(20);
    setElectrodeSpacing(1.0);
    setPseudosectionData([]);
    setResistivityModelData([]);
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
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-500">
          Geophysical Resistivity Tomography
        </h1>
        <p className="text-gray-400 mt-3 text-lg">Simulated Inversion & Visualization with AI Interpretation</p>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row w-full max-w-7xl gap-8">
        {/* Input Panel */}
        <div className="w-full lg:w-1/4 dark:bg-dark p-6 rounded-xl shadow-2xl flex flex-col space-y-6 border border-gray-700">
          <h2 className="text-2xl font-bold text-blue-300 mb-4">Survey Parameters & Data Input</h2>

          {/* Tomography Technique Selector */}
          <div>
            <label htmlFor="technique" className="block text-gray-400 text-sm font-medium mb-2">
              Tomography Technique
            </label>
            <select
              id="technique"
              className="w-full p-3 dark:bg-dark border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-200"
              value={technique}
              onChange={(e) => setTechnique(e.target.value)}
            >
              <option value="wenner">Wenner</option>
              <option value="schlumberger">Schlumberger</option>
              <option value="dipole-dipole">Dipole-Dipole</option>
              <option value="pole-dipole">Pole-Dipole</option>
              <option value="pole-pole">Pole-Pole</option>
              <option value="gradient">Gradient</option>
              <option value="induced-polarization">Induced Polarization (IP) Tomography</option>
              <option value="time-lapse">Time-Lapse (4D) Resistivity Tomography</option>
              <option value="3d-resistivity">3D Resistivity Tomography</option>
              <option value="cross-borehole">Cross-Borehole Electrical Tomography</option>
              <option value="marine-underwater">Marine and Underwater ERT</option>
              <option value="high-resolution-ultra-shallow">High-Resolution or Ultra-Shallow ERT</option>
            </select>
            {currentTechniqueDescription && (
              <p className="text-gray-500 text-xs mt-2 italic">{currentTechniqueDescription}</p>
            )}
          </div>

          {/* Number of Electrodes Input */}
          <div>
            <label htmlFor="numElectrodes" className="block text-gray-400 text-sm font-medium mb-2">
              Number of Electrodes
            </label>
            <input
              type="number"
              id="numElectrodes"
              className="w-full p-3 dark:bg-dark border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-200"
              value={numElectrodes}
              onChange={(e) => setNumElectrodes(Math.max(4, parseInt(e.target.value) || 0))}
              min="4"
            />
          </div>

          {/* Electrode Spacing Input */}
          <div>
            <label htmlFor="electrodeSpacing" className="block text-gray-400 text-sm font-medium mb-2">
              Electrode Spacing (m)
            </label>
            <input
              type="number"
              id="electrodeSpacing"
              className="w-full p-3 dark:bg-dark border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-200"
              value={electrodeSpacing}
              onChange={(e) => setElectrodeSpacing(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
              step="0.1"
              min="0.1"
            />
          </div>

          {/* Simulate Inversion Button */}
          <button
            onClick={simulateInversion}
            className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 mt-6"
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
            <h3 className="text-xl font-bold text-blue-300 mb-4">Upload Your Data (CSV)</h3>
            <div className="mb-4">
              <label htmlFor="pseudosectionUpload" className="block text-gray-400 text-sm font-medium mb-2">
                Upload Pseudosection CSV
              </label>
              <input
                type="file"
                id="pseudosectionUpload"
                accept=".csv"
                className="w-full p-2 dark:bg-dark border border-gray-600 rounded-lg text-gray-200 file:mr-4 file:py-2 file:px-4
                           file:rounded-full file:border-0 file:text-sm file:font-semibold
                           file:bg-cyan-500 file:text-white hover:file:bg-cyan-600 cursor-pointer"
                onChange={(e) => handleFileUpload(e, 'pseudosection')}
              />
            </div>
            <div>
              <label htmlFor="modelUpload" className="block text-gray-400 text-sm font-medium mb-2">
                Upload Resistivity Model CSV
              </label>
              <input
                type="file"
                id="modelUpload"
                accept=".csv"
                className="w-full p-2 dark:bg-dark border border-gray-600 rounded-lg text-gray-200 file:mr-4 file:py-2 file:px-4
                           file:rounded-full file:border-0 file:text-sm file:font-semibold
                           file:bg-cyan-500 file:text-white hover:file:bg-cyan-600 cursor-pointer"
                onChange={(e) => handleFileUpload(e, 'model')}
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
          <h2 className="text-2xl font-bold text-blue-300">Inversion Results</h2>

          {!showResults && !isLoading && (
            <div className="text-center text-gray-500 py-16">
              <p className="text-lg">Enter survey parameters and click "Simulate & Generate Dummy Data" or upload your own CSV files to see results.</p>
              <button
                onClick={() => setShowExplanation(true)}
                className="mt-6 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md transition duration-300"
              >
                What is Resistivity Tomography?
              </button>
            </div>
          )}

          {isLoading && (
            <div className="text-center text-gray-400 py-16">
              <p className="text-lg">Processing data...</p>
              <div className="mt-4">
                <svg className="animate-spin h-8 w-8 text-cyan-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            </div>
          )}

          {showResults && (
            <>
              {/* Graphs Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Simulated Pseudosection */}
                <div className="dark:bg-dark p-4 rounded-lg shadow-xl border border-gray-700">
                  <h3 className="text-xl font-medium text-gray-200 mb-4">Pseudosection ({technique} Array)</h3>
                  <p className="text-gray-400 text-sm mb-2">
                    Apparent resistivity values plotted against horizontal position and apparent depth.
                  </p>
                  <div>
                    <ResponsiveContainer width="100%" height={300}>
                      <ScatterChart
                        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#4a4a4a" />
                        <XAxis type="number" dataKey="x" name="Horizontal Position (m)" stroke="#b0bec5" />
                        <YAxis type="number" dataKey="y" name="Apparent Depth (m)" stroke="#b0bec5" reversed />
                        <ZAxis type="number" dataKey="z" name="Apparent Resistivity (Ohm-m)" range={[10, 1000]} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff', borderRadius: '8px' }} formatter={(value: any) => [`${value.toFixed(1)} Ohm-m`, 'Resistivity']} />
                        <Legend wrapperStyle={{ color: '#b0bec5', paddingTop: '10px' }} />
                        <Scatter name="Apparent Resistivity" data={pseudosectionData} fill="#8884d8">
                          {pseudosectionData.map((entry, index) => (
                            <Scatter key={`cell-${index}`} fill={getResistivityColor(entry.z)} />
                          ))}
                        </Scatter>
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center items-center mt-2">
                    <div className="w-full h-4 bg-gradient-to-r from-blue-500 to-red-500 rounded-full"></div>
                    <span className="ml-2 text-gray-400 text-xs">Low Resistivity - High Resistivity</span>
                  </div>
                </div>

                {/* Simulated Resistivity Model */}
                <div className="dark:bg-dark p-4 rounded-lg shadow-xl border border-gray-700">
                  <h3 className="text-xl font-medium text-gray-200 mb-4">Resistivity Model (Inverted)</h3>
                  <p className="text-gray-400 text-sm mb-2">
                    Inverted true resistivity distribution at different depths.
                  </p>
                  <div>
                    <ResponsiveContainer width="100%" height={300}>
                      <ScatterChart
                        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#4a4a4a" />
                        <XAxis type="number" dataKey="x" name="Horizontal Position (m)" stroke="#b0bec5" />
                        <YAxis type="number" dataKey="y" name="True Depth (m)" stroke="#b0bec5" reversed />
                        <ZAxis type="number" dataKey="z" name="True Resistivity (Ohm-m)" range={[10, 1000]} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff', borderRadius: '8px' }} formatter={(value: any) => [`${value.toFixed(1)} Ohm-m`, 'Resistivity']} />
                        <Legend wrapperStyle={{ color: '#b0bec5', paddingTop: '10px' }} />
                        <Scatter name="True Resistivity" data={resistivityModelData} fill="#82ca9d">
                          {resistivityModelData.map((entry, index) => (
                            <Scatter key={`cell-${index}`} fill={getResistivityColor(entry.z)} />
                          ))}
                        </Scatter>
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center items-center mt-2">
                    <div className="w-full h-4 bg-gradient-to-r from-blue-500 to-red-500 rounded-full"></div>
                    <span className="ml-2 text-gray-400 text-xs">Low Resistivity - High Resistivity</span>
                  </div>
                </div>
              </div>

              {/* LLM Interpretation and Convergence Plot */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* LLM Interpretation */}
                <div className="dark:bg-dark p-4 rounded-lg shadow-xl border border-gray-700 flex flex-col">
                  <h3 className="text-xl font-medium text-gray-200 mb-4">Geological Interpretation</h3>
                  <p className="text-gray-400 text-sm mb-2">
                    Get an AI-powered interpretation of the resistivity model.
                  </p>
                  <button
                    onClick={interpretResults}
                    className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out
                               focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 mt-auto"
                    disabled={interpretationLoading || resistivityModelData.length === 0}
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

                {/* Simulated Convergence Plot */}
                <div className="dark:bg-dark p-4 rounded-lg shadow-xl border border-gray-700">
                  <h3 className="text-xl font-medium text-gray-200 mb-4">Simulated Inversion Convergence</h3>
                  <p className="text-gray-400 text-sm mb-2">
                    Shows how the Root Mean Square (RMS) error decreases with each iteration of the inversion. (Only available with simulated data)
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
                          <Line type="monotone" dataKey="rmsError" stroke="#8884d8" activeDot={{ r: 8 }} name="RMS Error" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-10">
                      <p>Convergence data is only available when simulating data, not with CSV uploads.</p>
                    </div>
                  )}
                </div>
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
            <h3 className="text-2xl font-bold text-blue-300 mb-4">Understanding Resistivity Tomography</h3>
            <div className="text-gray-300 space-y-4 text-base max-h-96 overflow-y-auto pr-4">
              <p>
                <strong>Electrical Resistivity Tomography (ERT)</strong> is a geophysical method used to image the subsurface electrical resistivity distribution. It involves injecting electric current into the ground through a pair of electrodes and measuring the resulting potential difference through another pair of electrodes. By varying the electrode configurations and spacing, a 2D or 3D image of the subsurface resistivity can be constructed.
              </p>
              <p>
                <strong>How it Works:</strong>
                <br/>
                ERT surveys typically involve:
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li><strong>Data Acquisition:</strong> A series of electrodes are laid out on the ground. A current is injected, and voltage is measured for various electrode combinations. This generates "apparent resistivity" data.</li>
                  <li><strong>Pseudosection:</strong> The apparent resistivity data is often plotted as a pseudosection, which gives a qualitative visual representation of how resistivity changes with depth and horizontal position. It's not a true geological cross-section but helps visualize the raw data.</li>
                  <li><strong>Inversion:</strong> The apparent resistivity data is then processed using numerical inversion techniques. This complex mathematical process converts the apparent resistivity values into a "true resistivity model" of the subsurface, which more accurately reflects the actual geological structures and their electrical properties.</li>
                  <li><strong>Convergence:</strong> During inversion, the software iteratively adjusts the subsurface model until the calculated apparent resistivities from the model match the measured apparent resistivities within an acceptable error (e.g., Root Mean Square or RMS error). The convergence plot shows how this error decreases with each iteration.</li>
                </ul>
              </p>
              <p>
                <strong>Interpreting Resistivity Values:</strong>
                <br/>
                Different geological materials have characteristic resistivity ranges:
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li><strong>Low Resistivity (Conductive):</strong> Often indicates materials like clay, saturated soils (especially with saline water), graphite, sulfide minerals, or highly fractured rocks filled with conductive fluids.</li>
                  <li><strong>High Resistivity (Resistive):</strong> Typically suggests materials such as dry sand, gravel, bedrock (e.g., granite, limestone), ice, air-filled voids, or contaminated areas with non-conductive fluids.</li>
                </ul>
              </p>
              <p>
                <strong>Common ERT Techniques (Electrode Arrays):</strong>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li><strong>Wenner:</strong> Good signal-to-noise ratio, good vertical resolution, often used for stratigraphy and groundwater.</li>
                  <li><strong>Schlumberger:</strong> Better depth penetration than Wenner for a given spread, efficient for sounding.</li>
                  <li><strong>Dipole-Dipole:</strong> Excellent horizontal resolution, good for mapping vertical structures like faults, but lower signal strength.</li>
                  <li><strong>Pole-Dipole:</strong> Asymmetric array, useful for complex geological settings and steeply dipping features.</li>
                  <li><strong>Pole-Pole:</strong> Deepest penetration, but requires remote electrodes and is highly susceptible to noise.</li>
                  <li><strong>Gradient:</strong> Fast data acquisition, suitable for rapid reconnaissance surveys.</li>
                  <li><strong>Induced Polarization (IP):</strong> Measures chargeability in addition to resistivity, useful for mineral exploration (e.g., disseminated sulfides) and environmental studies.</li>
                  <li><strong>Time-Lapse (4D) Resistivity:</strong> Repeated surveys over time to monitor dynamic processes like groundwater flow, contaminant plumes, or remediation efforts.</li>
                  <li><strong>3D Resistivity:</strong> Uses a grid of electrodes to create full 3D subsurface models, ideal for complex sites and archaeological investigations.</li>
                  <li><strong>Cross-Borehole ERT:</strong> Electrodes placed in boreholes, providing high resolution imaging between boreholes, useful for detailed site characterization at depth.</li>
                  <li><strong>Marine and Underwater ERT:</strong> Adapted for aquatic environments, used for seabed mapping, saltwater intrusion, and offshore engineering.</li>
                  <li><strong>High-Resolution or Ultra-Shallow ERT:</strong> Very small electrode spacing for extremely detailed imaging of the near-surface, common in archaeology and forensic geology.</li>
                </ul>
              </p>
              <p>
                ERT is widely applied in environmental investigations, hydrogeology, engineering geology, mineral exploration, and archaeological studies to non-invasively characterize the subsurface.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
