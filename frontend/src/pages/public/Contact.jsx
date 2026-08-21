import React, { useState } from 'react';
import { Mail, Send, CheckCircle2 } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Reset form fields
    setFormData({ name: '', email: '', subject: '', message: '' });
    
    // Clear message after delay
    setTimeout(() => {
      setSubmitted(false);
    }, 4000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans text-left">
      
      {/* Header */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl font-extrabold text-gov-dark tracking-tight flex items-center justify-center md:justify-start space-x-2">
          <Mail size={28} className="text-gov-green" />
          <span>Contact Us</span>
        </h1>
        <p className="mt-2 text-slate-500 text-sm">
          Have queries about scheme criteria, suggestions, or technical support? Drop us a message.
        </p>
      </div>

      {submitted && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center space-x-2 text-sm font-semibold mb-6 animate-pulse">
          <CheckCircle2 size={18} className="text-gov-green" />
          <span>Thank you! Your message has been sent successfully. We will review it shortly.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-premium space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Your Name"
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="E.g. Rajesh Kumar"
              required
            />
            <Input
              label="Email Address"
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="name@example.com"
              required
            />
          </div>

          <Input
            label="Subject"
            id="subject"
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData({...formData, subject: e.target.value})}
            placeholder="Feedback / Feature Inquiry"
            required
          />

          <div className="text-left">
            <label htmlFor="message" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Message
            </label>
            <textarea
              id="message"
              rows="4"
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              placeholder="Write your message here..."
              required
              className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-gov-purple focus:bg-white text-sm transition-all"
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="primary">
              <Send size={14} />
              <span>Send Message</span>
            </Button>
          </div>
        </form>

        {/* Contact information details */}
        <div className="space-y-6 text-xs text-slate-500">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-gov-dark mb-2">Helpdesk Telemetry</h4>
            <p className="leading-relaxed">
              Our support operates Monday to Friday, 9:00 AM to 5:30 PM IST.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-gov-dark">Office Location</h4>
            <p className="leading-relaxed">
              Ministry of Electronics & Information Technology (MeitY)<br />
              New Delhi, India
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
