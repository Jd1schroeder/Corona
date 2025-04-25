import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pencil, Settings, Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

const initialMaterials = {
  TPO: { initialDyne: 40, decayRate: 0.03 },
  HDPE: { initialDyne: 42, decayRate: 0.02 },
  ABS: { initialDyne: 44, decayRate: 0.025 },
  Acrylic: { initialDyne: 46, decayRate: 0.015 },
};

export default function WattDensityApp() {
  const [materials, setMaterials] = useState(initialMaterials);
  const [line1, setLine1] = useState({ width: 48, speed: 100, power: 1, sides: 1 });
  const [line4, setLine4] = useState({ width: 48, speed: 100, power: 1, sides: 1 });
  const [line1Label, setLine1Label] = useState('Line 1');
  const [line4Label, setLine4Label] = useState('Line 4');
  const [material, setMaterial] = useState('TPO');
  const [desiredDyne, setDesiredDyne] = useState(42);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newMaterialName, setNewMaterialName] = useState('');

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

  const updateMaterial = (name, field, value) => {
    setMaterials(prev => ({
      ...prev,
      [name]: { ...prev[name], [field]: parseFloat(value) }
    }));
  };

  const addMaterial = () => {
    if (newMaterialName.trim() !== '' && !materials[newMaterialName]) {
      setMaterials(prev => ({ ...prev, [newMaterialName]: { initialDyne: 40, decayRate: 0.02 } }));
      setNewMaterialName('');
    }
  };

  const removeMaterial = (name) => {
    const updated = { ...materials };
    delete updated[name];
    setMaterials(updated);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Corona Analysis</h1>
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost"><Settings className="w-6 h-6" /></Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Settings</DialogTitle>
            <div className="space-y-6">
              <div className="flex gap-2">
                <Input placeholder="New Material Name" value={newMaterialName} onChange={(e) => setNewMaterialName(e.target.value)} />
                <Button onClick={addMaterial}><Plus className="w-4 h-4" /></Button>
              </div>
              {Object.keys(materials).sort().map((mat) => (
                <div key={mat} className="border p-4 rounded mb-4 relative">
                  <button onClick={() => removeMaterial(mat)} className="absolute top-2 right-2 text-red-600"><Trash2 className="w-4 h-4" /></button>
                  <Input className="mb-2 font-semibold" value={mat} onChange={(e) => {
                    const newName = e.target.value;
                    if (!newName.trim() || materials[newName]) return;
                    setMaterials(prev => {
                      const updated = { ...prev };
                      updated[newName] = updated[mat];
                      delete updated[mat];
                      return updated;
                    });
                    if (material === mat) setMaterial(newName);
                  }} />
                  <label>Untreated Dyne</label>
                  <Input className="mb-2" value={materials[mat].initialDyne} onChange={(e) => updateMaterial(mat, 'initialDyne', e.target.value)} />
                  <label>Decay Rate (per day)</label>
                  <Input value={materials[mat].decayRate} onChange={(e) => updateMaterial(mat, 'decayRate', e.target.value)} />
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent>
          <label className="pt-2 mt-4 block">Material</label>
          <select className="border rounded p-2 w-full" value={material} onChange={(e) => setMaterial(e.target.value)}>
            {Object.keys(materials).map(mat => <option key={mat}>{mat}</option>)}
          </select>
          <label className="pt-2 mt-4 block">Desired Dyne Level</label>
          <Input type="number" value={desiredDyne} onChange={(e) => setDesiredDyne(Number(e.target.value))} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardContent>
            <h2 className="text-xl font-bold">{line1Label}</h2>
            <InputBlock label="Web Width (inches)" value={line1.width} onChange={v => setLine1({ ...line1, width: v })} />
            <InputBlock label="Line Speed (FPM)" value={line1.speed} onChange={v => setLine1({ ...line1, speed: v })} />
            <InputBlock label="Power (kW)" value={line1.power} onChange={v => setLine1({ ...line1, power: v })} />
            <InputBlock label="Sides Treated" value={line1.sides} onChange={v => setLine1({ ...line1, sides: v })} />
            <div className="pt-2 text-sm font-medium text-gray-700">Watt Density: {wattDensity1.toFixed(2)} W/ft²/min</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className="text-xl font-bold">{line4Label}</h2>
            <InputBlock label="Web Width (inches)" value={line4.width} onChange={v => setLine4({ ...line4, width: v })} />
            <InputBlock label="Line Speed (FPM)" value={line4.speed} onChange={v => setLine4({ ...line4, speed: v })} />
            <InputBlock label="Power (kW)" value={line4.power} onChange={v => setLine4({ ...line4, power: v })} />
            <InputBlock label="Sides Treated" value={line4.sides} onChange={v => setLine4({ ...line4, sides: v })} />
            <div className="pt-2 text-sm font-medium text-gray-700">Watt Density: {wattDensity4.toFixed(2)} W/ft²/min</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <h2 className="text-xl font-bold mb-4">Watt Density vs Line Speed</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={generateSpeedChartDataBoth()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="speed" label={{ value: 'Line Speed (FPM)', position: 'insideBottomRight', offset: -5 }} />
              <YAxis label={{ value: 'Watt Density', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="line1" stroke="#8884d8" name={line1Label} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="line4" stroke="#82ca9d" name={line4Label} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="text-xl font-bold mb-4">Dyne Level Decay Over Time ({material})</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={generateDecayData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" label={{ value: 'Days', position: 'insideBottomRight', offset: -5 }} />
              <YAxis label={{ value: 'Dyne Level', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="dyne" stroke="#82ca9d" activeDot={{ r: 8 }} />
              <ReferenceLine y={untreatedDyne} stroke="red" strokeDasharray="4 4" label={{ value: 'Untreated Dyne', position: 'top', fill: 'red' }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function InputBlock({ label, value, onChange }) {
  return (
    <div className="py-2">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <Input type="number" value={value} onChange={e => onChange(Number(e.target.value))} placeholder={label} />
    </div>
  );
}
