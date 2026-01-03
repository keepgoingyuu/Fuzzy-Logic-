/**
 * Input controls for dirt and grease levels
 */
import { useState, useEffect } from 'react';
import TuneIcon from '@mui/icons-material/Tune';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';
import WarningIcon from '@mui/icons-material/Warning';

interface InputControlsProps {
  onInputChange: (dirt: number, grease: number) => void;
  initialDirt?: number;
  initialGrease?: number;
}

export function InputControls({
  onInputChange,
  initialDirt = 120,
  initialGrease = 140
}: InputControlsProps) {
  const [dirtLevel, setDirtLevel] = useState(initialDirt);
  const [greaseLevel, setGreaseLevel] = useState(initialGrease);

  useEffect(() => {
    onInputChange(dirtLevel, greaseLevel);
  }, [dirtLevel, greaseLevel, onInputChange]);

  const handleDirtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDirtLevel(Number(e.target.value));
  };

  const handleGreaseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGreaseLevel(Number(e.target.value));
  };

  return (
    <div className="input-controls">
      <h2>
        <TuneIcon sx={{ fontSize: 28, marginRight: 1, verticalAlign: 'middle' }} />
        輸入控制
      </h2>

      <div className="control-group">
        <label htmlFor="dirt-slider">
          <span className="label-text">污泥程度 (Dirt Level)</span>
          <span className="value-display">{dirtLevel}</span>
        </label>
        <input
          id="dirt-slider"
          type="range"
          min="0"
          max="200"
          step="1"
          value={dirtLevel}
          onChange={handleDirtChange}
          className="slider dirt-slider"
        />
        <div className="range-labels">
          <span>0 (乾淨)</span>
          <span>100</span>
          <span>200 (很髒)</span>
        </div>
      </div>

      <div className="control-group">
        <label htmlFor="grease-slider">
          <span className="label-text">油污程度 (Grease Level)</span>
          <span className="value-display">{greaseLevel}</span>
        </label>
        <input
          id="grease-slider"
          type="range"
          min="0"
          max="200"
          step="1"
          value={greaseLevel}
          onChange={handleGreaseChange}
          className="slider grease-slider"
        />
        <div className="range-labels">
          <span>0 (無油污)</span>
          <span>100</span>
          <span>200 (重油污)</span>
        </div>
      </div>

      <div className="preset-buttons">
        <button onClick={() => { setDirtLevel(50); setGreaseLevel(30); }}>
          <CleaningServicesIcon sx={{ fontSize: 20, marginRight: 0.5, verticalAlign: 'middle' }} />
          輕度髒污
        </button>
        <button onClick={() => { setDirtLevel(120); setGreaseLevel(140); }}>
          <LocalLaundryServiceIcon sx={{ fontSize: 20, marginRight: 0.5, verticalAlign: 'middle' }} />
          中度髒污
        </button>
        <button onClick={() => { setDirtLevel(180); setGreaseLevel(180); }}>
          <WarningIcon sx={{ fontSize: 20, marginRight: 0.5, verticalAlign: 'middle' }} />
          重度髒污
        </button>
      </div>
    </div>
  );
}
