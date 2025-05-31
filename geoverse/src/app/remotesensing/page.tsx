"use client";

import React, { useState, useEffect } from "react";
import {
    ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ZAxis
} from 'recharts';

export default function RemoteSensingAnalysis() {
    // State variables for user inputs for simulation (can be adapted later if needed)
    const [numPoints, setNumPoints] = useState(50);
    const [minBandValue, setMinBandValue] = useState(0);
    const [maxBandValue, setMaxBandValue] = useState(255); // Assuming 8-bit data

    // State variables for remote sensing data
    const [rsData, setRsData] = useState<any[]>([]);

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
    }, [numPoints, minBandValue, maxBandValue, rsData]);

    // Calculate min/max for band values dynamically for color scaling
    const allBand1Values = rsData.map(d => d.band1);
    const minBand1 = allBand1Values.length > 0 ? Math.min(...allBand1Values) : 0;
    const maxBand1 = allBand1Values.length > 0 ? Math.max(...allBand1Values) : 255;

    /**
     * Generates a random latitude.
     * @returns A random latitude.
     */
    const getRandomLatitude = () => Math.random() * (90 - (-90)) + (-90);

    /**
     * Generates a random longitude.
     * @returns A random longitude.
     */
    const getRandomLongitude = () => Math.random() * (180 - (-180)) + (-180);

    /**
     * Simulates random remote sensing data.
     */
    const simulateRSData = () => {
        setIsLoading(true);
        setErrorMessage('');
        setShowResults(false);
        setInterpretationText('');
        setInterpretationError('');

        setTimeout(() => {
            try {
                const tempRSData: any[] = [];
                const clusterLat = getRandomLatitude();
                const clusterLon = getRandomLongitude();
                const clusterRadius = 50; // degrees for spread

                for (let i = 0; i < numPoints; i++) {
                    const lat = parseFloat((clusterLat + (Math.random() - 0.5) * clusterRadius / 10).toFixed(4));
                    const lon = parseFloat((clusterLon + (Math.random() - 0.5) * clusterRadius / 10).toFixed(4));
                    const band1 = Math.floor(Math.random() * (maxBandValue - minBandValue + 1) + minBandValue);
                    const band2 = Math.floor(Math.random() * (maxBandValue - minBandValue + 1) + minBandValue);
                    const band3 = Math.floor(Math.random() * (maxBandValue - minBandValue + 1) + minBandValue);
                    // Simulate a 'value' that might correlate with band values or location
                    const value = Math.random() > 0.5 ? 'Vegetation' : 'Water'; // Example categories

                    tempRSData.push({
                        latitude: lat,
                        longitude: lon,
                        band1: band1,
                        band2: band2,
                        band3: band3,
                        value: value,
                    });
                }
                setRsData(tempRSData);
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
     * Handles CSV file uploads for remote sensing data.
     * Expected CSV format: "latitude,longitude,band1,band2,band3,value"
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
                const expectedHeaders = ['latitude', 'longitude', 'band1', 'band2', 'band3', 'value'];
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
                        if (['latitude', 'longitude', 'band1', 'band2', 'band3'].includes(header)) {
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

                setRsData(parsedData);
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
     * Helper function to get a color based on a band value.
     * Uses a blue-to-red gradient for band1 values.
     * @param value The band value (e.g., band1).
     * @returns An HSL color string.
     */
    const getBandColor = (value: number) => {
        // Ensure minBand1 and maxBand1 are not equal to avoid division by zero
        const range = maxBand1 - minBand1;
        const normalized = range > 0 ? (value - minBand1) / range : 0.5; // Default to middle if range is zero
        // Hue from blue (240) to red (0)
        const hue = 240 * (1 - normalized);
        return `hsl(${hue}, 80%, 50%)`;
    };

    /**
     * Calls the Gemini API to get an interpretation of the remote sensing data.
     * Extracts statistics about band values and the 'value' column to form the prompt.
     */
    const interpretRSResults = async () => {
        setInterpretationLoading(true);
        setInterpretationText('');
        setInterpretationError('');

        if (rsData.length === 0) {
            setInterpretationError('No remote sensing data to interpret. Please upload data first.');
            setInterpretationLoading(false);
            return;
        }

        const numPoints = rsData.length;
        const band1Values = rsData.map(d => d.band1);
        const band2Values = rsData.map(d => d.band2);
        const band3Values = rsData.map(d => d.band3);
        const uniqueValues = [...new Set(rsData.map(d => d.value))];

        const avgBand1 = (band1Values.reduce((sum, val) => sum + val, 0) / numPoints).toFixed(1);
        const avgBand2 = (band2Values.reduce((sum, val) => sum + val, 0) / numPoints).toFixed(1);
        const avgBand3 = (band3Values.reduce((sum, val) => sum + val, 0) / numPoints).toFixed(1);

        let prompt = `Based on the provided remote sensing data, there are ${numPoints} observations.
        The average values for band 1, band 2, and band 3 are ${avgBand1}, ${avgBand2}, and ${avgBand3} respectively.
        The data includes the following categories: ${uniqueValues.join(', ')}.

        What potential spatial patterns or relationships between the spectral bands (band1, band2, band3) and the categories ('value') might be present in this data? Provide a brief interpretation focusing on what these patterns could indicate about the observed area.`;

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
      setNumPoints(50);
      setMinBandValue(0);
      setMaxBandValue(255);
      setRsData([]);
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
                <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-lime-500">
                    Remote Sensing Data Analysis
                </h1>
                <p className="text-gray-400 mt-3 text-lg">Data Upload, Visualization & AI Interpretation</p>
            </header>

            {/* Main Content Area */}
            <div className="flex flex-col lg:flex-row w-full max-w-7xl gap-8">
                {/* Input Panel */}
                <div className="w-full lg:w-1/4 dark:bg-dark p-6 rounded-xl shadow-2xl flex flex-col space-y-6 border border-gray-700">
                    <h2 className="text-2xl font-bold text-green-300 mb-4">Remote Sensing Data Options</h2>

                    {/* Simulation Parameters */}
                    <div className="border-b border-gray-700 pb-6">
                        <h3 className="text-xl font-bold text-green-300 mb-4">Simulate Remote Sensing Data</h3>
                        <div>
                            <label htmlFor="numPoints" className="block text-gray-400 text-sm font-medium mb-2">
                                Number of Data Points
                            </label>
                            <input
                                type="number"
                                id="numPoints"
                                className="w-full p-3 dark:bg-dark border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-lime-500 transition duration-200"
                                value={numPoints}
                                onChange={(e) => setNumPoints(Math.max(10, parseInt(e.target.value) || 10))}
                                min="10"
                            />
                        </div>
                        <div className="mt-4">
                            <label htmlFor="minBandValue" className="block text-gray-400 text-sm font-medium mb-2">
                                Min Band Value
                            </label>
                            <input
                                type="number"
                                id="minBandValue"
                                className="w-full p-3 dark:bg-dark border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-lime-500 transition duration-200"
                                value={minBandValue}
                                onChange={(e) => setMinBandValue(Math.max(0, parseInt(e.target.value) || 0))}
                                min="0"
                            />
                        </div>
                        <div className="mt-4">
                            <label htmlFor="maxBandValue" className="block text-gray-400 text-sm font-medium mb-2">
                                Max Band Value
                            </label>
                            <input
                                type="number"
                                id="maxBandValue"
                                className="w-full p-3 dark:bg-dark border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-lime-500 transition duration-200"
                                value={maxBandValue}
                                onChange={(e) => setMaxBandValue(Math.max(minBandValue + 1, parseInt(e.target.value) || minBandValue + 1))}
                                min={minBandValue + 1}
                            />
                        </div>
                        <button
                            onClick={simulateRSData}
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
                                'Simulate Dummy Data'
                            )}
                        </button>
                    </div>

                    {/* CSV Upload Section */}
                    <div className="border-t border-gray-700 pt-6 mt-6">
                        <h3 className="text-xl font-bold text-green-300 mb-4">Upload Your Data (CSV)</h3>
                        <p className="text-gray-500 text-sm mb-4">
                          Expected format: <code className="dark:bg-dark p-1 rounded">latitude,longitude,band1,band2,band3,value</code> (header required).
                        </p>
                        <div>
                            <label htmlFor="rsUpload" className="block text-gray-400 text-sm font-medium mb-2">
                                Upload Remote Sensing Data CSV
                            </label>
                            <input
                                type="file"
                                id="rsUpload"
                                accept=".csv"
                                className="w-full p-2 dark:bg-dark border border-gray-600 rounded-lg text-gray-200 file:mr-4 file:py-2 file:px-4
                                           file:rounded-full file:border-0 file:text-sm file:font-semibold
                                           file:bg-lime-500 file:text-white hover:file:bg-lime-600 cursor-pointer"
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
                    <h2 className="text-2xl font-bold text-green-300">Remote Sensing Data Visualization</h2>

                    {!showResults && !isLoading && (
                        <div className="text-center text-gray-500 py-16">
                            <p className="text-lg">Upload your remote sensing data CSV file to visualize and interpret it.</p>
                            <button
                                onClick={() => setShowExplanation(true)}
                                className="mt-4 ml-4 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition duration-300"
                            >
                                What is Remote Sensing?
                            </button>
                        </div>
                    )}

                    {isLoading && (
                        <div className="text-center text-gray-400 py-16">
                            <p className="text-lg">Processing data...</p>
                            <div className="mt-4">
                                <svg className="animate-spin h-8 w-8 text-lime-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        </div>
                    )}

                    {showResults && (
                        <>
                            {/* Scatter Plot of Data Points */}
                            <div className="dark:bg-dark p-4 rounded-lg shadow-xl border border-gray-700">
                                <h3 className="text-xl font-medium text-gray-200 mb-4">Spatial Distribution of Data</h3>
                                <p className="text-gray-400 text-sm mb-2">
                                    Data points plotted by Latitude and Longitude. Color represents Band 1 value (blue to red for low to high). Size represents 'Value' (e.g., Vegetation/Water).
                                </p>
                                {rsData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={400}>
                                        <ScatterChart
                                            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#4a4a4a" />
                                            <XAxis type="number" dataKey="longitude" name="Longitude" unit="°" stroke="#b0bec5" domain={['auto', 'auto']} />
                                            <YAxis type="number" dataKey="latitude" name="Latitude" unit="°" stroke="#b0bec5" domain={['auto', 'auto']} />
                                            {/* ZAxis for size based on a categorical value (e.g., 'value' column) */}
                                            <ZAxis
                                                type="category"
                                                dataKey="value"
                                                name="Category"
                                                range={[100, 400]} // Adjust size range as needed
                                                // Custom domain for ZAxis if 'value' is categorical
                                                domain={[...new Set(rsData.map(d => d.value))]}
                                            />
                                            <Tooltip
                                                cursor={{ strokeDasharray: '3 3' }}
                                                contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff', borderRadius: '8px' }}
                                                formatter={(value: any, name: string, props: any) => {
                                                    if (name === 'Band 1') return [`${value}`, 'Band 1'];
                                                    if (name === 'Band 2') return [`${value}`, 'Band 2'];
                                                    if (name === 'Band 3') return [`${value}`, 'Band 3'];
                                                    if (name === 'Category') return [`${value}`, 'Category'];
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
                                            <Scatter name="Remote Sensing Data" data={rsData}>
                                                {rsData.map((entry, index) => (
                                                    <Scatter key={`rs-point-${index}`} fill={getBandColor(entry.band1)} />
                                                ))}
                                            </Scatter>
                                        </ScatterChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="text-center text-gray-500 py-10">
                                        <p>No remote sensing data available. Upload a CSV.</p>
                                    </div>
                                )}
                                <div className="flex justify-center items-center mt-2">
                                    <div className="w-full h-4 bg-gradient-to-r from-blue-500 to-red-500 rounded-full"></div>
                                    <span className="ml-2 text-gray-400 text-xs">Low Band 1 Value - High Band 1 Value</span>
                                </div>
                            </div>

                            {/* LLM Interpretation */}
                            <div className="dark:bg-dark p-4 rounded-lg shadow-xl border border-gray-700 flex flex-col">
                                <h3 className="text-xl font-medium text-gray-200 mb-4">Geospatial Interpretation</h3>
                                <p className="text-gray-400 text-sm mb-2">
                                    Get an AI-powered interpretation of the remote sensing data.
                                </p>
                                <button
                                    onClick={interpretRSResults}
                                    className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out
                                               focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 mt-auto"
                                    disabled={interpretationLoading || rsData.length === 0}
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
                                        '✨ Get Geospatial Interpretation'
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
                        <h3 className="text-2xl font-bold text-teal-300 mb-4">What is Remote Sensing?</h3>
                        <div className="text-gray-300 space-y-4 text-base max-h-96 overflow-y-auto pr-4">
                            <p>
                                <strong>Remote Sensing</strong> is the science and art of obtaining information about an object or phenomenon without making physical contact with it. In the context of Earth observation, it typically involves using sensors on satellites or aircraft to collect data about the Earth's surface and atmosphere.
                            </p>
                            <p>
                                <strong>How Remote Sensing Works:</strong>
                                <br/>
                                <ul className="list-disc list-inside ml-4 mt-2">
                                    <li><strong>Energy Source:</strong> Remote sensing relies on an energy source to illuminate the target. This can be the sun (passive remote sensing) or an artificial source on the sensor itself (active remote sensing, e.g., radar, lidar).</li>
                                    <li><strong>Interaction with Target:</strong> The energy interacts with the Earth's surface (e.g., reflected, absorbed, emitted). Different materials reflect and absorb electromagnetic energy in unique ways, creating "spectral signatures."</li>
                                    <li><strong>Sensor Recording:</strong> Sensors onboard satellites or aircraft detect and record the energy reflected or emitted from the target. These sensors are designed to capture specific wavelengths of the electromagnetic spectrum.</li>
                                    <li><strong>Data Transmission & Processing:</strong> The recorded data is transmitted to Earth, where it undergoes processing to correct for atmospheric effects, geometric distortions, and other factors, making it ready for analysis.</li>
                                </ul>
                            </p>
                            <p>
                                <strong>Types of Remote Sensing Data:</strong>
                                <br/>
                                Remote sensing data is often multi-spectral, meaning it captures information across several different wavelength bands. Key characteristics include:
                                <ul className="list-disc list-inside ml-4 mt-2">
                                    <li><strong>Spectral Resolution:</strong> The number and width of the specific wavelength bands a sensor can detect. More bands allow for more detailed spectral signatures.</li>
                                    <li><strong>Spatial Resolution:</strong> The size of the smallest feature that can be detected on the ground (e.g., 1 meter per pixel, 30 meters per pixel).</li>
                                    <li><strong>Temporal Resolution:</strong> How often the sensor collects data over the same area (e.g., daily, weekly, monthly).</li>
                                    <li><strong>Radiometric Resolution:</strong> The sensor's ability to distinguish between subtle differences in energy intensity, often expressed in bits (e.g., 8-bit data has 256 possible values).</li>
                                </ul>
                            </p>
                            <p>
                                <strong>Interpretation of Remote Sensing Data:</strong>
                                <br/>
                                Interpretation involves analyzing the spectral, spatial, and temporal characteristics of the data to identify features, monitor changes, and understand processes on the Earth's surface.
                                <ul className="list-disc list-inside ml-4 mt-2">
                                    <li><strong>Spectral Signatures:</strong> Unique patterns of reflection and absorption across different wavelengths that allow differentiation of land cover types (e.g., healthy vegetation reflects strongly in near-infrared, water absorbs near-infrared).</li>
                                    <li><strong>Vegetation Indices:</strong> Mathematical combinations of spectral bands (e.g., NDVI - Normalized Difference Vegetation Index) used to quantify vegetation health and density.</li>
                                    <li><strong>Image Classification:</strong> Algorithms are used to automatically categorize pixels into different land cover classes (e.g., forest, urban, agriculture, water).</li>
                                    <li><strong>Change Detection:</strong> Comparing images of the same area over time to identify changes (e.g., deforestation, urban expansion, flood extent).</li>
                                </ul>
                            </p>
                            <p>
                                <strong>Common Applications of Remote Sensing:</strong>
                                <br/>
                                Remote sensing has a vast array of applications:
                                <ul className="list-disc list-inside ml-4 mt-2">
                                    <li><strong>Agriculture:</strong> Crop health monitoring, yield prediction, irrigation management.</li>
                                    <li><strong>Forestry:</strong> Forest mapping, deforestation monitoring, fire detection.</li>
                                    <li><strong>Urban Planning:</strong> Urban growth analysis, infrastructure mapping.</li>
                                    <li><strong>Environmental Monitoring:</strong> Water quality, pollution detection, glacier monitoring, disaster assessment (floods, wildfires).</li>
                                    <li><strong>Oceanography:</strong> Sea surface temperature, chlorophyll concentration, ocean currents.</li>
                                    <li><strong>Disaster Management:</strong> Damage assessment after natural disasters, emergency response planning.</li>
                                </ul>
                            </p>
                            <p>
                                Remote sensing provides a powerful means to collect vast amounts of data about the Earth, enabling large-scale and long-term monitoring of our planet's dynamic processes.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
