"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis
} from 'recharts';

export default function EarthquakeMonitoring() {
  // State variables for user inputs for simulation
  const [numEarthquakes, setNumEarthquakes] = useState(50);
  const [minMagnitude, setMinMagnitude] = useState(2.0);
  const [maxMagnitude, setMaxMagnitude] = useState(6.0);
  const [minDepth, setMinDepth] = useState(5); // km
  const [maxDepth, setMaxDepth] = useState(100); // km

  // State variables for earthquake data
  const [earthquakeData, setEarthquakeData] = useState<any[]>([]);

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
  }, [numEarthquakes, minMagnitude, maxMagnitude, minDepth, maxDepth, earthquakeData]);

  /**
   * Generates a random latitude within a reasonable range for a map.
   * @returns A random latitude.
   */
  const getRandomLatitude = () => Math.random() * (90 - (-90)) + (-90); // -90 to +90

  /**
   * Generates a random longitude within a reasonable range for a map.
   * @returns A random longitude.
   */
  const getRandomLongitude = () => Math.random() * (180 - (-180)) + (-180); // -180 to +180

  /**
   * Simulates earthquake data based on user-defined parameters.
   * Generates latitude, longitude, magnitude, depth, and time for each event.
   */
  const simulateEarthquakeData = () => {
    setIsLoading(true);
    setErrorMessage('');
    setShowResults(false);
    setInterpretationText('');
    setInterpretationError('');

    setTimeout(() => {
      try {
        const tempEarthquakeData: any[] = [];

        // Simulate a cluster around a central point for more realistic data
        const clusterLat = getRandomLatitude();
        const clusterLon = getRandomLongitude();
        const clusterRadius = 50; // degrees for spread

        for (let i = 0; i < numEarthquakes; i++) {
          const magnitude = parseFloat((Math.random() * (maxMagnitude - minMagnitude) + minMagnitude).toFixed(1));
          const depth = parseFloat((Math.random() * (maxDepth - minDepth) + minDepth).toFixed(1));

          // Simulate latitude and longitude with some clustering
          const lat = parseFloat((clusterLat + (Math.random() - 0.5) * clusterRadius / 10).toFixed(4));
          const lon = parseFloat((clusterLon + (Math.random() - 0.5) * clusterRadius / 10).toFixed(4));

          const time = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleString(); // Last 30 days

          tempEarthquakeData.push({
            latitude: lat,
            longitude: lon,
            magnitude: magnitude,
            depth: depth,
            time: time,
          });
        }

        setEarthquakeData(tempEarthquakeData);
        setShowResults(true);

      } catch (error: any) {
        setErrorMessage('Error during simulation: ' + error.message);
        console.error('Simulation error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 1500);
  };

  /**
   * Handles CSV file uploads for earthquake data.
   * Expected CSV format: "latitude,longitude,magnitude,depth,time"
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
        if (lines.length === 0) {
          throw new Error('CSV file is empty.');
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const expectedHeaders = ['latitude', 'longitude', 'magnitude', 'depth', 'time'];
        const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
        if (missingHeaders.length > 0) {
          throw new Error(`Missing required CSV headers: ${missingHeaders.join(', ')}. Expected: ${expectedHeaders.join(', ')}`);
        }

        const parsedData = lines.slice(1).map((line, index) => {
          const parts = line.split(',').map(part => part.trim());
          if (parts.length !== headers.length) {
            throw new Error(`Line ${index + 2} has incorrect number of columns. Expected ${headers.length}, got ${parts.length}.`);
          }
          const row: { [key: string]: any } = {};
          headers.forEach((header, i) => {
            let value: any = parts[i];
            if (['latitude', 'longitude', 'magnitude', 'depth'].includes(header)) {
              value = Number(value);
              if (isNaN(value)) {
                throw new Error(`Line ${index + 2}, column '${header}' contains non-numeric data.`);
              }
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

        setEarthquakeData(parsedData);
        setShowResults(true);

      } catch (error: any) {
        setErrorMessage(`Error parsing CSV: ${error.message}`);
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
   * Helper function to get a color based on earthquake depth.
   * Deeper earthquakes (higher depth value) will be red, shallower will be purple.
   * @param depth The depth of the earthquake.
   * @returns An HSL color string.
   */
  const getDepthColor = (depth: number) => {
    const depths = earthquakeData.map(d => d.depth);
    const minD = depths.length > 0 ? Math.min(...depths) : 0;
    const maxD = depths.length > 0 ? Math.max(...depths) : 200;

    const normalized = (depth - minD) / (maxD - minD);
    // Hue from purple (270) to red (0)
    const hue = 270 * (1 - normalized);
    return `hsl(${hue}, 80%, 50%)`;
  };

  /**
   * Calls the Gemini API to get an interpretation of the earthquake data.
   * Extracts statistics about magnitude, depth, and location to form the prompt.
   */
  const interpretEarthquakeResults = async () => {
    setInterpretationLoading(true);
    setInterpretationText('');
    setInterpretationError('');

    if (earthquakeData.length === 0) {
      setInterpretationError('No earthquake data to interpret. Please run a simulation or upload data first.');
      setInterpretationLoading(false);
      return;
    }

    const magnitudes = earthquakeData.map(d => d.magnitude);
    const depths = earthquakeData.map(d => d.depth);
    const latitudes = earthquakeData.map(d => d.latitude);
    const longitudes = earthquakeData.map(d => d.longitude);

    const numEvents = earthquakeData.length;
    const avgMagnitude = (magnitudes.reduce((sum, val) => sum + val, 0) / numEvents).toFixed(1);
    const maxMagnitudeFound = Math.max(...magnitudes).toFixed(1);
    const minMagnitudeFound = Math.min(...magnitudes).toFixed(1);

    const avgDepth = (depths.reduce((sum, val) => sum + val, 0) / numEvents).toFixed(1);
    const maxDepthFound = Math.max(...depths).toFixed(1);
    const minDepthFound = Math.min(...depths).toFixed(1);

    const avgLat = (latitudes.reduce((sum, val) => sum + val, 0) / numEvents).toFixed(2);
    const avgLon = (longitudes.reduce((sum, val) => sum + val, 0) / numEvents).toFixed(2);

    // Identify the most recent earthquake
    const sortedByTime = [...earthquakeData].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    const mostRecentEvent = sortedByTime[0];

    let prompt = `Based on the provided earthquake data, there are ${numEvents} events recorded.
    Magnitudes range from ${minMagnitudeFound} to ${maxMagnitudeFound} (average: ${avgMagnitude}).
    Depths range from ${minDepthFound} km to ${maxDepthFound} km (average: ${avgDepth} km).
    The events are centered around latitude ${avgLat} and longitude ${avgLon}.
    The most recent event occurred at ${mostRecentEvent.time} with magnitude ${mostRecentEvent.magnitude} and depth ${mostRecentEvent.depth} km.

    What are some possible tectonic settings or geological implications for these earthquake characteristics (e.g., magnitude range, depth distribution, spatial clustering)? Provide a brief, concise interpretation.`;

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
    setNumEarthquakes(50);
    setMinMagnitude(2.0);
    setMaxMagnitude(6.0);
    setMinDepth(5);
    setMaxDepth(100);
    setEarthquakeData([]);
    setIsLoading(false);
    setErrorMessage('');
    setShowResults(false);
    setInterpretationLoading(false);
    setInterpretationText('');
    setInterpretationError('');
    setShowExplanation(false);
  };

  return (
    <div className="min-h-screen dark:bg-gray-900 text-gray-400 font-inter py-20 px-4 sm:px-10 flex flex-col items-center rounded-lg shadow-xl">
      {/* Header */}
      <header className="w-full max-w-4xl text-center py-6 mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-300 to-orange-500">
          Geophysical Earthquake Monitoring
        </h1>
        <p className="text-gray-400 mt-3 text-lg">Data Simulation, Visualization & AI Interpretation</p>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row w-full max-w-7xl gap-8">
        {/* Input Panel */}
        <div className="w-full lg:w-1/4 dark:bg-gray-800 p-6 rounded-xl shadow-2xl flex flex-col space-y-6 border border-gray-700">
          <h2 className="text-2xl font-bold text-red-300 mb-4">Earthquake Data Parameters</h2>

          {/* Number of Earthquakes Input */}
          <div>
            <label htmlFor="numEarthquakes" className="block text-gray-400 text-sm font-medium mb-2">
              Number of Earthquakes
            </label>
            <input
              type="number"
              id="numEarthquakes"
              className="w-full p-3 dark:bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200"
              value={numEarthquakes}
              onChange={(e) => setNumEarthquakes(Math.max(1, parseInt(e.target.value) || 1))}
              step="1"
              min="1"
            />
          </div>

          {/* Min Magnitude Input */}
          <div>
            <label htmlFor="minMagnitude" className="block text-gray-400 text-sm font-medium mb-2">
              Min Magnitude
            </label>
            <input
              type="number"
              id="minMagnitude"
              className="w-full p-3 dark:bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200"
              value={minMagnitude}
              onChange={(e) => setMinMagnitude(parseFloat(e.target.value) || 0)}
              step="0.1"
              min="0"
            />
          </div>

          {/* Max Magnitude Input */}
          <div>
            <label htmlFor="maxMagnitude" className="block text-gray-400 text-sm font-medium mb-2">
              Max Magnitude
            </label>
            <input
              type="number"
              id="maxMagnitude"
              className="w-full p-3 dark:bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200"
              value={maxMagnitude}
              onChange={(e) => setMaxMagnitude(parseFloat(e.target.value) || 0)}
              step="0.1"
              min="0"
            />
          </div>

          {/* Min Depth Input */}
          <div>
            <label htmlFor="minDepth" className="block text-gray-400 text-sm font-medium mb-2">
              Min Depth (km)
            </label>
            <input
              type="number"
              id="minDepth"
              className="w-full p-3 dark:bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200"
              value={minDepth}
              onChange={(e) => setMinDepth(Math.max(0, parseFloat(e.target.value) || 0))}
              step="1"
              min="0"
            />
          </div>

          {/* Max Depth Input */}
          <div>
            <label htmlFor="maxDepth" className="block text-gray-400 text-sm font-medium mb-2">
              Max Depth (km)
            </label>
            <input
              type="number"
              id="maxDepth"
              className="w-full p-3 dark:bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200"
              value={maxDepth}
              onChange={(e) => setMaxDepth(Math.max(0, parseFloat(e.target.value) || 0))}
              step="1"
              min="0"
            />
          </div>

          {/* Simulate Data Button */}
          <button
            onClick={simulateEarthquakeData}
            className="w-full py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out
                        focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 mt-6"
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

          {/* CSV Upload Section */}
          <div className="border-t border-gray-700 pt-6 mt-6">
            <h3 className="text-xl font-bold text-red-300 mb-4">Upload Your Data (CSV)</h3>
            <div>
              <label htmlFor="earthquakeUpload" className="block text-gray-400 text-sm font-medium mb-2">
                Upload Earthquake Data CSV
              </label>
              <input
                type="file"
                id="earthquakeUpload"
                accept=".csv"
                className="w-full p-2 dark:bg-gray-700 border border-gray-600 rounded-lg text-gray-200 file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0 file:text-sm file:font-semibold
                                file:bg-orange-500 file:text-white hover:file:bg-orange-600 cursor-pointer"
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
        <div className="w-full lg:w-3/4 dark:bg-gray-800 p-6 rounded-xl shadow-2xl flex flex-col space-y-8 border border-gray-700">
          <h2 className="text-2xl font-bold text-red-300">Earthquake Monitoring Results</h2>

          {!showResults && !isLoading && (
            <div className="text-center text-gray-500 py-16">
              <p className="text-lg">Enter simulation parameters and click "Simulate & Generate Dummy Data" or upload your own CSV file to see results.</p>
              <button
                onClick={() => setShowExplanation(true)}
                className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition duration-300"
              >
                What is Earthquake Monitoring?
              </button>
            </div>
          )}

          {isLoading && (
            <div className="text-center text-gray-400 py-16">
              <p className="text-lg">Processing earthquake data...</p>
              <div className="mt-4">
                <svg className="animate-spin h-8 w-8 text-orange-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            </div>
          )}

          {showResults && (
            <>
              {/* Earthquake Map (Scatter Plot) */}
              <div className="dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-700">
                <h3 className="text-xl font-medium text-gray-200 mb-4">Earthquake Locations</h3>
                <p className="text-gray-400 text-sm mb-2">
                  Magnitude represented by dot size, Depth by color (purple to red for shallow to deep).
                </p>
                {earthquakeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <ScatterChart
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#4a4a4a" />
                      <XAxis type="number" dataKey="longitude" name="Longitude" unit="°" stroke="#b0bec5" domain={['auto', 'auto']} />
                      <YAxis type="number" dataKey="latitude" name="Latitude" unit="°" stroke="#b0bec5" domain={['auto', 'auto']} />
                      <ZAxis type="number" dataKey="magnitude" name="Magnitude" range={[50, 800]} /> {/* Size based on magnitude */}
                      <Tooltip
                        cursor={{ strokeDasharray: '3 3' }}
                        contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff', borderRadius: '8px' }}
                        formatter={(value: any, name: string, props: any) => {
                          if (name === 'Magnitude') return [`${value.toFixed(1)}`, 'Magnitude'];
                          if (name === 'Depth') return [`${value.toFixed(1)} km`, 'Depth'];
                          if (name === 'Time') return [`${value}`, 'Time'];
                          return value;
                        }}
                        labelFormatter={(label: any, payload: any[]) => {
                          if (payload.length > 0) {
                            const data = payload[0].payload;
                            return `Lat: ${data.latitude.toFixed(2)}°, Lon: ${data.longitude.toFixed(2)}°`;
                          }
                          return '';
                        }}
                      />
                      <Legend wrapperStyle={{ color: '#b0bec5', paddingTop: '10px' }} />
                      <Scatter name="Earthquake" data={earthquakeData}>
                        {earthquakeData.map((entry, index) => (
                          <Scatter key={`eq-point-${index}`} fill={getDepthColor(entry.depth)} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-gray-500 py-10">
                    <p>No earthquake data available. Simulate data or upload a CSV.</p>
                  </div>
                )}
                <div className="flex justify-center items-center mt-2">
                  <div className="w-full h-4 bg-gradient-to-r from-purple-500 to-red-500 rounded-full"></div>
                  <span className="ml-2 text-gray-400 text-xs">Shallow Depth - Deep Depth</span>
                </div>
              </div>

              {/* LLM Interpretation */}
              <div className="dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-700 flex flex-col">
                <h3 className="text-xl font-medium text-gray-200 mb-4">Geological Interpretation</h3>
                <p className="text-gray-400 text-sm mb-2">
                  Get an AI-powered interpretation of the earthquake data.
                </p>
                <button
                  onClick={interpretEarthquakeResults}
                  className="w-full py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out
                               focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 mt-auto"
                  disabled={interpretationLoading || earthquakeData.length === 0}
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
                    '✨ Get Geological Interpretation'
                  )}
                </button>

                {interpretationText && (
                  <div className="dark:bg-gray-700 p-4 rounded-md mt-4 text-gray-300 text-sm border border-gray-700">
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
            <h3 className="text-2xl font-bold text-red-300 mb-4">What is Earthquake Monitoring?</h3>
            <div className="text-gray-300 space-y-4 text-base max-h-96 overflow-y-auto pr-4">
              <p>
                <strong>Earthquake Monitoring</strong> is the continuous process of detecting, locating, and characterizing seismic events (earthquakes) using a network of seismographs. This monitoring provides crucial data for understanding tectonic processes, assessing seismic hazards, and informing emergency response.
              </p>
              <div> {/* Changed <p> to <div> to wrap the heading and list */}
                <strong>How Earthquakes are Monitored:</strong>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li><strong>Seismographs:</strong> These instruments are deployed globally to detect ground motion caused by seismic waves. They record the arrival times and amplitudes of different seismic wave types (P-waves, S-waves, surface waves).</li>
                  <li><strong>Seismic Networks:</strong> Multiple seismographs are linked together to form a network. Data from these stations is transmitted to central processing centers in real-time.</li>
                  <li><strong>Locating Earthquakes:</strong> By analyzing the arrival times of P-waves and S-waves at different stations, seismologists can triangulate the earthquake's epicenter (the point on the Earth's surface directly above the earthquake's origin) and its hypocenter (the actual point of rupture within the Earth).</li>
                  <li><strong>Determining Magnitude:</strong> The magnitude of an earthquake (a measure of its energy release) is calculated from the amplitude of the seismic waves recorded by seismographs. Common scales include the Richter scale (for local magnitudes) and the Moment Magnitude Scale (for larger earthquakes, more accurately reflecting the energy released).</li>
                  <li><strong>Determining Depth:</strong> The depth of an earthquake's hypocenter is also crucial, as it influences the intensity of shaking felt at the surface.</li>
                </ul>
              </div>
              <div> {/* Changed <p> to <div> to wrap the heading and list */}
                <strong>Key Earthquake Parameters:</strong>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li><strong>Magnitude:</strong> A quantitative measure of the size of an earthquake, related to the energy released.</li>
                  <li><strong>Depth:</strong> The distance from the Earth's surface to the earthquake's hypocenter. Earthquakes can be shallow (0-70 km), intermediate (70-300 km), or deep (300-700 km).</li>
                  <li><strong>Location (Latitude & Longitude):</strong> The precise geographical coordinates of the earthquake's epicenter.</li>
                  <li><strong>Time:</strong> The exact time of the earthquake's occurrence.</li>
                  <li><strong>Intensity:</strong> A qualitative measure of the shaking felt at a particular location and the damage caused, often described using scales like the Modified Mercalli Intensity (MMI) scale.</li>
                </ul>
              </div>
              <div> {/* Changed <p> to <div> to wrap the heading and list */}
                <strong>Interpretation of Earthquake Data:</strong>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li><strong>Tectonic Settings:</strong> The distribution of earthquakes (e.g., along plate boundaries, within continental plates) helps define active tectonic zones. Shallow earthquakes are common at all plate boundaries, while deep earthquakes are characteristic of subduction zones.</li>
                  <li><strong>Fault Activity:</strong> Earthquake clusters or linear patterns can indicate active fault lines.</li>
                  <li><strong>Seismic Hazard Assessment:</strong> Understanding the frequency, magnitude, and location of past earthquakes helps predict future seismic activity and assess the risk to infrastructure and populations.</li>
                  <li><strong>Earth's Interior:</strong> Seismic waves travel through the Earth's interior, and their behavior provides insights into the Earth's layered structure (crust, mantle, core).</li>
                </ul>
              </div>
              <div> {/* Changed <p> to <div> to wrap the heading and list */}
                <strong>Common Applications of Earthquake Monitoring:</strong>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li><strong>Early Warning Systems:</strong> Providing a few seconds to minutes of warning before strong shaking arrives, allowing for protective actions.</li>
                  <li><strong>Building Codes:</strong> Informing the design of earthquake-resistant structures.</li>
                  <li><strong>Disaster Preparedness:</strong> Guiding emergency response and public education.</li>
                  <li><strong>Scientific Research:</strong> Advancing our understanding of plate tectonics, fault mechanics, and the Earth's deep interior.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
