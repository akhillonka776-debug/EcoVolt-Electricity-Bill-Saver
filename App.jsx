import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BillReminder from './components/BillReminder';
import IdleNudge from './components/IdleNudge';
import UnitExplainer from './components/UnitExplainer';
import ApplianceCalculator from './components/ApplianceCalculator';
import EnergySavingsTips from './components/EnergySavingsTips';

import { 
  loadBills, saveBills, 
  loadAppliances, saveAppliances, 
  loadIdleMonitors, saveIdleMonitors, 
  loadSettings, saveSettings 
} from './utils/storage';
import { calculateApplianceEnergy, calculateSlabCost } from './utils/calculations';

export default function App() {
  const [activeTab, setActiveTab] = useState('reminders');
  const [currency, setCurrency] = useState('INR');
  
  const [bills, setBills] = useState([]);
  const [appliances, setAppliances] = useState([]);
  const [idleMonitors, setIdleMonitors] = useState([]);

  // Load state from LocalStorage on mount
  useEffect(() => {
    setBills(loadBills());
    setAppliances(loadAppliances());
    setIdleMonitors(loadIdleMonitors());
    const settings = loadSettings();
    if (settings && settings.currency) {
      setCurrency(settings.currency);
    }
  }, []);

  // Save state changes
  useEffect(() => {
    saveBills(bills);
  }, [bills]);

  useEffect(() => {
    saveAppliances(appliances);
  }, [appliances]);

  useEffect(() => {
    saveIdleMonitors(idleMonitors);
  }, [idleMonitors]);

  useEffect(() => {
    saveSettings({ currency });
  }, [currency]);

  // Compute metrics for header
  const unpaidCount = bills.filter(b => !b.paid).length;
  const idleAlertCount = idleMonitors.filter(m => m.isRunning && m.activeHours > m.maxHours).length;

  let totalMonthlyUnits = 0;
  appliances.forEach(app => {
    const { monthlyKWh } = calculateApplianceEnergy(app.watts, app.hours, app.qty);
    totalMonthlyUnits += monthlyKWh;
  });
  const { totalCost } = calculateSlabCost(totalMonthlyUnits, currency);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      
      {/* Header component */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currency={currency} 
        setCurrency={setCurrency}
        unpaidCount={unpaidCount}
        idleAlertCount={idleAlertCount}
        estMonthlyTotal={totalCost}
      />

      {/* Main Tab Views */}
      <main>
        {activeTab === 'reminders' && (
          <BillReminder bills={bills} setBills={setBills} currency={currency} />
        )}

        {activeTab === 'nudge' && (
          <IdleNudge idleMonitors={idleMonitors} setIdleMonitors={setIdleMonitors} currency={currency} />
        )}

        {activeTab === 'explainer' && (
          <UnitExplainer currency={currency} />
        )}

        {activeTab === 'calculator' && (
          <ApplianceCalculator appliances={appliances} setAppliances={setAppliances} currency={currency} />
        )}

        {activeTab === 'tips' && (
          <EnergySavingsTips currency={currency} />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        marginTop: '48px',
        paddingTop: '24px',
        borderTop: '1px solid var(--border-color)',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.85rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '1.1rem' }}>⚡</span>
          <strong style={{ color: '#ffffff' }}>EcoVolt Electricity Saver & Idle Nudge Assistant</strong>
        </div>
        <p>
          Save money on electricity bills • Avoid late payment penalties • Cut home appliance energy waste
        </p>
      </footer>

    </div>
  );
}
