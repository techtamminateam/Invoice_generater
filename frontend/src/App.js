import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Plus, X, Loader2 } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export default function TimesheetApp() {
  const [activeTab, setActiveTab] = useState('onboard');
  const [enabled, setEnabled] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [companyQuery, setCompanyQuery] = useState('');
  const [companiesView, setCompaniesView] = useState('table'); // 'cards' | 'table'
  const [companyFiltersOpen, setCompanyFiltersOpen] = useState(false);
  const [companyFilters, setCompanyFilters] = useState({
    name: [],
    email: [],
    contact_number: [],
    client_type: [],
    status: [], // 'Active' | 'Not Active'
    po_count: []
  });

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
    <div className="p-8">
      <div className="flex items-center justify-center gap-3 mb-6">
        <img src="https://media.licdn.com/dms/image/v2/C510BAQGfT3LTL31mMg/company-logo_200_200/company-logo_200_200/0/1631372092417?e=2147483647&v=beta&t=3m8Def2_mkhEUXHKP7CgWJrEgRRrRpslkLBFCVxzCNg" alt="Tech Tammina" className="w-20 h-20" />
        <h1 className="text-3xl font-bold text-blue-700">Invoice Management System</h1>
      </div>

      <div className="flex gap-2 mb-6 border-b border-blue-200 pb-2">
        {['onboard', 'invoice', 'history', 'companies'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-2 rounded-t-md transition-colors ${activeTab === tab ? 'bg-blue-600 text-white shadow-sm' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Companies List</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setCompanyFiltersOpen(v => !v)}
                  className="px-3 py-1.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-sm"
                >
                  Filters
                </button>
                {companyFiltersOpen && (
                  <CompanyFiltersPanel
                    companies={companies}
                    filters={companyFilters}
                    setFilters={setCompanyFilters}
                    onClose={() => setCompanyFiltersOpen(false)}
                  />
                )}
              </div>
              <input
                value={companyQuery}
                onChange={e => setCompanyQuery(e.target.value)}
                className="border border-blue-300 rounded px-3 py-1.5 text-sm w-64"
                placeholder="Search companies by name or email"
              />
            </div>
          </div>
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
          {!loading && (companies && companies.length > 0 ? (
            companiesView === 'cards' ? (
              <CompaniesCards
                companies={companies}
                setCompanies={setCompanies}
                companyQuery={companyQuery}
                companyFilters={companyFilters}
                handleDeleteCompany={handleDeleteCompany}
              />
            ) : (
            <div className="overflow-x-auto rounded-lg border border-blue-200">
              <table className="min-w-full text-sm">
                <thead className="bg-blue-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-2 text-left w-56">Name</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Contact</th>
                    <th className="px-4 py-2 text-left w-32">Type</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">PO Count</th>
                    <th className="px-4 py-2 text-left w-28">Actions</th>
                  </tr>
                </thead>
                <tbody className="[&>tr:nth-child(even)]:bg-blue-50/40">
                  {companies
                    .filter(c => {
                      if (!companyQuery) return true;
                      const q = companyQuery.toLowerCase();
                      return c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q);
                    })
                    .filter(c => {
                      // Multi-select filters
                      const f = companyFilters;
                      const asLabel = (c.is_active ? 'Active' : 'Not Active');
                      const matchesName = !f.name.length || f.name.includes(c.name || '');
                      const matchesEmail = !f.email.length || f.email.includes(c.email || '');
                      const matchesContact = !f.contact_number.length || f.contact_number.includes(c.contact_number || '');
                      const matchesType = !f.client_type.length || f.client_type.includes((c.client_type || '').replace('_', ' '));
                      const matchesStatus = !f.status.length || f.status.includes(asLabel);
                      const poCountLabel = String(c.po_count ?? (c.po_numbers?.length || 0));
                      const matchesPOCount = !f.po_count.length || f.po_count.includes(poCountLabel);
                      return matchesName && matchesEmail && matchesContact && matchesType && matchesStatus && matchesPOCount;
                    })
                    .map(company => (
                    <tr key={company.id} className="border-b hover:bg-blue-50">
                      <td className="px-4 py-2 font-medium text-blue-700">{company.name}</td>
                      <td className="px-4 py-2">{company.email}</td>
                      <td className="px-4 py-2">{company.contact_number}</td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          {company.client_type?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${company.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                          {company.is_active ? 'Active' : 'Active'}
                        </span>
                      </td>
                      <td className="px-4 py-2">{company.po_count ?? (company.po_numbers?.length || 0)}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={async () => {
                              try {
                                const res = await fetch(`${API_URL}/companies/${company.id}/status`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ is_active: !company.is_active })
                                });
                                if (!res.ok) {
                                  const e = await res.json().catch(() => ({}));
                                  throw new Error(e.error || 'Failed to update status');
                                }
                                const updated = await res.json();
                                setCompanies(prev => prev.map(c => c.id === company.id ? { ...c, is_active: updated.is_active } : c));
                              } catch (e) {
                                alert(e.message);
                              }
                            }}
                            className={`${company.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'} px-3 py-1 rounded text-xs font-semibold`}
                            disabled={loading}
                          >
                            {company.is_active ? 'Active' : 'Not Active'}
                          </button>
                          <button
                            onClick={() => handleDeleteCompany(company.id, company.name)}
                            className="text-blue-600 hover:text-blue-700 p-2 rounded hover:bg-blue-50 transition-colors"
                            disabled={loading}
                            title="Delete company"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )
          ) : (
            <div className="text-center p-8 bg-blue-50 rounded">
              <p className="text-blue-700">No companies found. Add a company using the Company Onboarding tab.</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CompanyOnboarding() {
  const [formData, setFormData] = useState({
    name: '', contact_number: '', email: '', building_no: '', local_street:'', city:'', state:'', country:'',pin_code: '', GST: '',SAC: '', client_type: 'same_state', document: null
  });
  const [poNumbers, setPoNumbers] = useState([
    { po_number: '', monthly_budget: '', hourly_rate: '', igst: 18, cgst: 9, sgst: 9, employees: [{ name: '', email: '', doj: '', location: '' }] }
  ]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const resetForm = () => {
    setFormData({ name: '', contact_number: '', building_no: '', local_street:'', city:'', state:'', country:'',pin_code: '', GST:'',SAC: '', email: '', client_type: 'same_state', document: null });
    setPoNumbers([{ po_number: '', monthly_budget: '', hourly_rate: '', igst: 18, cgst: 9, sgst: 9, employees: [{ name: '', email: '', doj: '', location: '' }] }]);
    setSuccess(false);
  };

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
        setFormData({ name: '', contact_number: '', building_no: '', local_street:'', city:'', state:'', country:'',pin_code: '', GST:'',SAC: '', email: '', client_type: 'same_state', document: null });
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Pin Code *</label>
            <input type="text" placeholder="Pin code" required value={formData.pin_code}
              onChange={e => setFormData({...formData, pin_code: e.target.value})} className="border p-2 rounded w-full" />
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
              <option value="same_state">Same State (CGST+SGST)</option>
              <option value="other_state">Other State (IGST)</option>
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

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={resetForm}
          disabled={loading}
          className="px-4 py-2 rounded font-semibold bg-red-500 text-white disabled:bg-gray-400"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded font-semibold bg-green-500 text-white disabled:bg-gray-400"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
      {success && (
        <div className="mt-3 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded">
          Company onboarded successfully!
        </div>
      )}
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
  const [editing, setEditing] = useState({}); // { [id]: paid_amount }
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    company_name: '',
    po_number: '',
    month: '',
    year: '',
    client_type: ''
  });

  useEffect(() => {
    fetch(`${API_URL}/invoices`).then(r => r.json()).then(setInvoices).catch(console.error).finally(() => setLoading(false));
  }, []);

  const startEdit = (inv) => {
    setEditing(prev => ({ ...prev, [inv.id]: inv.paid_amount ?? 0 }));
  };

  const cancelEdit = (id) => {
    setEditing(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const savePaid = async (id) => {
    const value = editing[id];
    try {
      const res = await fetch(`${API_URL}/invoices/${id}/payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paid_amount: value })
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || 'Failed to update payment');
      }
      const updated = await res.json();
      setInvoices(prev => prev.map(inv => inv.id === id ? {
        ...inv,
        paid_amount: updated.paid_amount,
        due_amount: updated.due_amount
      } : inv));
      cancelEdit(id);
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) return <div className="text-center p-8"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>;

  // Get unique values for dropdowns
  const unique = (arr) => Array.from(new Set(arr.filter(Boolean))).sort();
  const companyNames = unique(invoices.map(i => i.company_name));
  const poNumbers = unique(invoices.map(i => i.po_number));
  const months = unique(invoices.map(i => new Date(2024, parseInt(i.month) - 1).toLocaleString('default', { month: 'short' })));
  const years = unique(invoices.map(i => String(i.year)));
  const clientTypes = unique(invoices.map(i => (i.client_type || '').replace('_', ' ')));

  // Build filtered list once for totals and table rendering
  const filteredInvoices = invoices
    .filter(inv => {
      if (!query) return true;
      const q = query.toLowerCase();
      return inv.invoice_number?.toLowerCase().includes(q) || inv.company_name?.toLowerCase().includes(q);
    })
    .filter(inv => {
      const mLabel = new Date(2024, parseInt(inv.month) - 1).toLocaleString('default', { month: 'short' });
      const f = filters;
      const matchesCompany = !f.company_name || f.company_name === inv.company_name;
      const matchesPO = !f.po_number || f.po_number === inv.po_number;
      const matchesMonth = !f.month || f.month === mLabel;
      const matchesYear = !f.year || f.year === String(inv.year || '');
      const matchesClientType = !f.client_type || f.client_type === (inv.client_type || '').replace('_', ' ');
      return matchesCompany && matchesPO && matchesMonth && matchesYear && matchesClientType;
    });

  const grandTotal = filteredInvoices.reduce((sum, inv) => {
    const due = inv.due_amount != null
      ? Number(inv.due_amount)
      : Math.max(Number(inv.sub_total ?? 0) - Number(inv.paid_amount ?? 0), 0);
    return sum + due;
  }, 0);

  return (
    <div className="bg-white p-4 rounded border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Invoice History</h2>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="border border-blue-300 rounded px-3 py-1.5 text-sm w-64"
          placeholder="Search by invoice # or client name"
        />
      </div>
      <div className="flex items-center justify-end mb-3">
        <div className="px-3 py-1.5 rounded bg-blue-50 border border-blue-200 text-blue-700 text-sm">
          Grand Total Due (filtered): <span className="font-semibold">₹{grandTotal.toFixed(2)}</span>
        </div>
      </div>
      {invoices.length === 0 ? (
        <p className="text-blue-600 text-center py-8">No invoices yet</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-blue-200">
          <table className="min-w-full text-sm">
            <thead className="bg-blue-100 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2 text-left">Invoice #</th>
                <th className="px-4 py-2 text-left">
                  <div className="flex flex-col gap-1">
                    <span>Client name</span>
                    <select
                      value={filters.company_name}
                      onChange={e => setFilters(prev => ({ ...prev, company_name: e.target.value }))}
                      className="text-xs border border-blue-300 rounded px-2 py-1 bg-white"
                    >
                      <option value="">All</option>
                      {companyNames.map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </div>
                </th>
                <th className="px-4 py-2 text-left">
                  <div className="flex flex-col gap-1">
                    <span>Client type</span>
                    <select
                      value={filters.client_type}
                      onChange={e => setFilters(prev => ({ ...prev, client_type: e.target.value }))}
                      className="text-xs border border-blue-300 rounded px-2 py-1 bg-white"
                    >
                      <option value="">All</option>
                      {clientTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </th>
                <th className="px-4 py-2 text-left">
                  <div className="flex flex-col gap-1">
                    <span>PO Number</span>
                    <select
                      value={filters.po_number}
                      onChange={e => setFilters(prev => ({ ...prev, po_number: e.target.value }))}
                      className="text-xs border border-blue-300 rounded px-2 py-1 bg-white"
                    >
                      <option value="">All</option>
                      {poNumbers.map(po => (
                        <option key={po} value={po}>{po}</option>
                      ))}
                    </select>
                  </div>
                </th>
                <th className="px-4 py-2 text-left">
                  <div className="flex flex-col gap-1">
                    <span>Month</span>
                    <select
                      value={filters.month}
                      onChange={e => setFilters(prev => ({ ...prev, month: e.target.value }))}
                      className="text-xs border border-blue-300 rounded px-2 py-1 bg-white"
                    >
                      <option value="">All</option>
                      {months.map(month => (
                        <option key={month} value={month}>{month}</option>
                      ))}
                    </select>
                  </div>
                </th>
                <th className="px-4 py-2 text-left">
                  <div className="flex flex-col gap-1">
                    <span>Year</span>
                    <select
                      value={filters.year}
                      onChange={e => setFilters(prev => ({ ...prev, year: e.target.value }))}
                      className="text-xs border border-blue-300 rounded px-2 py-1 bg-white"
                    >
                      <option value="">All</option>
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </th>
                <th className="px-4 py-2 text-left">Invoice total (₹)</th>
                <th className="px-4 py-2 text-left">Invoice date</th>
                <th className="px-4 py-2 text-left">Paid amount</th>
                <th className="px-4 py-2 text-left">Due amount</th>
              </tr>
            </thead>
            <tbody className="[&>tr:nth-child(even)]:bg-blue-50/40">
              {filteredInvoices
                .map(inv => (
                <tr key={inv.id} className="border-b hover:bg-blue-50">
                  <td className="px-4 py-2 font-medium text-blue-600">{inv.invoice_number}</td>
                  <td className="px-4 py-2">{inv.company_name}</td>
                  <td className="px-4 py-2">{inv.client_type?.replace('_', ' ')}</td>
                  <td className="px-4 py-2">{inv.po_number}</td>
                  <td className="px-4 py-2">{new Date(2024, parseInt(inv.month) - 1).toLocaleString('default', { month: 'short' })}</td>
                  <td className="px-4 py-2">{inv.year}</td>
                  <td className="px-4 py-2 font-semibold text-blue-700">₹{Number(inv.sub_total_in_inr ?? (inv.client_type === 'foreign' ? (Number(inv.sub_total ?? 0) * 85) : Number(inv.sub_total ?? 0))).toFixed(2)}</td>
                  <td className="px-4 py-2 text-blue-600">{new Date(inv.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-2">
                    {editing[inv.id] !== undefined ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.01"
                          className="border border-blue-300 p-1 rounded w-28"
                          value={editing[inv.id]}
                          onChange={e => setEditing(prev => ({ ...prev, [inv.id]: e.target.value }))}
                        />
                        <button onClick={() => savePaid(inv.id)} className="text-green-700 px-2 py-1 rounded bg-green-100 border border-green-200">Save</button>
                        <button onClick={() => cancelEdit(inv.id)} className="text-blue-700 px-2 py-1 rounded bg-blue-100 border border-blue-200">Cancel</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>₹{Number(inv.paid_amount ?? 0).toFixed(2)}</span>
                        <button onClick={() => startEdit(inv)} className="text-blue-700 px-2 py-1 rounded bg-blue-100 border border-blue-200">Edit</button>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2 font-semibold">₹{Number(inv.due_amount ?? Math.max((inv.sub_total ?? 0) - (inv.paid_amount ?? 0), 0)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CompaniesCards({ companies, setCompanies, companyQuery, companyFilters, handleDeleteCompany }) {
  const filtered = companies
    .filter(c => {
      if (!companyQuery) return true;
      const q = companyQuery.toLowerCase();
      return c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q);
    })
    .filter(c => {
      const f = companyFilters;
      const asLabel = (c.is_active ? 'Active' : 'Not Active');
      const matchesName = !f.name.length || f.name.includes(c.name || '');
      const matchesEmail = !f.email.length || f.email.includes(c.email || '');
      const matchesContact = !f.contact_number.length || f.contact_number.includes(c.contact_number || '');
      const matchesType = !f.client_type.length || f.client_type.includes((c.client_type || '').replace('_', ' '));
      const matchesStatus = !f.status.length || f.status.includes(asLabel);
      const poCountLabel = String(c.po_count ?? (c.po_numbers?.length || 0));
      const matchesPOCount = !f.po_count.length || f.po_count.includes(poCountLabel);
      return matchesName && matchesEmail && matchesContact && matchesType && matchesStatus && matchesPOCount;
    });

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map(company => (
        <div key={company.id} className="rounded-lg border border-blue-200 bg-white p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-lg font-semibold text-blue-700">{company.name}</div>
              <div className="mt-1 inline-flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  {(company.client_type || '').replace('_', ' ')}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${company.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                  {company.is_active ? 'Active' : 'Not Active'}
                </span>
              </div>
            </div>
            <button
              onClick={() => handleDeleteCompany(company.id, company.name)}
              className="text-blue-600 hover:text-blue-700 p-2 rounded hover:bg-blue-50 transition-colors"
              title="Delete company"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-3 text-sm text-blue-700">
            <div className="truncate">{company.email}</div>
            <div className="truncate">{company.contact_number}</div>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <div className="text-blue-700">POs: <span className="font-semibold">{company.po_count ?? (company.po_numbers?.length || 0)}</span></div>
            <button
              onClick={async () => {
                try {
                  const res = await fetch(`${API_URL}/companies/${company.id}/status`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ is_active: !company.is_active })
                  });
                  if (!res.ok) {
                    const e = await res.json().catch(() => ({}));
                    throw new Error(e.error || 'Failed to update status');
                  }
                  const updated = await res.json();
                  setCompanies(prev => prev.map(c => c.id === company.id ? { ...c, is_active: updated.is_active } : c));
                } catch (e) {
                  alert(e.message);
                }
              }}
              className={`${company.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'} px-3 py-1 rounded text-xs font-semibold`}
            >
              {company.is_active ? 'Active' : 'Not Active'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function CompanyFiltersPanel({ companies, filters, setFilters, onClose }) {
  const unique = (arr) => Array.from(new Set(arr.filter(Boolean)));
  const names = unique(companies.map(c => c.name));
  const emails = unique(companies.map(c => c.email));
  const contacts = unique(companies.map(c => c.contact_number));
  const types = unique(companies.map(c => (c.client_type || '').replace('_', ' ')));
  const statuses = ['Active', 'Not Active'];
  const poCounts = unique(companies.map(c => String(c.po_count ?? (c.po_numbers?.length || 0))));

  const toggle = (key, val) => {
    setFilters(prev => {
      const cur = new Set(prev[key] || []);
      if (cur.has(val)) cur.delete(val); else cur.add(val);
      return { ...prev, [key]: Array.from(cur) };
    });
  };

  const reset = () => setFilters({ name: [], email: [], contact_number: [], client_type: [], status: [], po_count: [] });

  return (
    <div className="absolute right-0 mt-2 w-[680px] max-w-[90vw] rounded-lg border border-blue-200 bg-white shadow-lg z-20">
      <div className="flex items-center justify-between p-3 border-b border-blue-100">
        <div className="font-semibold text-blue-700">Filters</div>
        <div className="flex items-center gap-2">
          <button onClick={reset} className="text-blue-700 text-sm px-2 py-1 rounded bg-blue-50 border border-blue-200">Reset</button>
          <button onClick={onClose} className="text-blue-700 text-sm px-2 py-1 rounded bg-blue-50 border border-blue-200">Close</button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 p-3 max-h-80 overflow-auto">
        <FilterGroup title="Name" values={names} selected={filters.name} onToggle={v => toggle('name', v)} />
        <FilterGroup title="Email" values={emails} selected={filters.email} onToggle={v => toggle('email', v)} />
        <FilterGroup title="Contact" values={contacts} selected={filters.contact_number} onToggle={v => toggle('contact_number', v)} />
        <FilterGroup title="Type" values={types} selected={filters.client_type} onToggle={v => toggle('client_type', v)} />
        <FilterGroup title="Status" values={statuses} selected={filters.status} onToggle={v => toggle('status', v)} />
        <FilterGroup title="PO Count" values={poCounts} selected={filters.po_count} onToggle={v => toggle('po_count', v)} />
      </div>
    </div>
  );
}

function InvoicesCards({ invoices, editing, setEditing, savePaid, query, filters }) {
  const filtered = invoices
    .filter(inv => {
      if (!query) return true;
      const q = query.toLowerCase();
      return inv.invoice_number?.toLowerCase().includes(q) || inv.company_name?.toLowerCase().includes(q);
    })
    .filter(inv => {
      const mLabel = new Date(2024, parseInt(inv.month) - 1).toLocaleString('default', { month: 'short' });
      const f = filters;
      const matchesCompany = !f.company_name.length || f.company_name.includes(inv.company_name || '');
      const matchesPO = !f.po_number.length || f.po_number.includes(inv.po_number || '');
      const matchesMonth = !f.month.length || f.month.includes(mLabel);
      const matchesYear = !f.year.length || f.year.includes(String(inv.year || ''));
      return matchesCompany && matchesPO && matchesMonth && matchesYear;
    });

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map(inv => {
        const isEditing = editing[inv.id] !== undefined;
        const totalInInr = Number(inv.sub_total_in_inr ?? (inv.client_type === 'foreign' ? (Number(inv.sub_total ?? 0) * 85) : Number(inv.sub_total ?? 0)));
        return (
          <div key={inv.id} className="rounded-lg border border-blue-200 bg-white p-4">
            <div className="flex items-start justify-between">
              <div className="text-blue-700 font-semibold">#{inv.invoice_number}</div>
              <div className="text-xs text-blue-700">{new Date(inv.created_at).toLocaleDateString()}</div>
            </div>
            <div className="mt-2 text-sm text-blue-700">
              <div className="font-medium">{inv.company_name}</div>
              <div>PO: {inv.po_number}</div>
              <div>
                {new Date(2024, parseInt(inv.month) - 1).toLocaleString('default', { month: 'short' })} {inv.year}
              </div>
            </div>
            <div className="mt-3 text-sm">
              <div className="text-blue-700">Total: <span className="font-semibold">₹{totalInInr.toFixed(2)}</span></div>
              <div className="text-blue-700">Due: <span className="font-semibold">₹{Number(inv.due_amount ?? Math.max((inv.sub_total ?? 0) - (inv.paid_amount ?? 0), 0)).toFixed(2)}</span></div>
            </div>
            <div className="mt-3">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    className="border border-blue-300 p-1 rounded w-28 text-sm"
                    value={editing[inv.id]}
                    onChange={e => setEditing(prev => ({ ...prev, [inv.id]: e.target.value }))}
                  />
                  <button onClick={() => savePaid(inv.id)} className="text-green-700 px-2 py-1 rounded bg-green-100 border border-green-200 text-xs">Save</button>
                  <button onClick={() => { const cp = { ...editing }; delete cp[inv.id]; setEditing(cp); }} className="text-blue-700 px-2 py-1 rounded bg-blue-100 border border-blue-200 text-xs">Cancel</button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <span>Paid: ₹{Number(inv.paid_amount ?? 0).toFixed(2)}</span>
                  <button onClick={() => setEditing(prev => ({ ...prev, [inv.id]: inv.paid_amount ?? 0 }))} className="text-blue-700 px-2 py-1 rounded bg-blue-100 border border-blue-200 text-xs">Edit</button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function InvoiceFiltersPanel({ invoices, filters, setFilters, onClose }) {
  const unique = (arr) => Array.from(new Set(arr.filter(Boolean)));
  const companyNames = unique(invoices.map(i => i.company_name));
  const poNumbers = unique(invoices.map(i => i.po_number));
  const months = unique(invoices.map(i => new Date(2024, parseInt(i.month) - 1).toLocaleString('default', { month: 'short' })));
  const years = unique(invoices.map(i => String(i.year)));

  const toggle = (key, val) => {
    setFilters(prev => {
      const cur = new Set(prev[key] || []);
      if (cur.has(val)) cur.delete(val); else cur.add(val);
      return { ...prev, [key]: Array.from(cur) };
    });
  };

  const reset = () => setFilters({ company_name: [], po_number: [], month: [], year: [] });

  return (
    <div className="absolute right-0 mt-2 w-[680px] max-w-[90vw] rounded-lg border border-blue-200 bg-white shadow-lg z-20">
      <div className="flex items-center justify-between p-3 border-b border-blue-100">
        <div className="font-semibold text-blue-700">Filters</div>
        <div className="flex items-center gap-2">
          <button onClick={reset} className="text-blue-700 text-sm px-2 py-1 rounded bg-blue-50 border border-blue-200">Reset</button>
          <button onClick={onClose} className="text-blue-700 text-sm px-2 py-1 rounded bg-blue-50 border border-blue-200">Close</button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 p-3 max-h-80 overflow-auto">
        <FilterGroup title="Client name" values={companyNames} selected={filters.company_name} onToggle={v => toggle('company_name', v)} />
        <FilterGroup title="PO Number" values={poNumbers} selected={filters.po_number} onToggle={v => toggle('po_number', v)} />
        <FilterGroup title="Month" values={months} selected={filters.month} onToggle={v => toggle('month', v)} />
        <FilterGroup title="Year" values={years} selected={filters.year} onToggle={v => toggle('year', v)} />
      </div>
    </div>
  );
}

function FilterGroup({ title, values, selected, onToggle }) {
  return (
    <div>
      <div className="text-sm font-semibold text-blue-700 mb-2">{title}</div>
      <div className="flex flex-col gap-1 max-h-40 overflow-auto pr-1">
        {values.length === 0 ? (
          <div className="text-xs text-blue-600">No options</div>
        ) : values.map(v => (
          <label key={v} className="inline-flex items-center gap-2 text-sm text-blue-700">
            <input type="checkbox" checked={selected?.includes(v)} onChange={() => onToggle(v)} />
            <span className="truncate max-w-[260px]" title={v}>{v}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
