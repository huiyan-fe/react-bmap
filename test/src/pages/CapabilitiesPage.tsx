import React from 'react';
import { useCapabilities, useDriver } from 'react-bmap';
import { CAPABILITY_MATRIX } from '../../../src/drivers/capabilityMatrix';

/**
 * 能力矩阵查看页。
 *
 * 显示当前 driver 版本 + 完整能力清单（v3 / v4 两列对比）。
 */
export function CapabilitiesPage() {
  const driver = useDriver();
  const caps = useCapabilities();

  if (!driver) {
    return <div className="test-page"><div className="muted">driver 未就绪</div></div>;
  }

  // 汇总所有版本的能力并集
  const allCaps = new Set<string>([
    ...CAPABILITY_MATRIX['3.0'],
    ...CAPABILITY_MATRIX['4.0'],
  ]);
  const sorted = Array.from(allCaps).sort();

  return (
    <div className="test-page capabilities-page">
      <div className="test-controls" style={{ flex: 1, maxWidth: 'none' }}>
        <h2>Capabilities Matrix</h2>
        <p className="muted">
          当前版本: <code>{driver.version}</code>；
          矩阵来源: <code>src/drivers/capabilityMatrix.ts</code>（自动生成）。
        </p>

        <table className="cap-table">
          <thead>
            <tr>
              <th>capability</th>
              <th className={driver.version === '3.0' ? 'col-active' : ''}>3.0</th>
              <th className={driver.version === '4.0' ? 'col-active' : ''}>4.0</th>
              <th>当前 driver</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((cap) => {
              const inV3 = CAPABILITY_MATRIX['3.0'].has(cap);
              const inV4 = CAPABILITY_MATRIX['4.0'].has(cap);
              const current = caps.has(cap);
              return (
                <tr key={cap}>
                  <td><code>{cap}</code></td>
                  <td className={inV3 ? 'yes' : 'no'}>{inV3 ? '✓' : '—'}</td>
                  <td className={inV4 ? 'yes' : 'no'}>{inV4 ? '✓' : '—'}</td>
                  <td className={current ? 'yes-strong' : 'no'}>{current ? '●' : ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
