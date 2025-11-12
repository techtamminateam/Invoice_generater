import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Plus, X, Loader2 } from 'lucide-react';
import Login from './login';
import Navbar from './navbar';

const API_URL = 'http://localhost:5000/api';

export default function TimesheetApp() {
  const [activeTab, setActiveTab] = useState('onboard');
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const fetchCompanies = async () => {
    try {
      const response = await fetch(`${API_URL}/companies`);
      if (!response.ok) {
        throw new Error(`Failed to fetch companies: ${response.statusText}`);
      }
      const data = await response.json();
      setCompanies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError(err.message);
      setCompanies([]);
    }
  };

  const handleDeleteCompany = async (companyId, companyName) => {
    if (!window.confirm(`Are you sure you want to delete ${companyName}? This will delete all related data and files.`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/companies/${companyId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Failed to delete company: ${response.statusText}`);
      }

      // Refresh the companies list
      fetchCompanies();
      alert(`Company ${companyName} deleted successfully`);
    } catch (error) {
      console.error('Error deleting company:', error);
      alert('Failed to delete company. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'onboard') {
      fetchCompanies();
    }
  }, [activeTab]);

  return (
    <><Navbar  /><div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">Timesheet Management System</h1>

      <div className="flex gap-2 mb-6">
        {['onboard', 'invoice', 'history', 'companies'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-2 rounded ${activeTab === tab ? 'bg-blue-500 text-white' : 'bg-blue-100'}`}
          >
            {tab === 'onboard' ? 'Company Onboarding' :
              tab === 'invoice' ? 'Generate Invoice' :
                tab === 'history' ? 'Invoice History' : 'Companies List'}
          </button>
        ))}
      </div>
      {activeTab === 'onboard' && <CompanyOnboarding />}
      {activeTab === 'invoice' && <InvoiceGeneration companies={companies} />}
      {activeTab === 'history' && <InvoiceHistory />}
      {activeTab === 'companies' && (
        <div className="mt-6">
          <h2 className="text-2xl font-bold mb-4">Companies List</h2>
          {loading && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="animate-spin text-blue-600" />
              <span className="ml-2 text-blue-700">Processing...</span>
            </div>
          )}
          {error && (
            <div className="bg-blue-50 text-blue-700 p-4 rounded mb-4">
              Error: {error}
            </div>
          )}
          <div className="grid gap-4">
            {!loading && (companies && companies.length > 0 ? (
              companies.map(company => (
                <div key={company.id} className="bg-white p-4 rounded-lg shadow-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold">{company.name}</h3>
                      <p className="text-blue-700">{company.email}</p>
                      <p className="text-blue-700">Address: {company.address}</p>
                      <p className="text-blue-700">GST: {company.GST}</p>
                      <p className="text-blue-700">SAC: {company.SAC}</p>
                      <p className="text-blue-700">Contact: {company.contact_number}</p>
                      <p className="text-blue-700">Type: {company.client_type}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteCompany(company.id, company.name)}
                      className="text-blue-600 hover:text-blue-700 p-2 rounded hover:bg-blue-50 transition-colors"
                      disabled={loading}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  {company.po_numbers && company.po_numbers.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">PO Numbers:</h4>
                      <div className="grid gap-2">
                        {company.po_numbers.map(po => (
                          <div key={po.id} className="bg-blue-50 p-2 rounded">
                            <p>PO Number: {po.po_number}</p>
                            <p>Budget: ${po.monthly_budget}</p>
                            {po.hourly_rate && <p>Hourly Rate: ${po.hourly_rate}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center p-8 bg-blue-50 rounded">
                <p className="text-blue-700">No companies found. Add a company using the Company Onboarding tab.</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div></>
  );
}

function CompanyOnboarding() {
  const [formData, setFormData] = useState({
    name: '', contact_number: '', email: '', building_no: '', local_street:'', city:'', state:'', country:'', GST: '',SAC: '', client_type: 'same_state', document: null
  });
  const [poNumbers, setPoNumbers] = useState([
    { po_number: '', monthly_budget: '', hourly_rate: '', igst: 18, cgst: 9, sgst: 9, employees: [{ name: '', email: '', doj: '', location: '' }] }
  ]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (key !== 'document') formDataToSend.append(key, formData[key]);
    });
    if (formData.document) formDataToSend.append('document', formData.document);
    formDataToSend.append('po_numbers', JSON.stringify(poNumbers));

    try {
      const response = await fetch(`${API_URL}/companies`, { method: 'POST', body: formDataToSend });
      if (response.ok) {
        setSuccess(true);
        setFormData({ name: '', contact_number: '', building_no: '', local_street:'', city:'', state:'', country:'', GST:'',SAC: '', email: '', client_type: 'same_state', document: null });
  setPoNumbers([{ po_number: '', monthly_budget: '', hourly_rate: '', igst: 18, cgst: 9, sgst: 9, employees: [{ name: '', email: '', doj: '', location: '' }] }]);
        setTimeout(() => setSuccess(false), 3000);
      } else alert('Error creating company');
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-2 rounded">Company onboarded successfully!</div>}

     <div className="bg-white p-4 rounded border">
        <h2 className="text-xl font-semibold mb-3">Company Information</h2>
        <div className="grid grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
            <input type="text" placeholder="Company Name" required value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} className="border p-2 rounded w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number *</label>
            <input type="tel" placeholder="Contact Number" required value={formData.contact_number}
              onChange={e => setFormData({...formData, contact_number: e.target.value})} className="border p-2 rounded w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Building No/ Flat No *</label>
            <input type="text" placeholder="Building No/ Flat No" required value={formData.building_no}
              onChange={e => setFormData({...formData, building_no: e.target.value})} className="border p-2 rounded w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Local Street *</label>
            <input type="text" placeholder="Local Street" required value={formData.local_street}
              onChange={e => setFormData({...formData, local_street: e.target.value})} className="border p-2 rounded w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
            <input type="text" placeholder="City" required value={formData.city}
              onChange={e => setFormData({...formData, city: e.target.value})} className="border p-2 rounded w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
            <input type="text" placeholder="State" required value={formData.state}
              onChange={e => setFormData({...formData, state: e.target.value})} className="border p-2 rounded w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
            <input type="text" placeholder="Country" required value={formData.country}
              onChange={e => setFormData({...formData, country: e.target.value})} className="border p-2 rounded w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GST Number *</label>
            <input type="text" placeholder="GST Number" required value={formData.GST}
              onChange={e => setFormData({...formData, GST: e.target.value})} className="border p-2 rounded w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SAC Number *</label>
            <input type="text" placeholder="SAC Number" required value={formData.SAC}
              onChange={e => setFormData({...formData, SAC: e.target.value})} className="border p-2 rounded w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" placeholder="Email" required value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})} className="border p-2 rounded w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client Type</label>
            <select value={formData.client_type} onChange={e => setFormData({...formData, client_type: e.target.value})} className="border p-2 rounded w-full">
              <option value="same_state">Same State (IGST)</option>
              <option value="other_state">Other State (CGST+SGST)</option>
              <option value="foreign">Foreign (No GST)</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Document</label>
            <input type="file" onChange={e => setFormData({...formData, document: e.target.files[0]})} className="border p-2 rounded w-full" />
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded border">
        <div className="flex justify-between mb-3">
          <h2 className="text-xl font-semibold">PO Numbers</h2>
          <button type="button" onClick={() => setPoNumbers([...poNumbers, { po_number: '', monthly_budget: '', hourly_rate: '', igst: 18, cgst: 9, sgst: 9, employees: [{ name: '', email: '', doj: '', location: '' }] }])}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm flex items-center gap-1">
            <Plus className="h-4 w-4" /> Add PO
          </button>
        </div>

        {poNumbers.map((po, poIndex) => (
          <div key={poIndex} className="border-2 border-blue-300 p-3 mb-3 rounded bg-white">
            <div className="flex justify-between mb-2">
              <span className="font-semibold">PO #{poIndex + 1}</span>
              {poNumbers.length > 1 && (
                <button type="button" onClick={() => setPoNumbers(poNumbers.filter((_, i) => i !== poIndex))} className="text-red-500">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2 mb-2">
              <input type="text" placeholder="PO Number *" required value={po.po_number}
                onChange={e => { const updated = [...poNumbers]; updated[poIndex].po_number = e.target.value; setPoNumbers(updated); }}
                className="border p-2 rounded" />

              {formData.client_type === 'foreign' ? (
                <input type="number" placeholder="Hour Rate $" required value={po.hourly_rate} step="0.01"
                  onChange={e => { const updated = [...poNumbers]; updated[poIndex].hourly_rate = e.target.value; setPoNumbers(updated); }}
                  className="border p-2 rounded" />
              ) : (
                <>
                  <input type="number" placeholder="Monthly Budget ₹" required value={po.monthly_budget}
                    onChange={e => { const updated = [...poNumbers]; updated[poIndex].monthly_budget = e.target.value; setPoNumbers(updated); }}
                    className="border p-2 rounded" />
                  {formData.client_type === 'same_state' ? (
                    <input type="number" placeholder="IGST %" value={po.igst} step="0.01"
                      onChange={e => { const updated = [...poNumbers]; updated[poIndex].igst = e.target.value; setPoNumbers(updated); }}
                      className="border p-2 rounded" />
                  ) : (
                    <>
                      <input type="number" placeholder="CGST %" value={po.cgst} step="0.01"
                        onChange={e => { const updated = [...poNumbers]; updated[poIndex].cgst = e.target.value; setPoNumbers(updated); }}
                        className="border p-2 rounded" />
                      <input type="number" placeholder="SGST %" value={po.sgst} step="0.01"
                        onChange={e => { const updated = [...poNumbers]; updated[poIndex].sgst = e.target.value; setPoNumbers(updated); }}
                        className="border p-2 rounded" />
                    </>
                  )}
                </>
              )}
            </div>

            <div className="bg-white p-2 rounded space-y-3">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Employees</span>
                <button type="button" onClick={() => {
                  const updated = [...poNumbers];
                  updated[poIndex].employees.push({ name: '', email: '', doj: '', location: '' });
                  setPoNumbers(updated);
                }} className="text-blue-500 text-sm">+ Add Employee</button>
              </div>

                {po.employees.map((emp, empIndex) => (
                <div key={empIndex} className="mb-2 rounded-md border-2 border-blue-300 bg-white p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-blue-700">Employee #{empIndex + 1}</span>
                    {po.employees.length > 1 && (
                      <button type="button" onClick={() => {
                        const updated = [...poNumbers];
                        updated[poIndex].employees = updated[poIndex].employees.filter((_, i) => i !== empIndex);
                        setPoNumbers(updated);
                      }} className="text-blue-600 px-2 py-1 rounded hover:bg-blue-50">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    <input type="text" placeholder="Name *" required value={emp.name}
                      onChange={e => { const updated = [...poNumbers]; updated[poIndex].employees[empIndex].name = e.target.value; setPoNumbers(updated); }}
                      className="border p-2 rounded text-sm" />
                    <input type="email" placeholder="Email" value={emp.email}
                      onChange={e => { const updated = [...poNumbers]; updated[poIndex].employees[empIndex].email = e.target.value; setPoNumbers(updated); }}
                      className="border p-2 rounded text-sm flex-1" />
                    <input type="date" placeholder="Date of Joining" value={emp.doj}
                      onChange={e => { const updated = [...poNumbers]; updated[poIndex].employees[empIndex].doj = e.target.value; setPoNumbers(updated); }}
                      className="border p-2 rounded text-sm" />
                    <input type="text" placeholder="Location" value={emp.location}
                      onChange={e => { const updated = [...poNumbers]; updated[poIndex].employees[empIndex].location = e.target.value; setPoNumbers(updated); }}
                      className="border p-2 rounded text-sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button type="submit" disabled={loading} className="w-full bg-green-500 text-white px-4 py-2 rounded font-semibold disabled:bg-gray-400">
        {loading ? 'Onboarding...' : 'Onboard Company'}
      </button>
    </form>
  );
}

function InvoiceGeneration({ companies }) {
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedPO, setSelectedPO] = useState('');
  const [poNumbers, setPoNumbers] = useState([]);
  const [month, setMonth] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [timesheets, setTimesheets] = useState([]);
  const [invoiceResult, setInvoiceResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);

  const handleCompanyChange = (e) => {
    const companyId = e.target.value;
    setSelectedCompany(companyId);
    setSelectedPO('');
    setEmployees([]);
    setTimesheets([]);
    if (companyId) {
      fetch(`${API_URL}/companies/${companyId}/po-numbers`).then(r => r.json()).then(setPoNumbers);
    }
  };

  useEffect(() => {
    if (!selectedPO) {
      setEmployees([]);
      setTimesheets([]);
      return;
    }
    fetch(`${API_URL}/po-numbers/${selectedPO}/employees`)
      .then(r => r.json())
      .then(list => {
        setEmployees(Array.isArray(list) ? list : []);
        setTimesheets([]);
      })
      .catch(() => {
        setEmployees([]);
      });
  }, [selectedPO]);

  const generateInvoice = async () => {
    if (!selectedCompany || !selectedPO || !month || timesheets.length === 0) {
      alert('Please fill all fields and upload timesheets');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('company_id', selectedCompany);
    formData.append('po_id', selectedPO);
    formData.append('month', month);
    formData.append('year', year);
    timesheets.forEach(ts => formData.append('files', ts.file));

    try {
      const response = await fetch(`${API_URL}/invoices/generate`, { method: 'POST', body: formData });
      if (response.ok) {
        const data = await response.json();
        setInvoiceResult(data);
        setTimesheets([]);
      } else alert('Error generating invoice');
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded border">
        <h2 className="text-xl font-semibold mb-3">Invoice Details</h2>
        <div className="grid grid-cols-2 gap-3">
          <select value={selectedCompany} onChange={handleCompanyChange} className="border p-2 rounded">
            <option value="">Select Company *</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={selectedPO} onChange={e => setSelectedPO(e.target.value)} disabled={!selectedCompany} className="border p-2 rounded">
            <option value="">Select PO Number *</option>
            {poNumbers.map(po => <option key={po.id} value={po.id}>{po.po_number}</option>)}
          </select>
          <select value={month} onChange={e => setMonth(e.target.value)} className="border p-2 rounded">
            <option value="">Select Month *</option>
            {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(m => (
              <option key={m} value={m}>{new Date(2024, parseInt(m) - 1).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
          <input type="number" value={year} onChange={e => setYear(e.target.value)} className="border p-2 rounded" placeholder="Year" />
        </div>
      </div>

      <div className="bg-white p-4 rounded border">
        <h2 className="text-xl font-semibold mb-3">Upload Timesheets</h2>
        {selectedPO && employees.length > 0 ? (
          <div className="space-y-3">
            {employees.map(emp => {
              const uploaded = timesheets.find(t => t.employeeId === emp.id);
              return (
                <div key={emp.id} className="flex items-center justify-between rounded border-2 border-blue-300 p-3">
                  <div className="text-sm">
                    <div className="font-medium text-blue-700">{emp.name}</div>
                    {emp.email && <div className="text-blue-600">{emp.email}</div>}
                    {uploaded && (
                      <div className="mt-1 inline-flex items-center gap-2">
                        <span className="text-xs bg-blue-50 text-blue-700 border border-blue-300 rounded-full px-2 py-0.5">Uploaded</span>
                        <span className="text-xs text-blue-700">{uploaded.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer">
                      <span className="bg-blue-500 text-white px-3 py-1 rounded inline-block">{uploaded ? 'Replace File' : 'Choose File'}</span>
                      <input type="file" accept=".xlsx,.xls" onChange={e => {
                        const file = e.target.files && e.target.files[0];
                        if (!file) return;
                        setTimesheets(prev => {
                          const others = prev.filter(p => p.employeeId !== emp.id);
                          return [...others, { employeeId: emp.id, name: file.name, file }];
                        });
                        e.target.value = '';
                      }} className="hidden" />
                    </label>
                    {uploaded && (
                      <button type="button" onClick={() => setTimesheets(prev => prev.filter(p => p.employeeId !== emp.id))} className="text-blue-600 hover:bg-blue-50 rounded px-2 py-1">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-blue-700 bg-blue-50 rounded p-4 text-sm">Select a company and PO to load onboarded employees.</div>
        )}

        <button onClick={generateInvoice} disabled={loading} className="w-full mt-3 bg-blue-500 text-white px-4 py-2 rounded font-semibold disabled:bg-gray-400">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin inline mr-2" />Generating...</> : 'Generate Invoice'}
        </button>
      </div>

      {invoiceResult && (
        <div className="bg-white p-4 rounded border">
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-2 rounded mb-3">
            Invoice Generated! #{invoiceResult.invoice_number}
          </div>
          <div className="mb-3">
            <a href={`${API_URL}/invoices/${invoiceResult.invoice_id}/download-docx`} target="_blank" rel="noopener noreferrer" className="inline-block bg-blue-600 text-white px-3 py-2 rounded">
              Download DOCX
            </a>
          </div>
          <h3 className="text-lg font-semibold mb-2">{invoiceResult.company.name}</h3>
          
          {invoiceResult.employees.map((emp, idx) => (
            <div key={idx} className="border-b py-2">
              <div className="font-semibold text-sm">{emp.employee_name}</div>
              <div className="text-xs text-blue-700">
                {emp.total_worked_hours && `Hours: ${emp.total_worked_hours.toFixed(2)} | `}
                {emp.total_worked_days && `Days: ${emp.total_worked_days} | `}
                Amount: {emp.calculation_type === 'hourly' ? '$' : '₹'}{emp.sub_total?.toFixed(2)}
              </div>
            </div>
          ))}

          <div className="bg-blue-100 p-3 rounded mt-3">
            <div className="font-bold">Grand Total: {invoiceResult.company.client_type === 'foreign' ? '$' : '₹'}{invoiceResult.grand_total.sub_total.toFixed(2)}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function InvoiceHistory() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/invoices`).then(r => r.json()).then(setInvoices).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center p-8"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>;

  return (
    <div className="bg-white p-4 rounded border">
      <h2 className="text-xl font-semibold mb-4">Invoice History</h2>
      {invoices.length === 0 ? (
        <p className="text-blue-600 text-center py-8">No invoices yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-blue-100">
              <tr>
                <th className="px-4 py-2 text-left">Invoice #</th>
                <th className="px-4 py-2 text-left">Company</th>
                <th className="px-4 py-2 text-left">PO Number</th>
                <th className="px-4 py-2 text-left">Month/Year</th>
                <th className="px-4 py-2 text-left">Total</th>
                <th className="px-4 py-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} className="border-b hover:bg-blue-50">
                  <td className="px-4 py-2 font-medium text-blue-600">{inv.invoice_number}</td>
                  <td className="px-4 py-2">{inv.company_name}</td>
                  <td className="px-4 py-2">{inv.po_number}</td>
                  <td className="px-4 py-2">{new Date(2024, parseInt(inv.month) - 1).toLocaleString('default', { month: 'short' })} {inv.year}</td>
                  <td className="px-4 py-2 font-semibold text-blue-700">₹{inv.sub_total?.toFixed(2)}</td>
                  <td className="px-4 py-2 text-blue-600">{new Date(inv.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>

  );
}