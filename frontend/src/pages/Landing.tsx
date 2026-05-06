import React, { useEffect } from "react";
import { Link } from "wouter";

export default function Landing() {
  useEffect(() => {
    const navbar = document.getElementById("navbar");
    const handleScroll = () => {
      if (window.scrollY > 10) {
        navbar?.classList.add("scrolled");
      } else {
        navbar?.classList.remove("scrolled");
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleFaqClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const item = e.currentTarget;
    const isActive = item.classList.contains("active");
    
    // Close all other items
    const faqItems = document.querySelectorAll(".faq-item");
    faqItems.forEach((otherItem) => {
      otherItem.classList.remove("active");
    });

    // Toggle current item
    if (!isActive) {
      item.classList.add("active");
    }
  };

  return (
    <div className="landing-page" style={{ 
      backgroundColor: "#0A1612", 
      color: "#ffffff",
      minHeight: "100vh",
      fontFamily: "'Inter', sans-serif"
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        :root {
            --bg: #0A1612;
            --card-bg: #111d18;
            --border: rgba(255, 255, 255, 0.08);
            --border-hover: rgba(255, 255, 255, 0.2);
            --primary: #D4AF37;
            --primary-hover: #b8972e;
            --text: #ffffff;
            --text-muted: rgba(255, 255, 255, 0.6);
            --accent: #D4AF37;
        }

        .landing-page * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        .landing-page a {
            text-decoration: none;
            color: inherit;
        }

        .landing-page .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 24px;
        }

        /* Navbar */
        .landing-page .navbar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 72px;
            z-index: 100;
            transition: all 0.3s ease;
            border-bottom: 1px solid transparent;
        }

        .landing-page .navbar.scrolled {
            background-color: rgba(10, 22, 18, 0.8);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid var(--border);
        }

        .landing-page .nav-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 100%;
        }

        .landing-page .logo {
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 700;
            font-size: 1.25rem;
        }

        .landing-page .nav-links {
            display: flex;
            gap: 16px;
            align-items: center;
        }

        /* Buttons */
        .landing-page .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 10px 18px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 0.95rem;
            transition: all 0.2s ease;
            border: 1px solid transparent;
            cursor: pointer;
        }

        .landing-page .btn-primary {
            background-color: var(--primary);
            color: #0A1612;
        }

        .landing-page .btn-primary:hover {
            background-color: var(--primary-hover);
        }

        .landing-page .btn-ghost {
            background-color: transparent;
            color: var(--text);
        }

        .landing-page .btn-ghost:hover {
            background-color: rgba(255, 255, 255, 0.05);
        }

        .landing-page .btn-outline {
            background-color: transparent;
            color: var(--text);
            border-color: var(--border);
        }

        .landing-page .btn-outline:hover {
            border-color: var(--border-hover);
            background-color: rgba(255, 255, 255, 0.02);
        }

        /* Hero */
        .landing-page .hero {
            padding: 160px 0 80px;
            text-align: center;
        }

        .landing-page .hero h1 {
            font-size: clamp(2.5rem, 5vw, 4.5rem);
            font-weight: 700;
            line-height: 1.1;
            letter-spacing: -0.02em;
            margin-bottom: 24px;
            max-width: 900px;
            margin-inline: auto;
        }

        .landing-page .hero p {
            font-size: 1.25rem;
            color: var(--text-muted);
            max-width: 700px;
            margin: 0 auto 40px;
        }

        .landing-page .hero-btns {
            display: flex;
            gap: 16px;
            justify-content: center;
            margin-bottom: 60px;
        }

        .landing-page .hero .btn {
            padding: 14px 28px;
            font-size: 1.05rem;
        }

        .landing-page .app-logos {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 24px;
            flex-wrap: wrap;
            opacity: 0.7;
        }

        .landing-page .app-logos p {
            width: 100%;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 16px;
            color: var(--text-muted);
        }

        .landing-page .app-logo {
            height: 32px;
            width: auto;
            filter: grayscale(1) brightness(2);
        }

        /* Sections common */
        .landing-page section {
            padding: 80px 0;
        }

        .landing-page .section-header {
            text-align: center;
            margin-bottom: 60px;
        }

        .landing-page .section-header h2 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 16px;
        }

        .landing-page .section-header p {
            color: var(--text-muted);
            font-size: 1.1rem;
        }

        /* Cards */
        .landing-page .card {
            background-color: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 32px;
            transition: border-color 0.2s ease, transform 0.2s ease;
        }

        .landing-page .card:hover {
            border-color: var(--border-hover);
        }

        /* How it works */
        .landing-page .steps-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 24px;
        }

        .landing-page .step-card {
            position: relative;
        }

        .landing-page .step-number {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.1);
            font-size: 0.9rem;
            font-weight: 600;
            margin-bottom: 20px;
        }

        .landing-page .step-card h3 {
            font-size: 1.25rem;
            margin-bottom: 12px;
        }

        .landing-page .step-card p {
            color: var(--text-muted);
            font-size: 0.95rem;
        }

        /* API Preview */
        .landing-page .api-preview {
            display: grid;
            grid-template-columns: 1fr 1.2fr;
            gap: 60px;
            align-items: center;
        }

        .landing-page .api-content h2 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 20px;
        }

        .landing-page .api-content p {
            color: var(--text-muted);
            margin-bottom: 32px;
            font-size: 1.1rem;
        }

        .landing-page .code-block {
            background-color: #0d1412;
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 24px;
            font-family: monospace;
            font-size: 0.9rem;
            overflow-x: auto;
        }

        .landing-page .code-header {
            color: var(--text-muted);
            margin-bottom: 16px;
            padding-bottom: 16px;
            border-bottom: 1px solid var(--border);
            font-weight: 600;
        }

        .landing-page .token.key { color: #c084fc; }
        .landing-page .token.string { color: #818cf8; }
        .landing-page .token.number { color: #34d399; }
        .landing-page .token.comment { color: var(--text-muted); }

        /* Features */
        .landing-page .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 24px;
        }

        .landing-page .feature-icon {
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            margin-bottom: 20px;
        }

        .landing-page .features-grid h3 {
            font-size: 1.25rem;
            margin-bottom: 12px;
        }

        .landing-page .features-grid p {
            color: var(--text-muted);
            font-size: 0.95rem;
        }

        /* Supported Apps */
        .landing-page .apps-badges {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 16px;
        }

        .landing-page .app-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            background-color: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 999px;
            font-weight: 500;
        }

        /* Roadmap */
        .landing-page .roadmap-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 24px;
        }

        .landing-page .roadmap-card {
            position: relative;
        }

        .landing-page .badge-soon {
            position: absolute;
            top: 24px;
            right: 24px;
            background-color: rgba(255, 255, 255, 0.1);
            padding: 4px 10px;
            border-radius: 999px;
            font-size: 0.75rem;
            font-weight: 600;
            color: var(--text-muted);
        }

        /* FAQ */
        .landing-page .faq-list {
            max-width: 800px;
            margin: 0 auto;
        }

        .landing-page .faq-item {
            border: 1px solid var(--border);
            border-radius: 12px;
            margin-bottom: 16px;
            background-color: var(--card-bg);
            overflow: hidden;
        }

        .landing-page .faq-question {
            padding: 24px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .landing-page .faq-answer {
            padding: 0 24px;
            max-height: 0;
            overflow: hidden;
            transition: all 0.3s ease;
            color: var(--text-muted);
        }

        .landing-page .faq-item.active .faq-answer {
            padding-bottom: 24px;
            max-height: 200px;
        }

        .landing-page .faq-icon {
            transition: transform 0.3s ease;
        }

        .landing-page .faq-item.active .faq-icon {
            transform: rotate(45deg);
        }

        /* Final CTA */
        .landing-page .final-cta {
            text-align: center;
            padding: 100px 0;
            background-color: var(--card-bg);
            border-top: 1px solid var(--border);
            border-bottom: 1px solid var(--border);
        }

        .landing-page .final-cta h2 {
            font-size: 3rem;
            margin-bottom: 16px;
        }

        .landing-page .final-cta p {
            color: var(--text-muted);
            font-size: 1.2rem;
            margin-bottom: 40px;
        }

        .landing-page .final-cta .btn {
            padding: 16px 32px;
            font-size: 1.1rem;
        }

        /* Footer */
        .landing-page footer {
            padding: 60px 0 40px;
            background-color: var(--bg);
        }

        .landing-page .footer-content {
            display: grid;
            grid-template-columns: 1fr 2fr 1fr;
            gap: 40px;
            margin-bottom: 60px;
        }

        .landing-page .footer-logo {
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 700;
            font-size: 1.2rem;
            margin-bottom: 16px;
        }

        .landing-page .footer-tagline {
            color: var(--text-muted);
            font-size: 0.9rem;
        }

        .landing-page .footer-links {
            display: flex;
            justify-content: center;
            gap: 40px;
        }

        .landing-page .footer-col h4 {
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: var(--text-muted);
            margin-bottom: 20px;
        }

        .landing-page .footer-col ul {
            list-style: none;
        }

        .landing-page .footer-col ul li {
            margin-bottom: 12px;
        }

        .landing-page .footer-col ul a {
            color: var(--text);
            font-size: 0.95rem;
            transition: color 0.2s;
        }

        .landing-page .footer-col ul a:hover {
            color: var(--primary);
        }

        .landing-page .footer-right {
            text-align: right;
        }

        .landing-page .footer-right p {
            color: var(--text-muted);
            font-size: 0.9rem;
            margin-bottom: 16px;
        }

        .landing-page .footer-bottom {
            text-align: center;
            padding-top: 32px;
            border-top: 1px solid var(--border);
            color: var(--text-muted);
            font-size: 0.9rem;
        }

        /* Responsive */
        @media (max-width: 900px) {
            .landing-page .api-preview {
                grid-template-columns: 1fr;
            }
            .landing-page .footer-content {
                grid-template-columns: 1fr;
                text-align: center;
            }
            .landing-page .footer-links {
                flex-direction: column;
                gap: 24px;
            }
            .landing-page .footer-right {
                text-align: center;
            }
            .landing-page .footer-logo {
                justify-content: center;
            }
        }

        @media (max-width: 600px) {
            .landing-page .hero h1 { font-size: 2.2rem; }
            .landing-page .hero-btns {
                flex-direction: column;
            }
            .landing-page .nav-links {
                display: none;
            }
        }
      `}} />

      {/* Navbar */}
      <nav className="navbar" id="navbar">
          <div className="container nav-content">
              <Link href="/" className="logo">
                  <svg stroke="#D4AF37" fill="#D4AF37" strokeWidth="0" viewBox="0 0 16 16" height="28" width="28" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0 0h7v7H0V0zm1 1v5h5V1H1z"></path>
                      <path d="M2 2h3v3H2V2z"></path>
                      <path d="M0 9h7v7H0V9zm1 1v5h5v-5H1z"></path>
                      <path d="M2 11h3v3H2v-3z"></path>
                      <path d="M9 0h7v7H9V0zm1 1v5h5V1H1z"></path>
                      <path d="M11 2h3v3h-3V2z"></path>
                      <path d="M9 9h1v1H9V9zm1 1h1v1h-1v-1zm-1 1h1v1H9v-1zm1 1h1v1h-1v-1zm1-2h1v1h-1v-1zm0 1h1v1h-1v-1zm1-1h1v1h-1v-1zm0 1h1v1h-1v-1zm1-1h1v1h-1v-1zm0 1h1v1h-1v-1zm-1 1h1v1h-1v-1zm0 1h1v1h-1v-1zm1 1h1v1h-1v-1zm-4 1h1v1H9v-1zm1 0h1v1h-1v-1zm1 0h1v1h-1v-1zm1 0h1v1h-1v-1zm1 0h1v1h-1v-1zm-1-6h1v1h-1v-1zm1 0h1v1h-1v-1zm1 0h1v1h-1v-1zm-2 1h1v1h-1v-1zm1 0h1v1h-1v-1zm1 0h1v1h-1v-1zm-2 1h1v1h-1v-1zm1 0h1v1h-1v-1zm1 0h1v1h-1v-1z"></path>
                  </svg>
                  Free Pi
              </Link>
              <div className="nav-links">
                  <Link href="/login" className="btn btn-ghost">Sign In</Link>
                  <Link href="/register" className="btn btn-primary">Get Started Free</Link>
              </div>
          </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
          <div className="container">
              <h1>Accept UPI Payments Without a Payment Gateway</h1>
              <p>Free, open, developer-friendly UPI orchestration for Indian merchants. No transaction fees. No monthly charges. No hidden costs.</p>
              <div className="hero-btns">
                  <Link href="/register" className="btn btn-primary">Start for Free &rarr;</Link>
                  <Link href="/dashboard" className="btn btn-outline">View Dashboard &rarr;</Link>
              </div>
              <div className="app-logos">
                  <p>Works with all major UPI apps</p>
                  <span style={{color: "var(--text-muted)", fontWeight: 500}}>Google Pay</span>
                  <span style={{color: "var(--text-muted)", fontWeight: 500}}>&bull;</span>
                  <span style={{color: "var(--text-muted)", fontWeight: 500}}>PhonePe</span>
                  <span style={{color: "var(--text-muted)", fontWeight: 500}}>&bull;</span>
                  <span style={{color: "var(--text-muted)", fontWeight: 500}}>Paytm</span>
                  <span style={{color: "var(--text-muted)", fontWeight: 500}}>&bull;</span>
                  <span style={{color: "var(--text-muted)", fontWeight: 500}}>BHIM</span>
              </div>
          </div>
      </section>

      {/* How It Works */}
      <section>
          <div className="container">
              <div className="section-header">
                  <h2>How It Works</h2>
              </div>
              <div className="steps-grid">
                  <div className="card step-card">
                      <span className="step-number">1</span>
                      <h3>Register & Get API Keys</h3>
                      <p>Create your free account and get your API key in seconds.</p>
                  </div>
                  <div className="card step-card">
                      <span className="step-number">2</span>
                      <h3>One API Call to Create Payment</h3>
                      <p>POST to our API with amount and order ID. Get back a UPI intent URL and QR code instantly.</p>
                  </div>
                  <div className="card step-card">
                      <span className="step-number">3</span>
                      <h3>Receive Payments</h3>
                      <p>Customer pays via any UPI app. Confirm with UTR number. Done.</p>
                  </div>
              </div>
          </div>
      </section>

      {/* API Preview Section */}
      <section>
          <div className="container">
              <div className="api-preview">
                  <div className="api-content">
                      <h2>Integrate in minutes</h2>
                      <p>No complex SDKs, no heavy libraries. Just standard REST APIs that return exactly what you need to accept payments immediately.</p>
                      <Link href="/register" className="btn btn-primary">Get Started</Link>
                  </div>
                  <div className="code-block">
                      <div className="code-header">
                          <span className="token comment">// Request</span><br/>
                          POST /api/payments<br/>
                          X-API-Key: sk_live_xxxxx
                      </div>
                      <div style={{marginBottom: "24px"}}>
                          {'{'}<br/>
                          &nbsp;&nbsp;<span className="token key">"amount"</span>: <span className="token number">500.00</span>,<br/>
                          &nbsp;&nbsp;<span className="token key">"orderId"</span>: <span className="token string">"ORD-001"</span>,<br/>
                          &nbsp;&nbsp;<span className="token key">"description"</span>: <span className="token string">"Premium Plan"</span>,<br/>
                          &nbsp;&nbsp;<span className="token key">"customerName"</span>: <span className="token string">"Rohith Reddy"</span>,<br/>
                          &nbsp;&nbsp;<span className="token key">"customerPhone"</span>: <span className="token string">"1234567891"</span><br/>
                          {'}'}
                      </div>
                      <div className="code-header">
                          <span className="token comment">// Response</span>
                      </div>
                      <div>
                          {'{'}<br/>
                          &nbsp;&nbsp;<span className="token key">"transactionId"</span>: <span className="token string">"TXN_20260504_5EAB5DE9"</span>,<br/>
                          &nbsp;&nbsp;<span className="token key">"upiIntentUrl"</span>: <span className="token string">"upi://pay?pa=merchant@upi&am=500.00..."</span>,<br/>
                          &nbsp;&nbsp;<span className="token key">"qrCodeDataUrl"</span>: <span className="token string">"https://api.qrserver.com/..."</span>,<br/>
                          &nbsp;&nbsp;<span className="token key">"status"</span>: <span className="token string">"PENDING"</span><br/>
                          {'}'}
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* Features Grid */}
      <section>
          <div className="container">
              <div className="section-header">
                  <h2>Everything you need</h2>
              </div>
              <div className="features-grid">
                  <div className="card">
                      <div className="feature-icon">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
                      </div>
                      <h3>Multi-App UPI Support</h3>
                      <p>Works with GPay, PhonePe, Paytm, BHIM and all UPI apps via intent URLs and QR codes.</p>
                  </div>
                  <div className="card">
                      <div className="feature-icon">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>
                      </div>
                      <h3>QR Code Generation</h3>
                      <p>Instant QR code generated for every payment. Customers scan and pay directly from any UPI app.</p>
                  </div>
                  <div className="card">
                      <div className="feature-icon">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                      </div>
                      <h3>UTR Verification</h3>
                      <p>Customers submit their UTR after payment. You confirm from your dashboard. Simple and reliable.</p>
                  </div>
                  <div className="card">
                      <div className="feature-icon">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                      </div>
                      <h3>Real-time Dashboard</h3>
                      <p>Track all transactions, view analytics, manage API keys from one clean merchant dashboard.</p>
                  </div>
                  <div className="card">
                      <div className="feature-icon">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h4l2-9 5 18 2-9h5"/></svg>
                      </div>
                      <h3>Public Status Page</h3>
                      <p>Customers can check their payment status anytime using just their order ID. No login required.</p>
                  </div>
                  <div className="card">
                      <div className="feature-icon">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>
                      </div>
                      <h3>100% Free Forever</h3>
                      <p>No transaction fees, no monthly charges, no hidden costs. Free Pi is and always will be free.</p>
                  </div>
              </div>
          </div>
      </section>

      {/* Supported UPI Apps */}
      <section>
          <div className="container" style={{textAlign: "center"}}>
              <div className="section-header">
                  <h2>Works With Every UPI App</h2>
              </div>
              <div className="apps-badges">
                  <span className="app-badge">Google Pay</span>
                  <span className="app-badge">PhonePe</span>
                  <span className="app-badge">Paytm</span>
                  <span className="app-badge">BHIM</span>
                  <span className="app-badge">Mobikwik</span>
                  <span className="app-badge">PayZapp</span>
                  <span className="app-badge">Liqui Gold</span>
              </div>
          </div>
      </section>

      {/* Future Roadmap */}
      <section>
          <div className="container">
              <div className="section-header">
                  <h2>What's Coming Next</h2>
                  <p>Free Pi is actively developed. Here's what's on the roadmap.</p>
              </div>
              <div className="roadmap-grid">
                  <div className="card roadmap-card">
                      <span className="badge-soon">Coming Soon</span>
                      <h3>Automatic UTR Verification</h3>
                      <p>Bank SMS and webhook based auto-confirmation instead of manual UTR entry.</p>
                  </div>
                  <div className="card roadmap-card">
                      <span className="badge-soon">Coming Soon</span>
                      <h3>Webhook Support</h3>
                      <p>Instant payment notifications to your server the moment status changes.</p>
                  </div>
                  <div className="card roadmap-card">
                      <span className="badge-soon">Coming Soon</span>
                      <h3>Payment Links</h3>
                      <p>Shareable no-code payment links without any integration required.</p>
                  </div>
                  <div className="card roadmap-card">
                      <span className="badge-soon">Coming Soon</span>
                      <h3>Payout API</h3>
                      <p>Send money to any UPI ID directly from your dashboard.</p>
                  </div>
                  <div className="card roadmap-card">
                      <span className="badge-soon">Coming Soon</span>
                      <h3>Multi-user Teams</h3>
                      <p>Add team members with role based access control.</p>
                  </div>
                  <div className="card roadmap-card">
                      <span className="badge-soon">Coming Soon</span>
                      <h3>White Label</h3>
                      <p>Deploy your own branded instance of Free Pi.</p>
                  </div>
              </div>
          </div>
      </section>

      {/* FAQ */}
      <section>
          <div className="container">
              <div className="section-header">
                  <h2>Frequently Asked Questions</h2>
              </div>
              <div className="faq-list">
                  <div className="faq-item" onClick={handleFaqClick}>
                      <div className="faq-question">
                          Is Free Pi really free?
                          <span className="faq-icon">+</span>
                      </div>
                      <div className="faq-answer">
                          <p>Yes. No transaction fees, no monthly plans, no hidden charges. Free Pi is an open, indie project.</p>
                      </div>
                  </div>
                  <div className="faq-item" onClick={handleFaqClick}>
                      <div className="faq-question">
                          How is payment verified?
                          <span className="faq-icon">+</span>
                      </div>
                      <div className="faq-answer">
                          <p>After paying, the customer enters their UTR (transaction reference number) from their UPI app. You confirm it from your dashboard.</p>
                      </div>
                  </div>
                  <div className="faq-item" onClick={handleFaqClick}>
                      <div className="faq-question">
                          Which UPI apps are supported?
                          <span className="faq-icon">+</span>
                      </div>
                      <div className="faq-answer">
                          <p>All UPI apps including Google Pay, PhonePe, Paytm, BHIM, Amazon Pay and any app that supports the UPI protocol.</p>
                      </div>
                  </div>
                  <div className="faq-item" onClick={handleFaqClick}>
                      <div className="faq-question">
                          Is it safe for production use?
                          <span className="faq-icon">+</span>
                      </div>
                      <div className="faq-answer">
                          <p>Free Pi is an indie project under active development. Use it with that in mind. UTR verification is manual, not bank-validated.</p>
                      </div>
                  </div>
                  <div className="faq-item" onClick={handleFaqClick}>
                      <div className="faq-question">
                          Can I self-host Free Pi?
                          <span className="faq-icon">+</span>
                      </div>
                      <div className="faq-answer">
                          <p>Yes. The entire stack runs on Cloudflare Pages, Workers, and D1 — all free tier. Fork and deploy your own instance.</p>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
          <div className="container">
              <h2>Start Accepting UPI Payments Today</h2>
              <p>Free forever. No credit card required.</p>
              <Link href="/register" className="btn btn-primary" style={{marginBottom: "24px"}}>Get Started Free &rarr;</Link>
              <div>
                  <span style={{color: "var(--text-muted)"}}>Already have an account?</span>
                  <Link href="/login" style={{color: "var(--primary)", fontWeight: 500, marginLeft: "8px"}}>Sign In</Link>
              </div>
          </div>
      </section>

      {/* Footer */}
      <footer>
          <div className="container">
              <div className="footer-content">
                  <div>
                      <Link href="/" className="footer-logo">
                          <svg stroke="#D4AF37" fill="#D4AF37" strokeWidth="0" viewBox="0 0 16 16" height="24" width="24" xmlns="http://www.w3.org/2000/svg">
                              <path d="M0 0h7v7H0V0zm1 1v5h5V1H1z"></path>
                              <path d="M2 2h3v3H2V2z"></path>
                              <path d="M0 9h7v7H0V9zm1 1v5h5v-5H1z"></path>
                              <path d="M2 11h3v3H2v-3z"></path>
                              <path d="M9 0h7v7H9V0zm1 1v5h5V1H1z"></path>
                              <path d="M11 2h3v3h-3V2z"></path>
                              <path d="M9 9h1v1H9V9zm1 1h1v1h-1v-1zm-1 1h1v1H9v-1zm1 1h1v1h-1v-1zm1-2h1v1h-1v-1zm0 1h1v1h-1v-1zm1-1h1v1h-1v-1zm0 1h1v1h-1v-1zm1-1h1v1h-1v-1zm0 1h1v1h-1v-1zm-1 1h1v1h-1v-1zm0 1h1v1h-1v-1zm1 1h1v1h-1v-1zm-4 1h1v1H9v-1zm1 0h1v1h-1v-1zm1 0h1v1h-1v-1zm1 0h1v1h-1v-1zm1 0h1v1h-1v-1zm-1-6h1v1h-1v-1zm1 0h1v1h-1v-1zm1 0h1v1h-1v-1zm-2 1h1v1h-1v-1zm1 0h1v1h-1v-1zm1 0h1v1h-1v-1zm-2 1h1v1h-1v-1zm1 0h1v1h-1v-1zm1 0h1v1h-1v-1z"></path>
                          </svg>
                          Free Pi
                      </Link>
                      <p className="footer-tagline">Free UPI Payment Orchestration</p>
                  </div>
                  <div className="footer-links">
                      <div className="footer-col">
                          <h4>Product</h4>
                          <ul>
                              <li><Link href="/dashboard">Dashboard</Link></li>
                              <li><Link href="/dashboard/api-keys">API Keys</Link></li>
                              <li><Link href="/status">Status Checker</Link></li>
                          </ul>
                      </div>
                      <div className="footer-col">
                          <h4>Resources</h4>
                          <ul>
                              <li><a href="#">Documentation</a></li>
                              <li><a href="#">Support</a></li>
                              <li><a href="#">GitHub</a></li>
                          </ul>
                      </div>
                  </div>
                  <div className="footer-right">
                      <p>Donate to keep Free Pi running</p>
                      <a href="#" className="btn btn-outline">Donate with UPI</a>
                  </div>
              </div>
              <div style={{borderTop: "1px solid var(--border)", paddingTop: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem"}}>
                  &copy; 2026 Free Pi. Built with ❤️ for Indian developers.
              </div>
          </div>
      </footer>
    </div>
  );
}
