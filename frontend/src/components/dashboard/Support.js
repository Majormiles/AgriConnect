import React, { useState } from 'react';

const Support = () => {
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: '',
    description: '',
    priority: 'medium'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle ticket submission
    console.log('Support ticket submitted:', ticketForm);
  };

  const faqItems = [
    {
      question: 'How do I list my products on AgriConnect?',
      answer: 'To list your products, go to the Farm Management section in your dashboard. Click on "Add New Crop" and fill in the required information about your product, including name, quantity, and pricing.'
    },
    {
      question: 'How can I track my sales and earnings?',
      answer: 'You can view your sales and earnings in the Analytics section of your Farm Dashboard. This shows detailed information about your transactions, revenue trends, and payment history.'
    },
    {
      question: 'What payment methods are supported?',
      answer: 'AgriConnect supports various payment methods including mobile money (MTN Mobile Money, Vodafone Cash), bank transfers, and cash on delivery for local transactions.'
    },
    {
      question: 'How can I update my farm information?',
      answer: 'You can update your farm information in the Farm Profile section of your dashboard. This includes details about your location, farm size, and farming practices.'
    },
    {
      question: 'How do I contact buyers directly?',
      answer: 'Once a buyer shows interest in your products, you can communicate through our secure messaging system. Access your messages through the Messages section in your dashboard.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Help Center */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Help Center</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <svg className="w-8 h-8 text-green-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900">Documentation</h3>
            <p className="mt-2 text-sm text-gray-600">
              Browse our detailed documentation to learn more about using AgriConnect.
            </p>
            <a href="#" className="mt-3 inline-flex items-center text-sm text-green-600 hover:text-green-700">
              View Documentation
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <svg className="w-8 h-8 text-blue-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900">FAQs</h3>
            <p className="mt-2 text-sm text-gray-600">
              Find answers to commonly asked questions about our platform.
            </p>
            <button className="mt-3 inline-flex items-center text-sm text-blue-600 hover:text-blue-700">
              View FAQs
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <svg className="w-8 h-8 text-purple-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900">Live Chat</h3>
            <p className="mt-2 text-sm text-gray-600">
              Chat with our support team for immediate assistance.
            </p>
            <button className="mt-3 inline-flex items-center text-sm text-purple-600 hover:text-purple-700">
              Start Chat
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Submit Support Ticket */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Submit a Support Ticket</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Subject</label>
            <input
              type="text"
              value={ticketForm.subject}
              onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={ticketForm.category}
              onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              required
            >
              <option value="">Select a category</option>
              <option value="technical">Technical Issue</option>
              <option value="account">Account Management</option>
              <option value="payment">Payment Issue</option>
              <option value="product">Product Listing</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Priority</label>
            <select
              value={ticketForm.priority}
              onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={ticketForm.description}
              onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            >
              Submit Ticket
            </button>
          </div>
        </form>
      </div>

      {/* FAQs */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div key={index} className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">{item.question}</h3>
              <p className="text-gray-600">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Support</h3>
            <p className="text-gray-600">Available Monday to Friday, 8:00 AM - 6:00 PM GMT</p>
            <p className="text-gray-600 mt-2">
              Phone: +233 XX XXX XXXX<br />
              Email: support@agriconnect.com
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Technical Support</h3>
            <p className="text-gray-600">Available 24/7 for urgent technical issues</p>
            <p className="text-gray-600 mt-2">
              Phone: +233 XX XXX XXXX<br />
              Email: tech.support@agriconnect.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support; 