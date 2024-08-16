"use client";

import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [role, setRole] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const analyzeProfile = async () => {
    setIsLoading(true);
    try {
      // Step 1: Scrape the profile
      const scrapeResponse = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileUrl: url }),
      });
      const profileData = await scrapeResponse.json();

      if (scrapeResponse.ok) {
        // Step 2: Analyze the profile
        const analyzeResponse = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profileData, desiredRole: role }),
        });
        const analysisResult = await analyzeResponse.json();

        if (analyzeResponse.ok) {
          setResult(analysisResult.analysis);
        } else {
          setResult(`Error analyzing profile: ${analysisResult.error}`);
        }
      } else {
        setResult(`Error scraping profile: ${profileData.error}`);
      }
    } catch (error) {
      setResult(`An error occurred: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold mb-8">LinkedIn Profile Analyzer</h1>
      <div className="w-full max-w-md">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter LinkedIn URL"
          className="w-full p-2 mb-4 border rounded text-black"
        />
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Enter desired role"
          className="w-full p-2 mb-4 border rounded text-black"
        />
        <button
          onClick={analyzeProfile}
          disabled={isLoading}
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isLoading ? "Analyzing..." : "Analyze Profile"}
        </button>
        {result && (
          <div className="mt-8 p-4 border rounded">
            <h2 className="text-2xl font-bold mb-4">Analysis Result</h2>
            <pre className="whitespace-pre-wrap">{result}</pre>
          </div>
        )}
      </div>
    </main>
  );
}