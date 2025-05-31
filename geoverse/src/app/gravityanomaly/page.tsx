"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine
} from 'recharts';

// Main React component for the Gravity Anomalies application
export default function GravityAnomalies() {
  // State variables for user inputs and simulation parameters
  const [stationSpacing, setStationSpacing] = useState(5.0); // meters
  const [averageElevation, setAverageElevation] = useState(100.0); // meters
  const [crustalDensity, setCrustalDensity] = useState(2.67); // g/cm³

  // Anomaly simulation parameters (new features)
  const [anomalyMagnitude, setAnomalyMagnitude] = useState(20); // mGal
  const [anomalyCenterRatio, setAnomalyCenterRatio] = useState(0.5); // 0.0 to 1.0 (percentage of total stations)
  const [anomalyWidthRatio, setAnomalyWidthRatio] = useState(0.2); // 0.0 to 1.0 (percentage of total stations)

  // State variables for graph data
  const [observedGravityData, setObservedGravityData] = useState<any[]>([]);
  const [freeAirAnomalyData, setFreeAirAnomalyData] = useState<any[]>([]);
  const [bouguerAnomalyData, setBouguerAnomalyData] = useState<any[]>([]);

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
  }, [stationSpacing, averageElevation, crustalDensity, anomalyMagnitude, anomalyCenterRatio, anomalyWidthRatio, observedGravityData]);

  /**
   * Simulates gravity data including observed gravity and various corrections.
   * Generates Free-Air and Bouguer anomalies based on user-defined parameters.
   */
  const simulateGravityData = () => {
    setIsLoading(true);
    setErrorMessage('');
    setShowResults(false);
    setInterpretationText('');
    setInterpretationError('');

    // Simulate a delay for better user experience
    setTimeout(() => {
      try {
        const numStations = 50;
        const tempObservedGravity: any[] = [];
        const tempFreeAirAnomaly: any[] = [];
        const tempBouguerAnomaly: any[] = [];

        // Constants for gravity corrections (simplified)
        const freeAirGradient = 0.3086; // mGal/meter
        const bouguerConstant = 0.0419; // mGal/(g/cm³ * meter)

        // Calculate anomaly properties based on ratios
        const totalSurveyLength = numStations * stationSpacing;
        const anomalyCenter = totalSurveyLength * anomalyCenterRatio;
        const anomalyEffectiveWidth = totalSurveyLength * anomalyWidthRatio; // Use as a half-width for a smoother anomaly

        for (let i = 0; i < numStations; i++) {
          const station = i * stationSpacing;
          // Simulate varying elevation with some noise
          let elevation = averageElevation + Math.sin(i / 5) * 5 + Math.random() * 2;

          // Base observed gravity
          let observedGravity = 980000 + Math.random() * 10; // Base gravity in mGal

          // Add a simulated subsurface anomaly (e.g., a dense body)
          const distanceToAnomaly = Math.abs(station - anomalyCenter);
          if (distanceToAnomaly < anomalyEffectiveWidth) {
            // Gaussian-like anomaly profile
            observedGravity += anomalyMagnitude * Math.exp(-0.5 * (distanceToAnomaly / (anomalyEffectiveWidth / 2))**2);
          }
          // Small elevation effect on observed gravity
          observedGravity += (elevation - averageElevation) * 0.1;

          // Free-Air Correction (FAC)
          const freeAirCorrection = freeAirGradient * elevation;
          // Free-Air Anomaly (FAA) = Observed Gravity - Theoretical Gravity + FAC
          // For simplicity, we'll assume a constant theoretical gravity and just show the relative anomaly
          const freeAirAnomaly = observedGravity + freeAirCorrection - 980000; // Relative to a base

          // Bouguer Correction (BC)
          const bouguerCorrection = bouguerConstant * crustalDensity * elevation;
          // Terrain Correction (TC) - simplified as random noise for simulation
          const terrainCorrection = Math.random() * 0.5 - 0.25; // Small random terrain effect

          // Bouguer Anomaly (BA) = FAA - BC + TC (or Observed + FAC - BC + TC)
          const bouguerAnomaly = freeAirAnomaly - bouguerCorrection + terrainCorrection;

          tempObservedGravity.push({ station, value: observedGravity });
          tempFreeAirAnomaly.push({ station, value: freeAirAnomaly });
          tempBouguerAnomaly.push({ station, value: bouguerAnomaly });
        }

        setObservedGravityData(tempObservedGravity);
        setFreeAirAnomalyData(tempFreeAirAnomaly);
        setBouguerAnomalyData(tempBouguerAnomaly);
        setShowResults(true);

      } catch (error: any) {
        setErrorMessage('Error during simulation: ' + error.message);
        console.error('Simulation error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 1500); // 1.5 second delay
  };

  /**
   * Handles CSV file uploads for gravity data.
   * Expected CSV format: "station_position,elevation,observed_gravity_value"
   * Calculates Free-Air and Bouguer anomalies from uploaded data.
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
          const parts = line.split(',').map(part => part.trim());
          if (parts.length !== 3) {
            throw new Error(`Line ${index + 2} has incorrect number of columns. Expected 3, got ${parts.length}.`);
          }
          const [station, elevation, observedGravity] = parts.map(Number);
          if (isNaN(station) || isNaN(elevation) || isNaN(observedGravity)) {
            throw new Error(`Line ${index + 2} contains non-numeric data. Please ensure all values are numbers.`);
          }
          return { station, elevation, observedGravity };
        });

        if (parsedData.length === 0) {
          setErrorMessage('CSV file is empty or contains only headers.');
          setIsLoading(false);
          return;
        }

        const tempObservedGravity: any[] = [];
        const tempFreeAirAnomaly: any[] = [];
        const tempBouguerAnomaly: any[] = [];

        // Constants for gravity corrections
        const freeAirGradient = 0.3086; // mGal/meter
        const bouguerConstant = 0.0419; // mGal/(g/cm³ * meter)
        const theoreticalGravityBase = 980000; // A base theoretical gravity for anomaly calculation

        parsedData.forEach(dataPoint => {
          const { station, elevation, observedGravity } = dataPoint;

          // Free-Air Correction (FAC)
          const freeAirCorrection = freeAirGradient * elevation;
          const freeAirAnomaly = observedGravity + freeAirCorrection - theoreticalGravityBase;

          // Bouguer Correction (BC)
          const bouguerCorrection = bouguerConstant * crustalDensity * elevation;
          // Simple Terrain Correction (TC) - assume zero for uploaded data unless provided
          const terrainCorrection = 0; // Or could be read from a 4th column if CSV format changes

          // Bouguer Anomaly (BA)
          const bouguerAnomaly = freeAirAnomaly - bouguerCorrection + terrainCorrection;

          tempObservedGravity.push({ station, value: observedGravity });
          tempFreeAirAnomaly.push({ station, value: freeAirAnomaly });
          tempBouguerAnomaly.push({ station, value: bouguerAnomaly });
        });

        setObservedGravityData(tempObservedGravity);
        setFreeAirAnomalyData(tempFreeAirAnomaly);
        setBouguerAnomalyData(tempBouguerAnomaly);
        setShowResults(true);

      } catch (error: any) {
        setErrorMessage(`Error parsing CSV: ${error.message}. Please ensure format is 'station_position,elevation,observed_gravity_value' and check for header rows or empty lines.`);
        console.error('CSV parsing error:', error);
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
   * Calls the Gemini API to get a geological interpretation of the gravity anomaly data.
   * Extracts characteristics of gravity highs/lows to form the prompt.
   */
  const interpretGravityResults = async () => {
    setInterpretationLoading(true);
    setInterpretationText('');
    setInterpretationError('');

    if (bouguerAnomalyData.length === 0) {
      setInterpretationError('No Bouguer anomaly data to interpret. Please run a simulation or upload data first.');
      setInterpretationLoading(false);
      return;
    }

    // Analyze Bouguer Anomaly Data for interpretation
    const anomalyValues = bouguerAnomalyData.map(d => d.value);
    const stations = bouguerAnomalyData.map(d => d.station);

    if (anomalyValues.length === 0) {
      setInterpretationError('Bouguer anomaly data is empty, cannot interpret.');
      setInterpretationLoading(false);
      return;
    }

    const minAnomaly = Math.min(...anomalyValues);
    const maxAnomaly = Math.max(...anomalyValues);
    const avgAnomaly = anomalyValues.reduce((sum, val) => sum + val, 0) / anomalyValues.length;

    let prominentFeatures = [];

    // Identify significant highs (positive anomalies)
    // A high is considered significant if it's above the average by a certain margin
    const highThreshold = avgAnomaly + (maxAnomaly - avgAnomaly) * 0.3; // Top 30% above average
    const highAnomalies = bouguerAnomalyData.filter(d => d.value >= highThreshold);
    if (highAnomalies.length > 0) {
      // Find the peak value and its approximate center
      let peakValue = -Infinity;
      let peakStation = 0;
      highAnomalies.forEach(d => {
        if (d.value > peakValue) {
          peakValue = d.value;
          peakStation = d.station;
        }
      });
      prominentFeatures.push(`a positive gravity anomaly (high) peaking at approximately ${peakValue.toFixed(2)} mGal around horizontal position ${peakStation.toFixed(1)} meters`);
    }

    // Identify significant lows (negative anomalies)
    // A low is considered significant if it's below the average by a certain margin
    const lowThreshold = avgAnomaly - (avgAnomaly - minAnomaly) * 0.3; // Bottom 30% below average
    const lowAnomalies = bouguerAnomalyData.filter(d => d.value <= lowThreshold);
    if (lowAnomalies.length > 0) {
      // Find the trough value and its approximate center
      let troughValue = Infinity;
      let troughStation = 0;
      lowAnomalies.forEach(d => {
        if (d.value < troughValue) {
          troughValue = d.value;
          troughStation = d.station;
        }
      });
      prominentFeatures.push(`a negative gravity anomaly (low) troughing at approximately ${troughValue.toFixed(2)} mGal around horizontal position ${troughStation.toFixed(1)} meters`);
    }

    let prompt = `Based on the gravity anomaly profile, the observed range of Bouguer anomalies is from ${minAnomaly.toFixed(2)} mGal to ${maxAnomaly.toFixed(2)} mGal. The average anomaly is ${avgAnomaly.toFixed(2)} mGal.`;

    if (prominentFeatures.length > 0) {
      prompt += ` Specifically, there is ${prominentFeatures.join(' and ')}.`;
      prompt += ` What are some possible geological or subsurface features that could cause such gravity anomalies in this context? Provide a brief, concise interpretation.`;
    } else {
      prompt += ` The Bouguer anomaly profile appears relatively flat, with no prominent positive or negative anomalies. What does a relatively flat gravity profile typically indicate geologically?`;
    }

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
    setStationSpacing(5.0);
    setAverageElevation(100.0);
    setCrustalDensity(2.67);
    setAnomalyMagnitude(20);
    setAnomalyCenterRatio(0.5);
    setAnomalyWidthRatio(0.2);
    setObservedGravityData([]);
    setFreeAirAnomalyData([]);
    setBouguerAnomalyData([]);
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
      {/* Header Section */}
      <header className="w-full max-w-4xl text-center py-6 mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-teal-500">
          Geophysical Gravity Anomalies
        </h1>
        <p className="text-gray-400 mt-3 text-lg">Interactive Simulation, Data Analysis & AI Interpretation</p>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row w-full max-w-7xl gap-8">
        {/* Input & Controls Panel */}
        <div className="w-full lg:w-1/4 dark:bg-dark p-6 rounded-xl shadow-2xl flex flex-col space-y-6 border border-gray-700">
          <h2 className="text-2xl font-bold text-green-300 mb-4">Survey Parameters & Data Input</h2>

          {/* Station Spacing Input */}
          <div>
            <label htmlFor="stationSpacing" className="block text-gray-400 text-sm font-medium mb-2">
              Station Spacing (m)
            </label>
            <input
              type="number"
              id="stationSpacing"
              className="w-full p-3 dark:bg-dark border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-200"
              value={stationSpacing}
              onChange={(e) => setStationSpacing(Math.max(1, parseFloat(e.target.value) || 1))}
              step="1"
              min="1"
            />
          </div>

          {/* Average Elevation Input */}
          <div>
            <label htmlFor="averageElevation" className="block text-gray-400 text-sm font-medium mb-2">
              Average Elevation (m)
            </label>
            <input
              type="number"
              id="averageElevation"
              className="w-full p-3 dark:bg-dark border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-200"
              value={averageElevation}
              onChange={(e) => setAverageElevation(parseFloat(e.target.value) || 0)}
              step="1"
            />
          </div>

          {/* Crustal Density Input */}
          <div>
            <label htmlFor="crustalDensity" className="block text-gray-400 text-sm font-medium mb-2">
              Crustal Density (g/cm³)
            </label>
            <input
              type="number"
              id="crustalDensity"
              className="w-full p-3 dark:bg-dark border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-200"
              value={crustalDensity}
              onChange={(e) => setCrustalDensity(Math.max(1.0, parseFloat(e.target.value) || 1.0))}
              step="0.01"
              min="1.0"
            />
          </div>

          {/* Anomaly Simulation Parameters (New) */}
          <div className="border-t border-gray-700 pt-6 mt-6">
            <h3 className="text-xl font-bold text-green-300 mb-4">Simulated Anomaly Settings</h3>
            <div>
              <label htmlFor="anomalyMagnitude" className="block text-gray-400 text-sm font-medium mb-2">
                Anomaly Magnitude (mGal)
              </label>
              <input
                type="number"
                id="anomalyMagnitude"
                className="w-full p-3 dark:bg-dark border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-200"
                value={anomalyMagnitude}
                onChange={(e) => setAnomalyMagnitude(parseFloat(e.target.value) || 0)}
                step="1"
              />
            </div>
            <div className="mt-4">
              <label htmlFor="anomalyCenterRatio" className="block text-gray-400 text-sm font-medium mb-2">
                Anomaly Center Position (0-1, e.g., 0.5 for middle)
              </label>
              <input
                type="number"
                id="anomalyCenterRatio"
                className="w-full p-3 dark:bg-dark border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-200"
                value={anomalyCenterRatio}
                onChange={(e) => setAnomalyCenterRatio(Math.min(1.0, Math.max(0.0, parseFloat(e.target.value) || 0)))}
                step="0.05"
                min="0"
                max="1"
              />
            </div>
            <div className="mt-4">
              <label htmlFor="anomalyWidthRatio" className="block text-gray-400 text-sm font-medium mb-2">
                Anomaly Width (0-1, e.g., 0.2 for 20% of survey)
              </label>
              <input
                type="number"
                id="anomalyWidthRatio"
                className="w-full p-3 dark:bg-dark border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-200"
                value={anomalyWidthRatio}
                onChange={(e) => setAnomalyWidthRatio(Math.min(1.0, Math.max(0.0, parseFloat(e.target.value) || 0)))}
                step="0.05"
                min="0"
                max="1"
              />
            </div>
          </div>

          {/* Simulate Data Button */}
          <button
            onClick={simulateGravityData}
            className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out
                       focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 mt-6"
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
              'Simulate & Generate Data'
            )}
          </button>

          {/* Upload Data Section */}
          <div className="border-t border-gray-700 pt-6 mt-6">
            <h3 className="text-xl font-bold text-green-300 mb-4">Upload Your Data (CSV)</h3>
            <div>
              <label htmlFor="gravityUpload" className="block text-gray-400 text-sm font-medium mb-2">
                Select CSV File
              </label>
              <input
                type="file"
                id="gravityUpload"
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
          <h2 className="text-2xl font-bold text-green-300">Gravity Anomaly Results</h2>

          {!showResults && !isLoading && (
            <div className="text-center text-gray-500 py-16">
              <p className="text-lg">Enter survey parameters and click "Simulate & Generate Data" or upload your own CSV file to see results.</p>
              <button
                onClick={() => setShowExplanation(true)}
                className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-300"
              >
                What are Gravity Anomalies?
              </button>
            </div>
          )}

          {isLoading && (
            <div className="text-center text-gray-400 py-16">
              <p className="text-lg">Processing data and calculating anomalies...</p>
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
              {/* Observed Gravity Plot */}
              <div className="dark:bg-dark p-4 rounded-lg shadow-xl border border-gray-700">
                <h3 className="text-xl font-medium text-gray-200 mb-4">Observed Gravity Profile</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={observedGravityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4a4a4a" />
                    <XAxis dataKey="station" name="Station Position (m)" stroke="#b0bec5" tickFormatter={(value) => value.toFixed(0)} />
                    <YAxis label={{ value: 'Observed Gravity (mGal)', angle: -90, position: 'insideLeft', fill: '#b0bec5' }} stroke="#b0bec5" />
                    <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff', borderRadius: '8px' }} formatter={(value: any) => `${value.toFixed(2)} mGal`} />
                    <Legend wrapperStyle={{ color: '#b0bec5', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" name="Observed Gravity" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Free-Air Anomaly Plot */}
              <div className="dark:bg-dark p-4 rounded-lg shadow-xl border border-gray-700">
                <h3 className="text-xl font-medium text-gray-200 mb-4">Free-Air Anomaly Profile</h3>
                <p className="text-gray-400 text-sm mb-2">
                  Corrected for elevation, reflecting variations in gravity due to mass above the geoid.
                </p>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={freeAirAnomalyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4a4a4a" />
                    <XAxis dataKey="station" name="Station Position (m)" stroke="#b0bec5" tickFormatter={(value) => value.toFixed(0)} />
                    <YAxis label={{ value: 'Free-Air Anomaly (mGal)', angle: -90, position: 'insideLeft', fill: '#b0bec5' }} stroke="#b0bec5" />
                    <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff', borderRadius: '8px' }} formatter={(value: any) => `${value.toFixed(2)} mGal`} />
                    <Legend wrapperStyle={{ color: '#b0bec5', paddingTop: '10px' }} />
                    <ReferenceLine y={0} stroke="#f00" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Zero Anomaly', fill: '#f00', fontSize: 12 }} />
                    <Line type="monotone" dataKey="value" stroke="#82ca9d" name="Free-Air Anomaly" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Bouguer Anomaly Plot */}
              <div className="dark:bg-dark p-4 rounded-lg shadow-xl border border-gray-700">
                <h3 className="text-xl font-medium text-gray-200 mb-4">Bouguer Anomaly Profile</h3>
                <p className="text-gray-400 text-sm mb-2">
                  Corrected for elevation and the mass of the intervening rock, reflecting density variations in the subsurface.
                </p>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={bouguerAnomalyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4a4a4a" />
                    <XAxis dataKey="station" name="Station Position (m)" stroke="#b0bec5" tickFormatter={(value) => value.toFixed(0)} />
                    <YAxis label={{ value: 'Bouguer Anomaly (mGal)', angle: -90, position: 'insideLeft', fill: '#b0bec5' }} stroke="#b0bec5" />
                    <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff', borderRadius: '8px' }} formatter={(value: any) => `${value.toFixed(2)} mGal`} />
                    <Legend wrapperStyle={{ color: '#b0bec5', paddingTop: '10px' }} />
                    <ReferenceLine y={0} stroke="#f00" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Zero Anomaly', fill: '#f00', fontSize: 12 }} />
                    <Line type="monotone" dataKey="value" stroke="#ffc658" name="Bouguer Anomaly" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* LLM Interpretation Section */}
              <div className="dark:bg-dark p-4 rounded-lg shadow-xl border border-gray-700 flex flex-col">
                <h3 className="text-xl font-medium text-gray-200 mb-4">Geological Interpretation</h3>
                <p className="text-gray-400 text-sm mb-2">
                  Get an AI-powered interpretation of the Bouguer anomaly profile to understand potential subsurface features.
                </p>
                <button
                  onClick={interpretGravityResults}
                  className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out
                             focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 mt-auto"
                  disabled={interpretationLoading || bouguerAnomalyData.length === 0}
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
              aria-label="Close explanation" // Added for accessibility
            >
              &times;
            </button>
            <h3 className="text-2xl font-bold text-green-300 mb-4">Understanding Gravity Anomalies</h3>
            {/* Added max-h-96 and overflow-y-auto for scrollability */}
            <div className="text-gray-300 space-y-4 text-base max-h-96 overflow-y-auto pr-4">
              <p>
                Gravity surveys measure tiny variations in the Earth's gravitational field. These variations, known as <strong>gravity anomalies</strong>, can reveal differences in the density of subsurface rocks and structures.
              </p>
              <p>
                <strong>Observed Gravity:</strong> This is the raw gravity measurement taken at each station. It's affected by many factors, including latitude, elevation, and local geology.
              </p>
              <p>
                <strong>Free-Air Anomaly (FAA):</strong> This anomaly corrects for the elevation difference between the observation station and a reference datum (like sea level). It primarily reflects the mass distribution above the geoid. Positive FAA can indicate excess mass at higher elevations, while negative FAA can indicate a deficit.
              </p>
              <p>
                <strong>Bouguer Anomaly (BA):</strong> This is the most geologically significant anomaly. It corrects for both elevation (like FAA) AND the gravitational effect of the rock mass between the station and the reference datum. Therefore, the Bouguer anomaly primarily reflects density variations *within* the Earth's crust below the observation point.
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Positive Bouguer Anomaly:</strong> Suggests the presence of denser-than-average material (e.g., mafic intrusions, ore bodies) or shallower basement rocks.</li>
                <li><strong>Negative Bouguer Anomaly:</strong> Suggests the presence of less dense-than-average material (e.g., sedimentary basins, granitic intrusions, fault zones, voids) or deeper basement rocks.</li>
              </ul>
              <p>
                Geophysicists use these anomalies to infer subsurface geology, locate mineral deposits, map geological structures, and study tectonic processes.
              </p>
              <p>
                *Additional detail on corrections:*
                <br/>
                The process of calculating gravity anomalies involves several corrections to isolate the gravitational effect of subsurface density variations:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Latitude Correction:</strong> Accounts for the Earth's flattening at the poles and centrifugal force from rotation, which cause gravity to increase from the equator to the poles.</li>
                <li><strong>Free-Air Correction (FAC):</strong> Corrects for the decrease in gravity with increasing elevation above sea level. This correction assumes there is no rock between the station and the datum.</li>
                <li><strong>Bouguer Correction (BC):</strong> Accounts for the gravitational attraction of the rock mass between the observation station and the reference datum. This correction effectively "removes" the effect of the topography.</li>
                <li><strong>Terrain Correction (TC):</strong> Addresses variations in topography (hills and valleys) around the station that are not accounted for by the Bouguer correction. It accounts for the gravitational effect of excess or deficient mass due to local terrain.</li>
                <li><strong>Tidal Correction:</strong> Corrects for the gravitational effects of the Sun and Moon, which cause very small, predictable daily variations in gravity.</li>
                <li><strong>Drift Correction:</strong> Accounts for instrumental drift (changes in the gravity meter's reading over time) and any minor changes in the Earth's gravity field not covered by other corrections.</li>
              </ul>
              <p>
                By applying these corrections, geophysicists can produce a residual gravity anomaly map or profile that highlights the gravitational effects of subsurface density contrasts, which are of geological interest.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
