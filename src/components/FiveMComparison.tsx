import React from 'react';

interface ComparisonRow {
  feature: string;
  fivem: string;
  helix: string;
}

interface FiveMComparisonProps {
  rows: ComparisonRow[];
  title?: string;
}

export default function FiveMComparison({
  rows,
  title = 'FiveM vs HELIX',
}: FiveMComparisonProps): React.ReactElement {
  return (
    <div className="fivem-comparison">
      {title && <h4 style={{padding: '12px 16px', margin: 0}}>{title}</h4>}
      <table style={{margin: 0}}>
        <thead>
          <tr>
            <th>Feature</th>
            <th>FiveM</th>
            <th>HELIX</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td><strong>{row.feature}</strong></td>
              <td><code>{row.fivem}</code></td>
              <td><code>{row.helix}</code></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
