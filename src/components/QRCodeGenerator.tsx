import { useState, useEffect, useRef } from 'react';
import { QrCode, Link, MessageSquare, User, Wifi, Download, Copy, Check } from 'lucide-react';

const INPUT_CLASSES = "w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200";

const FormField = ({ label, ...inputProps }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <input {...inputProps} className={INPUT_CLASSES} />
  </div>
);

const TAB_TITLES: Record<string, string> = {
  url: 'Enter URL',
  text: 'Enter Text',
  contact: 'Contact Information',
  wifi: 'WiFi Network'
};

const QRCodeGenerator = () => {
  const [activeTab, setActiveTab] = useState('url');
  const [qrData, setQrData] = useState('');
  const [copied, setCopied] = useState(false);
  const qrContainerRef = useRef<HTMLDivElement>(null);

  // Form states for different types
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [contactInfo, setContactInfo] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    organization: '',
    url: ''
  });
  const [wifiInfo, setWifiInfo] = useState({
    ssid: '',
    password: '',
    securityType: 'WPA'
  });

  // QR Code generation using QRious library via CDN
  const generateQRCode = async (text: string) => {
    if (!text.trim()) {
      if (qrContainerRef.current) {
        qrContainerRef.current.innerHTML = '';
      }
      return;
    }

    try {
      // Load QRious library dynamically
      if (!window.QRious) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js';
        script.onload = () => {
          createQR(text);
        };
        document.head.appendChild(script);
      } else {
        createQR(text);
      }
    } catch (error) {
      console.error('Error loading QR library:', error);
      // Fallback to Google Charts API
      generateFallbackQR(text);
    }
  };

  const createQR = (text: string) => {
    if (!qrContainerRef.current) return;

    try {
      // Clear previous QR code
      qrContainerRef.current.innerHTML = '';

      // Create canvas element
      const canvas = document.createElement('canvas');
      qrContainerRef.current.appendChild(canvas);

      // Generate QR code
      new window.QRious!({
        element: canvas,
        value: text,
        size: 300,
        background: 'white',
        foreground: 'black',
        level: 'M'
      });

      // Style the canvas
      canvas.className = 'w-full h-auto rounded-xl shadow-lg bg-white';
      canvas.style.maxWidth = '300px';
      canvas.style.height = 'auto';

    } catch (error) {
      console.error('Error creating QR code:', error);
      generateFallbackQR(text);
    }
  };

  const generateFallbackQR = (text: string) => {
    if (!qrContainerRef.current) return;

    // Clear previous content
    qrContainerRef.current.innerHTML = '';

    // Create img element for fallback
    const img = document.createElement('img');
    const encodedData = encodeURIComponent(text);
    img.src = `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodedData}&choe=UTF-8`;
    img.alt = 'Generated QR Code';
    img.className = 'w-full h-auto rounded-xl shadow-lg bg-white p-4';
    img.style.maxWidth = '300px';
    img.style.height = 'auto';

    // Add error handling for the fallback image
    img.onerror = () => {
      // If Google Charts also fails, try QR Server API
      img.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedData}&format=png&margin=10`;
    };

    qrContainerRef.current.appendChild(img);
  };

  const formatUrl = (url: string) => {
    if (!url.trim()) return '';

    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'https://' + url;
    }
    return url;
  };

  const generateVCard = (contact: typeof contactInfo) => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${contact.firstName} ${contact.lastName}
N:${contact.lastName};${contact.firstName};;;
ORG:${contact.organization}
TEL:${contact.phone}
EMAIL:${contact.email}
URL:${contact.url}
END:VCARD`;
    return vcard;
  };

  const generateWiFiString = (wifi: typeof wifiInfo) => {
    // Escape special characters in SSID and password
    const escapeWiFiString = (str: string) => {
      return str.replace(/\\/g, '\\\\')
                .replace(/;/g, '\\;')
                .replace(/:/g, '\\:')
                .replace(/,/g, '\\,')
                .replace(/"/g, '\\"');
    };

    const ssid = escapeWiFiString(wifi.ssid);
    const password = wifi.securityType === 'nopass' ? '' : escapeWiFiString(wifi.password);
    const security = wifi.securityType;

    return `WIFI:T:${security};S:${ssid};P:${password};;`;
  };

  useEffect(() => {
    let data = '';

    switch (activeTab) {
      case 'url':
        data = formatUrl(urlInput);
        break;
      case 'text':
        data = textInput;
        break;
      case 'contact':
        if (contactInfo.firstName || contactInfo.lastName || contactInfo.phone || contactInfo.email) {
          data = generateVCard(contactInfo);
        }
        break;
      case 'wifi':
        if (wifiInfo.ssid) {
          data = generateWiFiString(wifiInfo);
        }
        break;
      default:
        data = '';
    }

    setQrData(data);
    generateQRCode(data);
  }, [activeTab, urlInput, textInput, contactInfo, wifiInfo]);

  const downloadQRCode = () => {
    if (!qrData) return;

    const canvas = qrContainerRef.current?.querySelector('canvas');
    const img = qrContainerRef.current?.querySelector('img');

    if (canvas) {
      // Download from canvas
      const link = document.createElement('a');
      link.download = `qr-code-${activeTab}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } else if (img) {
      // Download from image
      const link = document.createElement('a');
      link.download = `qr-code-${activeTab}.png`;
      link.href = img.src;
      link.click();
    }
  };

  const copyToClipboard = async () => {
    if (qrData) {
      try {
        await navigator.clipboard.writeText(qrData);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  const resetForm = () => {
    setUrlInput('');
    setTextInput('');
    setContactInfo({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      organization: '',
      url: ''
    });
    setWifiInfo({
      ssid: '',
      password: '',
      securityType: 'WPA'
    });
    setQrData('');
    if (qrContainerRef.current) {
      qrContainerRef.current.innerHTML = '';
    }
  };

  const tabs = [
    { id: 'url', label: 'URL', icon: Link },
    { id: 'text', label: 'Text', icon: MessageSquare },
    { id: 'contact', label: 'Contact', icon: User },
    { id: 'wifi', label: 'WiFi', icon: Wifi }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl mb-4">
            <QrCode className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            QR Code Generator
          </h1>
          <p className="text-gray-600 text-lg">Generate QR codes for URLs, text, contact information, and WiFi networks</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Input Section */}
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  {TAB_TITLES[activeTab]}
                </h2>

                {/* URL Input */}
                {activeTab === 'url' && (
                  <div>
                    <FormField
                      label="Website URL"
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="example.com or https://example.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter a website URL. If you don't include http://, we'll add https:// automatically.
                    </p>
                  </div>
                )}

                {/* Text Input */}
                {activeTab === 'text' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Text Content
                    </label>
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Enter any text to generate QR code..."
                      rows={4}
                      className={`${INPUT_CLASSES} resize-none`}
                    />
                  </div>
                )}

                {/* Contact Input */}
                {activeTab === 'contact' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        label="First Name"
                        type="text"
                        value={contactInfo.firstName}
                        onChange={(e) => setContactInfo({...contactInfo, firstName: e.target.value})}
                        placeholder="John"
                      />
                      <FormField
                        label="Last Name"
                        type="text"
                        value={contactInfo.lastName}
                        onChange={(e) => setContactInfo({...contactInfo, lastName: e.target.value})}
                        placeholder="Doe"
                      />
                    </div>
                    <FormField
                      label="Phone Number"
                      type="tel"
                      value={contactInfo.phone}
                      onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                      placeholder="+1 (555) 123-4567"
                    />
                    <FormField
                      label="Email Address"
                      type="email"
                      value={contactInfo.email}
                      onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                      placeholder="john.doe@example.com"
                    />
                    <FormField
                      label="Organization"
                      type="text"
                      value={contactInfo.organization}
                      onChange={(e) => setContactInfo({...contactInfo, organization: e.target.value})}
                      placeholder="Company Name"
                    />
                    <FormField
                      label="Website"
                      type="url"
                      value={contactInfo.url}
                      onChange={(e) => setContactInfo({...contactInfo, url: e.target.value})}
                      placeholder="https://example.com"
                    />
                  </div>
                )}

                {/* WiFi Input */}
                {activeTab === 'wifi' && (
                  <div className="space-y-4">
                    <FormField
                      label="Network Name (SSID)"
                      type="text"
                      value={wifiInfo.ssid}
                      onChange={(e) => setWifiInfo({...wifiInfo, ssid: e.target.value})}
                      placeholder="MyWiFiNetwork"
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Security Type
                      </label>
                      <select
                        value={wifiInfo.securityType}
                        onChange={(e) => setWifiInfo({...wifiInfo, securityType: e.target.value})}
                        className={INPUT_CLASSES}
                      >
                        <option value="WPA">WPA/WPA2 (Password Protected)</option>
                        <option value="nopass">Open Network (No Password)</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Choose WPA/WPA2 for password-protected networks or Open Network for public WiFi
                      </p>
                    </div>
                    {wifiInfo.securityType === 'WPA' && (
                      <FormField
                        label="Password"
                        type="password"
                        value={wifiInfo.password}
                        onChange={(e) => setWifiInfo({...wifiInfo, password: e.target.value})}
                        placeholder="Enter network password"
                      />
                    )}
                  </div>
                )}

                <button
                  onClick={resetForm}
                  className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                >
                  Clear All Fields
                </button>
              </div>

              {/* QR Code Display Section */}
              <div className="flex flex-col items-center space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800">Generated QR Code</h2>

                <div className="bg-gray-50 rounded-2xl p-8 w-full max-w-sm">
                  {qrData ? (
                    <div className="text-center">
                      <div ref={qrContainerRef} className="flex justify-center">
                        {/* QR code will be dynamically inserted here */}
                      </div>
                      <p className="text-sm text-gray-600 mt-4">
                        Scan this QR code with your device
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">
                        Fill in the form to generate your QR code
                      </p>
                    </div>
                  )}
                </div>

                {qrData && (
                  <div className="flex gap-4 w-full max-w-sm">
                    <button
                      onClick={downloadQRCode}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>

                    <button
                      onClick={copyToClipboard}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-green-600" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy Data
                        </>
                      )}
                    </button>
                  </div>
                )}

                {qrData && (
                  <div className="w-full max-w-sm">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">QR Code Data:</h3>
                    <div className="bg-gray-100 rounded-lg p-3 text-xs text-gray-600 max-h-32 overflow-y-auto">
                      <pre className="whitespace-pre-wrap break-words">{qrData}</pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Generate QR codes instantly • No data stored • Free to use</p>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
