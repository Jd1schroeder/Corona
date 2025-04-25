import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

const initialMaterials = {
  TPO: { initialDyne: 40, decayRate: 0.03 },
  HDPE: { initialDyne: 42, decayRate: 0.02 },
  ABS: { initialDyne: 44, decayRate: 0.025 },
  Acrylic: { initialDyne: 46, decayRate: 0.015 },
};

export default function App() {
  const [materials, setMaterials] = useState(initialMaterials);
  const [line1, setLine1] = useState({ width: 48, speed: 100, power: 1, sides: 1 });
  const [line4, setLine4] = useState({ width: 48, speed: 100, power: 1, sides: 1 });
  const [material, setMaterial] = useState('TPO');
  const [desiredDyne, setDesiredDyne] = useState(42);

  const calculateWattDensity = ({ width, speed, power, sides }) => {
    const widthFeet = width / 12;
    return (power * 1000) / (widthFeet * speed * sides);
  };

  const generateSpeedChartDataBoth = () => {
    const data = [];
    const maxSpeed = Math.max(line1.speed, line4.speed);
    const extendedMaxSpeed = Math.ceil(maxSpeed * 1.25);
    const increment = Math.ceil(extendedMaxSpeed / 20);
    for (let spd = 10; spd <= extendedMaxSpeed; spd += increment) {
      const widthFeet1 = line1.width / 12;
      const wd1 = (line1.power * 1000) / (widthFeet1 * spd * line1.sides);
      const widthFeet4 = line4.width / 12;
      const wd4 = (line4.power * 1000) / (widthFeet4 * spd * line4.sides);
      data.push({ speed: spd, line1: parseFloat(wd1.toFixed(2)), line4: parseFloat(wd4.toFixed(2)) });
    }
    return data;
  };

  const generateDecayData = () => {
    const { decayRate } = materials[material];
    const data = [];
    let dyne = desiredDyne;
    for (let day = 0; day <= 30; day++) {
      data.push({ day, dyne: parseFloat(dyne.toFixed(2)) });
      dyne *= (1 - decayRate);
    }
    return data;
  };

  const wattDensity1 = calculateWattDensity(line1);
  const wattDensity4 = calculateWattDensity(line4);
  const untreatedDyne = materials[material].initialDyne;

  const InputBlock = ({ label, value, onChange }) => (
    <div className="py-2">
      <label className="block text-sm font-medium pt-2 mb-1">{label}</label>
      <input
        className="w-full border rounded p-2"
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Corona Analysis</h1>

      <div className="bg-white border rounded p-4">
        <label className="block text-sm font-medium pt-2">Material</label>
        <select className="w-full border rounded p-2" value={material} onChange={(e) => setMaterial(e.target.value)}>
          {Object.keys(materials).map((mat) => (
            <option key={mat} value={mat}>{mat}</option>
          ))}
        </select>
        <label className="block text-sm font-medium pt-2">Desired Dyne Level</label>
        <input
          className="w-full border rounded p-2"
          type="number"
          value={desiredDyne}
          onChange={(e) => setDesiredDyne(Number(e.target.value))}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border rounded p-4">
          <h2 className="text-xl font-bold mb-2">Line 1</h2>
          <InputBlock label="Web Width (inches)" value={line1.width} onChange={(v) => setLine1({ ...line1, width: v })} />
          <InputBlock label="Line Speed (FPM)" value={line1.speed} onChange={(v) => setLine1({ ...line1, speed: v })} />
          <InputBlock label="Power (kW)" value={line1.power} onChange={(v) => setLine1({ ...line1, power: v })} />
          <InputBlock label="Sides Treated" value={line1.sides} onChange={(v) => setLine1({ ...line1, sides: v })} />
          <div className="pt-2 text-sm font-medium text-gray-700">Watt Density: {wattDensity1.toFixed(2)} W/ft²/min</div>
        </div>

        <div className="bg-white border rounded p-4">
          <h2 className="text-xl font-bold mb-2">Line 4</h2>
          <InputBlock label="Web Width (inches)" value={line4.width} onChange={(v) => setLine4({ ...line4, width: v })} />
          <InputBlock label="Line Speed (FPM)" value={line4.speed} onChange={(v) => setLine4({ ...line4, speed: v })} />
          <InputBlock label="Power (kW)" value={line4.power} onChange={(v) => setLine4({ ...line4, power: v })} />
          <InputBlock label="Sides Treated" value={line4.sides} onChange={(v) => setLine4({ ...line4, sides: v })} />
          <div className="pt-2 text-sm font-medium text-gray-700">Watt Density: {wattDensity4.toFixed(2)} W/ft²/min</div>
        </div>
      </div>

      <div className="bg-white border rounded p-4">
        <h2 className="text-xl font-bold mb-4">Watt Density vs Line Speed</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={generateSpeedChartDataBoth()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="speed" label={{ value: 'Line Speed (FPM)', position: 'insideBottomRight', offset: -5 }} />
            <YAxis label={{ value: 'Watt Density', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="line1" stroke="#8884d8" name="Line 1" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="line4" stroke="#82ca9d" name="Line 4" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white border rounded p-4">
        <h2 className="text-xl font-bold mb-4">Dyne Level Decay Over Time ({material})</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={generateDecayData()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" label={{ value: 'Days', position: 'insideBottomRight', offset: -5 }} />
            <YAxis label={{ value: 'Dyne Level', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="dyne" stroke="#82ca9d" />
            <ReferenceLine y={untreatedDyne} stroke="red" strokeDasharray="4 4" label={{ value: 'Untreated Dyne', position: 'top', fill: 'red' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
