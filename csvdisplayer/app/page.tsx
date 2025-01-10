"use client";
import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import Link from "next/link";

// Structure of data from TableInput.csv
// will be used to map to displayed Table 1
interface CSVRow {
  "Index #": string; // For "Index #"
  Value: string; // For "Value"
}
// Structure for Table 2 data
interface CalculatedRow {
    category: string;
    value: number;
  }

  const Home: React.FC = () => {
    const [data, setData] = useState<CSVRow[]>([]); // State for storing parsed CSV data
    const [error, setError] = useState<string | null>(null); // Message if there's an error
    const [calculatedData, setCalculatedData] = useState<CalculatedRow[]>([]); // State for Table 2 data
    

    useEffect(() => {
      const fetchCSV = async () => {
        try {
          const response = await fetch("/Table_Input.csv"); // Replace with your actual file name
          if (!response.ok) {
            throw new Error(`Failed to fetch CSV file. Status: ${response.status}`);
          }
  
          const csvText = await response.text();
  
          Papa.parse<CSVRow>(csvText, {
            header: true, // Assume the first row contains headers
            skipEmptyLines: true, // Ignore empty lines
            complete: (results) => {
              if (results.errors.length > 0) {
                throw new Error(results.errors[0].message); // Handle the first error
              }
              setData(results.data); // Update state with parsed data
              console.log("State Data:", results.data);
  
              // Perform calculations based on the parsed data
              const calculated = calculateData(results.data);
              setCalculatedData(calculated); // Update the state for calculated data
            },
          });
          console.log("Fetched CSV Data:", csvText); // Log the raw CSV data
        } catch (err) {
          setError(err instanceof Error ? err.message : "An unknown error occurred.");
        }
      };
  
      fetchCSV();
    }, []);
  
    // Helper function to calculate data
    const calculateData = (csvData: CSVRow[]): CalculatedRow[] => {
      // Extract values and convert to numbers
      const values = csvData.map((row) => parseInt(row.Value || "0", 10));
  
      // Perform calculations
      const alpha = values[4] + values[19]; // A5 + A20
      const beta = values[14] / (values[6] || 1); // A15 / A7
      const charlie = values[12] * values[11]; // A13 * A12
        
      // only returns 3 rows for display in Table 2
      return [
        { category: "Alpha", value: alpha },
        { category: "Beta", value: Math.floor(beta) },
        { category: "Charlie", value: charlie },
      ];
    };
    

  return (
    <div className="bg-rose-100 min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 text-black">
      <h1 className="text-2xl font-bold">Data from TableInput.csv</h1>
      <button className="bg-blue-500 text-white px-4 py-2 rounded m-4">
        <Link href={"/displayadvanced"}>Go to Editable Table Page &#x1F47E;</Link>
      </button>

      <h2 className="text-xl font-bold mb-2">Table 1</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {data.length > 0 ? (
        <table className="min-w-48 bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">
                Index #
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className="odd:bg-gray-50 even:bg-gray-100">
                <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600 text-left">
                  {row["Index #"]}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600 text-right">
                  {row.Value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        
      ) : (
        <p className="text-gray-700">Loading data...</p>
      )}

       <div className="pt-10">
            <h1 className="text-2xl mb-2">Table 2</h1>
            <table className="min-w-64 bg-white border border-gray-200 mb-10" cellPadding="10" border={1}>
                <thead>
                <tr>
                    <th className="border border-black px-4 py-2 text-left text-sm font-medium text-black font-extrabold">Category</th>
                    <th className="border border-black px-4 py-2 text-left text-sm font-medium text-black font-extrabold">Value</th>
                </tr>
                </thead>
                <tbody>
                    {calculatedData.map((row, index) => (
                        <tr key={index}>
                        <td className="border border-black px-4 py-2 text-sm text-black text-left">{row.category}</td>
                        <td className="border border-black px-4 py-2 text-sm text-black text-left">{row.value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {/* <pre>{JSON.stringify(calculatedData, null, 2)}</pre> */}

       </div>

    </div>
  );
};

export default Home;
