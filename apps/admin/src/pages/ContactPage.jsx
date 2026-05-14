import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Building2, Mail, Phone, Globe, Factory, Users,
  Send, CheckCircle2, Loader2, MessageSquare, Briefcase,
} from 'lucide-react';

const BASE = '/api/v1';

export default function ContactPage() {
  const navigate = useNavigate();
  const [lang, setLang] = useState('en');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    full_name: '',
    company: '',
    email: '',
    phone: '',
    country: '',
    industry: '',
    num_employees: '',
    num_plants: '',
    interest: 'demo',
    message: '',
  });

  const T = lang === 'es' ? {
    back: 'Volver', title: 'Contactar al Equipo de Ventas',
    subtitle: 'Agenda una demo personalizada y descubre como MAGEAM puede transformar tus operaciones de mantenimiento',
    fullName: 'Nombre Completo', fullNamePh: 'Juan Perez',
    company: 'Empresa', companyPh: 'Mineria ABC',
    email: 'Email Corporativo', emailPh: 'juan.perez@empresa.com',
    phone: 'Telefono', phonePh: '+56 9 1234 5678',
    country: 'Pais', countryPh: 'Chile',
    industry: 'Industria', industryPh: 'Seleccionar...',
    industries: ['Mineria', 'Petroleo y Gas', 'Manufactura', 'Energia', 'Quimica', 'Cemento', 'Alimentos', 'Otro'],
    numEmployees: 'Numero de Empleados', selectEmployees: 'Seleccionar...',
    employeeRanges: ['1-50', '51-200', '201-500', '501-1000', '1000+'],
    numPlants: 'Numero de Plantas', selectPlants: 'Seleccionar...',
    plantRanges: ['1', '2-5', '6-10', '11-20', '20+'],
    interest: 'Interes Principal',
    interests: { demo: 'Agendar una demo', pricing: 'Solicitar cotizacion', partnership: 'Oportunidad de partnership', other: 'Otro' },
    message: 'Mensaje (opcional)', messagePh: 'Cuentanos mas sobre tus necesidades...',
    submit: 'Enviar Solicitud', submitting: 'Enviando...',
    success: 'Solicitud Enviada', successMsg: 'Gracias por tu interes. Nuestro equipo de ventas se pondra en contacto contigo dentro de 24 horas habiles.',
    backHome: 'Volver al Inicio',
    required: 'Campos obligatorios',
    error: 'Error al enviar. Intenta de nuevo.',
  } : {
    back: 'Back', title: 'Contact Sales',
    subtitle: 'Schedule a personalized demo and discover how MAGEAM can transform your maintenance operations',
    fullName: 'Full Name', fullNamePh: 'John Smith',
    company: 'Company', companyPh: 'Mining Corp',
    email: 'Business Email', emailPh: 'john.smith@company.com',
    phone: 'Phone', phonePh: '+1 555 123 4567',
    country: 'Country', countryPh: 'United States',
    industry: 'Industry', industryPh: 'Select...',
    industries: ['Mining', 'Oil & Gas', 'Manufacturing', 'Energy', 'Chemical', 'Cement', 'Food & Beverage', 'Other'],
    numEmployees: 'Number of Employees', selectEmployees: 'Select...',
    employeeRanges: ['1-50', '51-200', '201-500', '501-1000', '1000+'],
    numPlants: 'Number of Plants', selectPlants: 'Select...',
    plantRanges: ['1', '2-5', '6-10', '11-20', '20+'],
    interest: 'Primary Interest',
    interests: { demo: 'Schedule a demo', pricing: 'Request pricing', partnership: 'Partnership opportunity', other: 'Other' },
    message: 'Message (optional)', messagePh: 'Tell us more about your needs...',
    submit: 'Submit Request', submitting: 'Submitting...',
    success: 'Request Submitted', successMsg: 'Thank you for your interest. Our sales team will contact you within 24 business hours.',
    backHome: 'Back to Home',
    required: 'Required fields',
    error: 'Submission failed. Please try again.',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.company || !form.email) {
      setError(T.required);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BASE}/sales/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed');
      setSubmitted(true);
    } catch (err) {
      setError(T.error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-10 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">
            <CheckCircle2 className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{T.success}</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">{T.successMsg}</p>
          <button onClick={() => navigate('/')}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-sm">
            {T.backHome}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4" /> {T.back}
          </button>
          <div className="flex items-center">
            <img src="/MAGEAM_LOGO.png" alt="MagEAM" className="h-24 w-auto" />
          </div>
          <button onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-100">
            <Globe className="w-3.5 h-3.5" /> {lang === 'en' ? 'ES' : 'EN'}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5 text-xs text-emerald-700 font-semibold mb-5">
            <Briefcase className="w-3.5 h-3.5" /> Enterprise Sales
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">{T.title}</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">{T.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Info sidebar */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
                <Mail className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Email</p>
              <a href="mailto:jose.cortinat@valuestrategyconsulting.com" className="text-sm font-medium text-gray-900 hover:text-emerald-600 break-all">jose.cortinat@valuestrategyconsulting.com</a>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Response Time</p>
              <p className="text-sm font-medium text-gray-900">&lt; 24 hours</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mb-3">
                <Building2 className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Company</p>
              <p className="text-sm font-medium text-gray-900">Value Strategy Consulting</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="md:col-span-2 bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Name + Email */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{T.fullName} *</label>
                <input type="text" required value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})}
                  placeholder={T.fullNamePh}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{T.email} *</label>
                <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  placeholder={T.emailPh}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500" />
              </div>
            </div>

            {/* Company + Phone */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{T.company} *</label>
                <input type="text" required value={form.company} onChange={e => setForm({...form, company: e.target.value})}
                  placeholder={T.companyPh}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{T.phone}</label>
                <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                  placeholder={T.phonePh}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500" />
              </div>
            </div>

            {/* Country + Industry */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{T.country}</label>
                <input type="text" value={form.country} onChange={e => setForm({...form, country: e.target.value})}
                  placeholder={T.countryPh}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{T.industry}</label>
                <select value={form.industry} onChange={e => setForm({...form, industry: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white">
                  <option value="">{T.industryPh}</option>
                  {T.industries.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            </div>

            {/* Employees + Plants */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{T.numEmployees}</label>
                <select value={form.num_employees} onChange={e => setForm({...form, num_employees: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white">
                  <option value="">{T.selectEmployees}</option>
                  {T.employeeRanges.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{T.numPlants}</label>
                <select value={form.num_plants} onChange={e => setForm({...form, num_plants: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white">
                  <option value="">{T.selectPlants}</option>
                  {T.plantRanges.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            {/* Interest */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{T.interest}</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(T.interests).map(([key, label]) => (
                  <button key={key} type="button" onClick={() => setForm({...form, interest: key})}
                    className={`text-sm px-4 py-2.5 rounded-xl border font-medium transition-all ${form.interest === key ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{T.message}</label>
              <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                placeholder={T.messagePh} rows={4}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none" />
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white px-6 py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> {T.submitting}</> : <><Send className="w-5 h-5" /> {T.submit}</>}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-10">
          MagEAM v2.0 &mdash; Value Strategy Consulting
        </p>
      </div>
    </div>
  );
}
