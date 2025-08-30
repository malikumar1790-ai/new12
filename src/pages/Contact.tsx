import React, { useState, useEffect } from 'react';
import { Send, CheckCircle, AlertCircle, Mail, Zap, Phone, MapPin } from 'lucide-react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { contactService, testDatabaseConnection } from '../lib/supabase';
import SEO from '../components/SEO';

const Contact: React.FC = () => {
  const { language } = useLanguage();
  const [contentVisible, setContentVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    service: '',
    message: ''
  });

  useEffect(() => {
    setContentVisible(false);
    const timer = setTimeout(() => setContentVisible(true), 100);
    return () => clearTimeout(timer);
  }, [language]);

  const contentVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.3 }
    }
  };

  const services = [
    'Custom AI/ML Development',
    'Neural Networks & LLMs',
    'Computer Vision Solutions',
    'Natural Language Processing',
    'Full-Stack AI Integration',
    'Enterprise AI Consulting',
    'Business Process Automation',
    'AI Strategy & Planning',
    'Data Science & Analytics',
    'Cloud AI Deployment',
    'AI Training & Support',
    'Custom AI Solution'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      console.log('📝 Starting contact form submission...');
      
      // Validate required fields
      if (!formData.name || !formData.email || !formData.message) {
        throw new Error('Please fill in all required fields: Name, Email, and Message.');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address.');
      }

      // Validate message length
      if (formData.message.length < 10) {
        throw new Error('Please provide a more detailed message (minimum 10 characters).');
      }

      console.log('✅ Contact form validation passed');
      
      // Check if we're in development or production
      const isDevelopment = import.meta.env.DEV || 
                           window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1';
      
      if (isDevelopment) {
        // Development mode: Show alert and log to console
        console.log('📧 DEVELOPMENT MODE - Form submitted:', {
          name: formData.name,
          email: formData.email,
          company: formData.company,
          service: formData.service,
          message: formData.message
        });
        
        console.log('✅ In production, emails will be sent to:');
        console.log('   → Admin notification: contact@nexariza.com');
        console.log('   → User confirmation:', formData.email);
        
        // Show development alert
        alert(`📧 DEVELOPMENT MODE\n\nForm submitted successfully!\n\nName: ${formData.name}\nEmail: ${formData.email}\nService: ${formData.service}\n\nIn production, this will send emails to both admin and user.`);
        
        setSubmitSuccess(true);
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          company: '',
          service: '',
          message: ''
        });
        
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 5000);
        return;
      }
      
      // Production mode: Test database connection first
      console.log('🔍 Testing database connection...');
      const dbConnected = await testDatabaseConnection();
      if (!dbConnected) {
        console.warn('⚠️ Database connection failed, proceeding with email only');
      }
      
      // Store in database if connected
      if (dbConnected) {
        try {
          const savedSubmission = await contactService.submitContactForm({
            name: formData.name,
            email: formData.email,
            company: formData.company,
            service: formData.service,
            message: formData.message
          });
          console.log('✅ Contact form saved to database:', savedSubmission.id);
        } catch (dbError) {
          console.error('❌ Database storage failed:', dbError);
          console.warn('⚠️ Continuing with email sending despite database error');
        }
      } else {
        console.log('⚠️ Skipping database storage due to connection issues');
      }
      
      // Send emails via API
      console.log('📧 Sending contact form emails...');
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('📧 Contact API Response status:', response.status);
      const result = await response.json();
      console.log('📧 API Response:', result);

      if (response.ok) {
        const successMessage = result.message || 'Message sent successfully! We\'ll get back to you within 24 hours. Please check your email for confirmation.';
        setSubmitSuccess(true);
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          company: '',
          service: '',
          message: ''
        });

        // Hide success message after 8 seconds
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 8000);
      } else {
        const errorMessage = result.message || result.error || 'Failed to send message. Please try again.';
        throw new Error(errorMessage);
      }

    } catch (error) {
      console.error('Error submitting contact form:', error);
      
      let errorMessage = 'An error occurred. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Handle specific error cases
      if (errorMessage.includes('JSON')) {
        errorMessage = 'Server communication error. Your message may have been received. Please check with our team or try again.';
      }
      
      setSubmitError(errorMessage);
      
      // Clear error after 10 seconds
      setTimeout(() => {
        setSubmitError('');
      }, 10000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-16">
      <SEO 
        title="Contact Nexariza AI - Get Free AI Consultation | Custom AI Solutions"
        description="Contact Nexariza AI for custom AI solutions. Get free consultation from Ahmad Yasin and our expert team. Transform your business with AI."
        keywords="contact Nexariza AI, AI consultation, custom AI quote, AI development inquiry, Ahmad Yasin contact, AI project consultation"
      />
      
      <AnimatePresence mode="wait">
        {contentVisible && (
          <motion.div
            key={language}
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative"
          >
            {/* Hero Section */}
            <section className="py-20 bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
              <div className="absolute inset-0">
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: 'url(https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
                <div className="absolute inset-0 bg-black/60" />
              </div>
              
              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-transparent">
                  Get In Touch
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                  Ready to transform your business with AI? Let's discuss your project and create something extraordinary together.
                </p>
              </div>
            </section>

            {/* Contact Form Section */}
            <section className="py-20 bg-black">
              <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl border border-gray-700 p-8">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Mail className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">Start Your AI Journey</h2>
                    <p className="text-gray-300">
                      Fill out the form below and our AI experts will get back to you within 24 hours.
                    </p>
                  </div>

                  {/* Success Message */}
                  <AnimatePresence>
                    {submitSuccess && (
                      <motion.div
                        className="mb-6 p-6 bg-gradient-to-r from-green-900/30 to-green-800/30 border border-green-700/50 rounded-xl"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <h3 className="text-green-300 font-semibold mb-2">Message Sent Successfully! 🎉</h3>
                            <p className="text-green-200 text-sm leading-relaxed">
                              Thank you for contacting Nexariza AI! We've received your message and will respond within 24 hours. 
                              Please check your email for a detailed confirmation with next steps.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Error Message */}
                  <AnimatePresence>
                    {submitError && (
                      <motion.div
                        className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-lg flex items-start space-x-3"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                      >
                        <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-red-300 font-semibold mb-1">Submission Error</h4>
                          <p className="text-red-300 text-sm">{submitError}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Contact Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                          Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                          placeholder="John Doe"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                          placeholder="john@company.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-2">
                          Company
                        </label>
                        <input
                          type="text"
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                          placeholder="Your Company"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="service" className="block text-sm font-medium text-gray-300 mb-2">
                          Service Interest
                        </label>
                        <select
                          id="service"
                          name="service"
                          value={formData.service}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        >
                          <option value="">Select a service</option>
                          {services.map((service) => (
                            <option key={service} value={service}>{service}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        minLength={10}
                        maxLength={2000}
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                        placeholder="Tell us about your project, goals, and how we can help transform your business with AI..."
                      />
                      <div className="mt-1 text-right">
                        <span className={`text-xs ${formData.message.length > 1800 ? 'text-red-400' : 'text-gray-400'}`}>
                          {formData.message.length}/2000 characters
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || !formData.name || !formData.email || !formData.message || formData.message.length < 10}
                      className="w-full flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-500 hover:to-blue-600 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5" />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>

                    <p className="text-center text-gray-400 text-sm">
                      By submitting this form, you agree to receive communications from Nexariza AI. 
                      We respect your privacy and will never share your information.
                    </p>
                  </form>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
                  Let's Build Something Amazing
                </h2>
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  Partner with Nexariza AI to build custom solutions that deliver real business value with lifetime support.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 p-6">
                    <Mail className="h-8 w-8 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Email Us</h3>
                    <a 
                      href="mailto:contact@nexariza.com"
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      contact@nexariza.com
                    </a>
                  </div>
                  
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 p-6">
                    <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Response Time</h3>
                    <p className="text-gray-300">Within 24 hours</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 p-6">
                    <Zap className="h-8 w-8 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Free Consultation</h3>
                    <p className="text-gray-300">No commitment required</p>
                  </div>
                </div>

                {/* Additional Contact Methods */}
                <div className="mt-12 bg-gradient-to-r from-blue-900/30 to-blue-800/30 rounded-2xl border border-blue-700/30 p-8">
                  <h3 className="text-2xl font-bold text-white mb-6">Get Started Today</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <a
                      href="mailto:contact@nexariza.com?subject=Request a Free Consultation&body=Hi Nexariza AI Team,%0D%0A%0D%0AI'm interested in learning more about your AI solutions and would like to schedule a free consultation.%0D%0A%0D%0APlease let me know your availability.%0D%0A%0D%0AThank you!"
                      className="flex items-center justify-center space-x-3 px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all duration-300 transform hover:scale-105"
                    >
                      <Phone className="h-5 w-5" />
                      <span className="font-semibold">Request a Free Consultation →</span>
                    </a>
                    <a
                      href="mailto:contact@nexariza.com?subject=Schedule a Discovery Call&body=Hi Ahmad Yasin and Nexariza AI Team,%0D%0A%0D%0AI would like to schedule a discovery call to discuss my AI project requirements.%0D%0A%0D%0AProject type: [Please specify]%0D%0AIndustry: [Please specify]%0D%0ABudget range: [Please specify]%0D%0A%0D%0APlease let me know your availability for a 30-minute call.%0D%0A%0D%0AThank you!"
                      className="flex items-center justify-center space-x-3 px-6 py-4 border-2 border-blue-500 text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white transition-all duration-300 transform hover:scale-105"
                    >
                      <MapPin className="h-5 w-5" />
                      <span className="font-semibold">Schedule a Discovery Call →</span>
                    </a>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <p className="text-blue-200 text-sm">
                      🌐 <strong>Visit us:</strong> <a href="https://www.nexariza.com" className=\"text-blue-300 hover:text-blue-200 underline">www.nexariza.com</a>
                    </p>
                    <p className="text-blue-200 text-sm mt-2">
                      📧 <strong>Direct email:</strong> <a href="mailto:contact@nexariza.com" className="text-blue-300 hover:text-blue-200 underline">contact@nexariza.com</a>
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Contact;