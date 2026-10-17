import { useEffect } from "react";
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

  return (
    <div className="landing-page">
      <style dangerouslySetInnerHTML={{__html: `
        .landing-page {
            --bg: #060913;
            --card-bg: #101923;
            --border: rgba(218, 230, 231, 0.12);
            --border-hover: rgba(112, 220, 180, 0.42);
            --primary: #78d9b1;
            --primary-hover: #91e4c1;
            --text: #f4f5f2;
            --text-muted: #aab6b8;
            --accent: #78d9b1;
            min-height: 100vh;
            overflow: hidden;
            background: #0a1116;
            color: var(--text);
            font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
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
        }

        .landing-page {
            --container-width: 1240px;
            background-image: radial-gradient(ellipse at 78% 12%, rgba(68, 131, 111, 0.12), transparent 32rem);
        }

        .landing-page .container {
            max-width: var(--container-width);
            padding-inline: clamp(20px, 5vw, 64px);
        }

        .landing-page .skip-link {
            position: absolute;
            z-index: 101;
            top: 12px;
            left: 12px;
            padding: 10px 14px;
            transform: translateY(-160%);
            border-radius: 6px;
            background: var(--primary);
            color: #09130f;
            font-weight: 700;
        }

        .landing-page .skip-link:focus {
            transform: translateY(0);
        }

        .landing-page .navbar {
            height: 76px;
            background: rgba(10, 17, 22, 0.72);
            backdrop-filter: blur(18px);
            border-bottom-color: var(--border);
        }

        .landing-page .navbar.scrolled {
            background: rgba(10, 17, 22, 0.92);
        }

        .landing-page .logo {
            gap: 10px;
            font-size: 1.1rem;
            letter-spacing: -0.04em;
        }

        .landing-page .logo svg,
        .landing-page .footer-logo svg {
            color: var(--primary);
        }

        .landing-page .btn {
            min-height: 44px;
            border-radius: 7px;
            transition: background-color 180ms ease, border-color 180ms ease, color 180ms ease, transform 180ms ease;
        }

        .landing-page .btn:hover {
            transform: translateY(-1px);
        }

        .landing-page .btn:active {
            transform: translateY(1px) scale(0.99);
        }

        .landing-page a:focus-visible,
        .landing-page summary:focus-visible {
            outline: 2px solid var(--primary);
            outline-offset: 4px;
        }

        .landing-page .btn-primary {
            background: var(--primary);
            color: #0b1712;
        }

        .landing-page .btn-primary:hover {
            background: var(--primary-hover);
        }

        .landing-page .btn-outline {
            border-color: rgba(218, 230, 231, 0.22);
        }

        .landing-page .btn-outline:hover {
            border-color: var(--border-hover);
            background: rgba(120, 217, 177, 0.06);
        }

        .landing-page .hero {
            position: relative;
            padding: clamp(132px, 16vw, 192px) 0 104px;
            text-align: left;
        }

        .landing-page .hero::before {
            position: absolute;
            top: 19%;
            right: -17rem;
            width: 40rem;
            height: 40rem;
            border: 1px solid rgba(120, 217, 177, 0.09);
            border-radius: 50%;
            content: "";
            pointer-events: none;
        }

        .landing-page .hero-layout {
            position: relative;
            display: grid;
            grid-template-columns: minmax(0, 1.02fr) minmax(360px, 0.98fr);
            gap: clamp(40px, 7vw, 96px);
            align-items: center;
        }

        .landing-page .hero-copy {
            max-width: 610px;
        }

        .landing-page .eyebrow {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 24px;
            color: #b7c6c2;
            font-size: 0.78rem;
            font-weight: 600;
            letter-spacing: 0.08em;
            text-transform: uppercase;
        }

        .landing-page .eyebrow::before {
            width: 22px;
            height: 1px;
            background: var(--primary);
            content: "";
        }

        .landing-page .hero h1 {
            max-width: 650px;
            margin: 0 0 22px;
            font-size: clamp(3.1rem, 6vw, 5.65rem);
            font-weight: 600;
            letter-spacing: -0.075em;
            line-height: 0.99;
            text-wrap: balance;
        }

        .landing-page .hero h1 em {
            color: var(--primary);
            font-style: normal;
        }

        .landing-page .hero-copy > p {
            max-width: 56ch;
            margin: 0 0 30px;
            color: var(--text-muted);
            font-size: 1.04rem;
            line-height: 1.8;
            text-wrap: pretty;
        }

        .landing-page .hero-copy > p strong {
            color: #e2e8e3;
            font-weight: 600;
        }

        .landing-page .hero-btns {
            justify-content: flex-start;
            gap: 12px;
            margin-bottom: 34px;
        }

        .landing-page .hero .btn {
            padding: 13px 21px;
            font-size: 0.94rem;
        }

        .landing-page .app-logos {
            justify-content: flex-start;
            gap: 13px;
            color: #9ba9a8;
            font-size: 0.82rem;
            opacity: 1;
        }

        .landing-page .app-logos p {
            width: auto;
            margin: 0 10px 0 0;
            color: #7f9190;
            font-size: 0.69rem;
            letter-spacing: 0.11em;
        }

        .landing-page .app-logos span {
            color: #bac4c2 !important;
        }

        .landing-page .payment-preview {
            position: relative;
            max-width: 480px;
            justify-self: end;
            padding: 14px;
            border: 1px solid rgba(218, 230, 231, 0.13);
            border-radius: 17px;
            background: linear-gradient(145deg, rgba(28, 42, 47, 0.94), rgba(15, 25, 31, 0.96));
            box-shadow: 0 34px 88px rgba(0, 0, 0, 0.33), inset 0 1px rgba(255, 255, 255, 0.06);
            transform: rotate(1.2deg);
        }

        .landing-page .preview-topbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 8px 16px;
            color: #9aa9a8;
            font-size: 0.72rem;
        }

        .landing-page .preview-dots {
            display: flex;
            gap: 5px;
        }

        .landing-page .preview-dots span {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #71817e;
        }

        .landing-page .preview-window {
            padding: clamp(23px, 4vw, 40px);
            border: 1px solid rgba(218, 230, 231, 0.1);
            border-radius: 11px;
            background: #f1f4ef;
            color: #162320;
        }

        .landing-page .preview-brand {
            display: flex;
            align-items: center;
            gap: 9px;
            color: #44544f;
            font-size: 0.78rem;
            font-weight: 600;
        }

        .landing-page .preview-mark {
            display: grid;
            width: 27px;
            height: 27px;
            place-items: center;
            border-radius: 7px;
            background: #dcefe5;
            color: #18714e;
            font-size: 0.75rem;
            font-weight: 700;
        }

        .landing-page .preview-label {
            margin: 30px 0 2px;
            color: #73817b;
            font-size: 0.77rem;
        }

        .landing-page .preview-amount {
            color: #13201c;
            font-size: clamp(2.25rem, 4.5vw, 3.3rem);
            font-weight: 600;
            letter-spacing: -0.07em;
            line-height: 1.15;
            font-variant-numeric: tabular-nums;
        }

        .landing-page .preview-divider {
            height: 1px;
            margin: 22px 0;
            background: #dfe6e0;
        }

        .landing-page .preview-order {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            color: #687771;
            font-size: 0.77rem;
        }

        .landing-page .preview-order strong {
            color: #25332e;
            font-weight: 600;
        }

        .landing-page .preview-steps {
            display: grid;
            gap: 11px;
            margin-top: 22px;
        }

        .landing-page .preview-step {
            display: flex;
            align-items: center;
            gap: 10px;
            color: #52615a;
            font-size: 0.74rem;
        }

        .landing-page .preview-check {
            display: grid;
            width: 21px;
            height: 21px;
            flex: 0 0 21px;
            place-items: center;
            border-radius: 50%;
            background: #dcefe5;
            color: #18714e;
            font-size: 0.7rem;
            font-weight: 700;
        }

        .landing-page .preview-status {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 23px;
            padding: 12px 13px;
            border-radius: 7px;
            background: #e6eee8;
            color: #52615a;
            font-size: 0.72rem;
        }

        .landing-page .preview-status strong {
            color: #9b6a25;
            font-weight: 600;
        }

        .landing-page section {
            padding: clamp(72px, 9vw, 118px) 0;
            scroll-margin-top: 72px;
        }

        .landing-page .section-header {
            max-width: 660px;
            margin: 0 0 40px;
            text-align: left;
        }

        .landing-page .section-header h2,
        .landing-page .api-content h2 {
            margin-bottom: 12px;
            font-size: clamp(2rem, 4vw, 3.2rem);
            font-weight: 600;
            letter-spacing: -0.06em;
            line-height: 1.08;
            text-wrap: balance;
        }

        .landing-page .section-header p,
        .landing-page .api-content p {
            max-width: 58ch;
            color: var(--text-muted);
            font-size: 1rem;
            line-height: 1.75;
        }

        .landing-page .card {
            border: 1px solid var(--border);
            border-radius: 10px;
            background: linear-gradient(145deg, rgba(23, 36, 42, 0.78), rgba(14, 24, 30, 0.78));
            padding: 27px;
            transition: border-color 200ms ease, transform 200ms ease, background-color 200ms ease;
        }

        .landing-page .card:hover {
            transform: translateY(-3px);
            border-color: var(--border-hover);
        }

        .landing-page .step-number {
            width: 36px;
            height: 36px;
            border: 1px solid rgba(120, 217, 177, 0.22);
            border-radius: 8px;
            background: rgba(120, 217, 177, 0.08);
            color: var(--primary);
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.78rem;
        }

        .landing-page .step-card h3,
        .landing-page .features-grid h3,
        .landing-page .roadmap-card h3 {
            margin-bottom: 10px;
            font-size: 1.08rem;
            font-weight: 600;
            letter-spacing: -0.025em;
        }

        .landing-page .step-card p,
        .landing-page .features-grid p,
        .landing-page .roadmap-card p {
            max-width: 44ch;
            color: var(--text-muted);
            font-size: 0.88rem;
            line-height: 1.75;
        }

        .landing-page #how-it-works .steps-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 15px;
        }

        .landing-page .api-preview {
            grid-template-columns: minmax(0, 0.82fr) minmax(0, 1.18fr);
            gap: clamp(36px, 7vw, 92px);
        }

        .landing-page .api-content p {
            margin-bottom: 27px;
        }

        .landing-page .code-block {
            border-color: var(--border);
            border-radius: 10px;
            background: #10191f;
            box-shadow: 0 26px 62px rgba(0, 0, 0, 0.2);
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.76rem;
            line-height: 1.85;
        }

        .landing-page .token.key { color: #9ad9bd; }
        .landing-page .token.string { color: #d5b58c; }
        .landing-page .token.number { color: #c7d49e; }

        .landing-page .features-grid {
            grid-template-columns: repeat(12, minmax(0, 1fr));
            gap: 14px;
        }

        .landing-page .features-grid > .card {
            grid-column: span 4;
        }

        .landing-page .features-grid > .card:first-child {
            grid-column: span 8;
        }

        .landing-page .feature-icon {
            width: 40px;
            height: 40px;
            margin-bottom: 22px;
            border: 1px solid rgba(120, 217, 177, 0.16);
            border-radius: 8px;
            background: rgba(120, 217, 177, 0.07);
            color: var(--primary);
        }

        .landing-page .apps-badges {
            justify-content: flex-start;
            gap: 10px;
        }

        .landing-page .app-badge {
            padding: 10px 15px;
            border-radius: 6px;
            background: rgba(255, 255, 255, 0.025);
            color: #c1ccca;
            font-size: 0.82rem;
        }

        .landing-page .badge-soon {
            top: 22px;
            right: 22px;
            border-radius: 4px;
            background: rgba(120, 217, 177, 0.09);
            color: #a9d9c4;
            letter-spacing: 0.02em;
        }

        .landing-page .faq-list {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px 30px;
            max-width: 100%;
        }

        .landing-page .faq-item {
            margin: 0;
            border: 0;
            border-bottom: 1px solid var(--border);
            border-radius: 0;
            background: transparent;
        }

        .landing-page .faq-question {
            min-height: 66px;
            padding: 15px 2px;
            list-style: none;
            color: #e4e9e5;
            font-size: 0.96rem;
            cursor: pointer;
        }

        .landing-page .faq-question::-webkit-details-marker {
            display: none;
        }

        .landing-page .faq-answer {
            max-height: none;
            padding: 0 28px 0 2px;
            color: var(--text-muted);
            font-size: 0.88rem;
            line-height: 1.75;
            transition: padding 180ms ease;
        }

        .landing-page .faq-item[open] .faq-answer {
            padding-bottom: 18px;
        }

        .landing-page .faq-icon {
            color: var(--primary);
            font-size: 1.3rem;
            font-weight: 400;
            transition: transform 180ms ease;
        }

        .landing-page .faq-item[open] .faq-icon {
            transform: rotate(45deg);
        }

        .landing-page .final-cta {
            padding: clamp(70px, 10vw, 118px) 0;
            border: 0;
            background: radial-gradient(ellipse at 50% 0%, rgba(71, 131, 109, 0.14), transparent 55%), #10191e;
            text-align: left;
        }

        .landing-page .final-cta h2 {
            max-width: 730px;
            font-size: clamp(2.3rem, 5vw, 4rem);
            font-weight: 600;
            letter-spacing: -0.07em;
            line-height: 1.02;
            text-wrap: balance;
        }

        .landing-page .final-cta p {
            margin-bottom: 26px;
            color: var(--text-muted);
            font-size: 1rem;
        }

        .landing-page .final-cta > .container > div {
            margin-top: 23px;
            color: var(--text-muted);
            font-size: 0.9rem;
        }

        .landing-page .cta-login {
            margin-left: 8px;
            color: var(--primary);
            font-weight: 600;
        }

        .landing-page footer {
            padding: 56px 0 34px;
            background: #0a1116;
        }

        .landing-page .footer-content {
            grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr) minmax(0, 0.8fr);
            gap: 32px;
            margin-bottom: 42px;
        }

        .landing-page .footer-col h4 {
            color: #94a19f;
            font-size: 0.72rem;
            letter-spacing: 0.1em;
        }

        .landing-page .footer-col ul a {
            color: #c2ccca;
        }

        .landing-page .footer-right p,
        .landing-page .footer-tagline,
        .landing-page .footer-bottom {
            color: #9aa8a6;
        }

        @media (max-width: 900px) {
            .landing-page .hero-layout {
                grid-template-columns: minmax(0, 1fr) minmax(280px, 0.9fr);
                gap: 30px;
            }

            .landing-page .features-grid > .card,
            .landing-page .features-grid > .card:first-child {
                grid-column: span 6;
            }

            .landing-page .footer-content {
                grid-template-columns: 1fr 1.5fr;
                text-align: left;
            }

            .landing-page .footer-links {
                justify-content: flex-end;
                gap: 30px;
            }

            .landing-page .footer-logo {
                justify-content: flex-start;
            }

            .landing-page .footer-right {
                grid-column: 1 / -1;
                text-align: left;
            }
        }

        @media (max-width: 680px) {
            .landing-page .navbar {
                height: 68px;
            }

            .landing-page .nav-links {
                gap: 4px;
            }

            .landing-page .nav-links .btn {
                padding: 8px 10px;
                font-size: 0.77rem;
            }

            .landing-page .hero {
                padding: 122px 0 70px;
            }

            .landing-page .hero-layout {
                grid-template-columns: 1fr;
                gap: 50px;
            }

            .landing-page .hero h1 {
                font-size: clamp(3rem, 13vw, 4.4rem);
            }

            .landing-page .hero-copy > p {
                font-size: 0.96rem;
            }

            .landing-page .hero-btns {
                flex-direction: row;
                flex-wrap: wrap;
            }

            .landing-page .app-logos {
                gap: 9px;
                flex-wrap: wrap;
            }

            .landing-page .app-logos p {
                width: 100%;
                margin-bottom: 2px;
            }

            .landing-page .payment-preview {
                width: min(100%, 460px);
                justify-self: center;
                transform: none;
            }

            .landing-page .section-header {
                margin-bottom: 28px;
            }

            .landing-page #how-it-works .steps-grid,
            .landing-page .faq-list {
                grid-template-columns: 1fr;
            }

            .landing-page .api-preview {
                grid-template-columns: 1fr;
                gap: 34px;
            }

            .landing-page .code-block {
                padding: 18px;
                font-size: 0.68rem;
            }

            .landing-page .features-grid > .card,
            .landing-page .features-grid > .card:first-child {
                grid-column: 1 / -1;
            }

            .landing-page .footer-content {
                grid-template-columns: 1fr;
                text-align: left;
            }

            .landing-page .footer-links {
                justify-content: flex-start;
                flex-direction: row;
                gap: 44px;
            }

            .landing-page .footer-right {
                grid-column: auto;
            }
        }

        @media (prefers-reduced-motion: reduce) {
            .landing-page *,
            .landing-page *::before,
            .landing-page *::after {
                scroll-behavior: auto !important;
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        }
      `}} />

      <a className="skip-link" href="#main-content">Skip to content</a>

      {/* Navbar */}
      <nav className="navbar" id="navbar">
          <div className="container nav-content">
              <Link href="/" className="logo" aria-label="Free Pi home">
                  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="28" width="28" xmlns="http://www.w3.org/2000/svg">
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

      <main id="main-content">
      {/* Hero Section */}
      <section className="hero">
          <div className="container">
              <div className="hero-layout">
                  <div className="hero-copy">
                      <span className="eyebrow">Open-source UPI payments</span>
                      <h1>UPI payments, without the <em>gateway.</em></h1>
                      <p>Create hosted payment pages with one API call. Customers pay in their UPI app, then you review each UTR in your dashboard. <strong>No transaction fees or monthly charges.</strong></p>
                      <div className="hero-btns">
                          <Link href="/register" className="btn btn-primary">Start accepting payments <span aria-hidden="true">&rarr;</span></Link>
                          <a href="#how-it-works" className="btn btn-outline">See how it works <span aria-hidden="true">&darr;</span></a>
                      </div>
                      <div className="app-logos" aria-label="Compatible with major UPI apps">
                          <p>Pay with</p>
                          <span>Google Pay</span>
                          <span aria-hidden="true">·</span>
                          <span>PhonePe</span>
                          <span aria-hidden="true">·</span>
                          <span>Paytm</span>
                          <span aria-hidden="true">·</span>
                          <span>BHIM</span>
                      </div>
                  </div>
                  <div className="payment-preview" role="img" aria-label="Example hosted checkout for a 1,250 rupee payment, awaiting manual UTR review.">
                      <div className="preview-topbar">
                          <span className="preview-dots" aria-hidden="true"><span /><span /><span /></span>
                          <span>checkout.freepi.in</span>
                          <span aria-hidden="true">•••</span>
                      </div>
                      <div className="preview-window">
                          <div className="preview-brand"><span className="preview-mark" aria-hidden="true">fp</span> Meadow Studio</div>
                          <p className="preview-label">Amount due</p>
                          <div className="preview-amount">₹1,250</div>
                          <div className="preview-divider" />
                          <div className="preview-order"><span>Order</span><strong>MS-2048</strong></div>
                          <div className="preview-steps">
                              <div className="preview-step"><span className="preview-check" aria-hidden="true">1</span>Pay with any UPI app</div>
                              <div className="preview-step"><span className="preview-check" aria-hidden="true">2</span>Submit your UTR</div>
                              <div className="preview-step"><span className="preview-check" aria-hidden="true">3</span>Merchant reviews payment</div>
                          </div>
                          <div className="preview-status"><span>Payment status</span><strong>Awaiting review</strong></div>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works">
          <div className="container">
              <div className="section-header">
                  <span className="eyebrow">A simpler checkout flow</span>
                  <h2>From API call to UPI payment.</h2>
                  <p>Free Pi hosts checkout and keeps payment status in one place. You stay in control of verification.</p>
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
                      <p>POST amount, order ID, and description. Get back a hosted payment URL to redirect your customer.</p>
                  </div>
                  <div className="card step-card">
                      <span className="step-number">3</span>
                      <h3>Receive Payments</h3>
                      <p>The payment page collects customer name and email, shows QR/UPI options, and captures the UTR for confirmation.</p>
                  </div>
              </div>
          </div>
      </section>

      {/* API Preview Section */}
      <section id="api-preview">
          <div className="container">
                  <div className="api-preview">
                  <div className="api-content">
                      <h2>One request starts checkout.</h2>
                      <p>Create a payment from your server, redirect the customer to the hosted payment page, and let Free Pi collect customer details, show the QR, and capture UTR proof.</p>
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
                          &nbsp;&nbsp;<span className="token key">"amount"</span>: <span className="token number">50000</span>,<br/>
                          &nbsp;&nbsp;<span className="token key">"orderId"</span>: <span className="token string">"ORD-001"</span>,<br/>
                          &nbsp;&nbsp;<span className="token key">"description"</span>: <span className="token string">"Premium Plan"</span><br/>
                          {'}'}
                      </div>
                      <div className="code-header">
                          <span className="token comment">// Response</span>
                      </div>
                      <div>
                          {'{'}<br/>
                          &nbsp;&nbsp;<span className="token key">"transactionId"</span>: <span className="token string">"TXN_20260504_5EAB5DE9"</span>,<br/>
                          &nbsp;&nbsp;<span className="token key">"paymentUrl"</span>: <span className="token string">"https://yourdomain.com/pay/TXN_20260504_5EAB5DE9"</span>,<br/>
                          &nbsp;&nbsp;<span className="token key">"redirectUrl"</span>: <span className="token string">"https://yourdomain.com/pay/TXN_20260504_5EAB5DE9"</span>,<br/>
                          &nbsp;&nbsp;<span className="token key">"qrCodeDataUrl"</span>: <span className="token string">"https://api.qrserver.com/..."</span>,<br/>
                          &nbsp;&nbsp;<span className="token key">"upiIntentUrl"</span>: <span className="token string">"upi://pay?pa=merchant@upi&am=500.00..."</span>,<br/>
                          &nbsp;&nbsp;<span className="token key">"status"</span>: <span className="token string">"PENDING"</span><br/>
                          {'}'}
                      </div>
                      <div className="code-header" style={{marginTop: "24px"}}>
                          <span className="token comment">// Checkout</span>
                      </div>
                      <div>
                          window.location.href = response.redirectUrl;<br/>
                          <span className="token comment">// Customer enters name/email, pays by QR/UPI, then submits UTR.</span>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* Features Grid */}
      <section>
          <div className="container">
              <div className="section-header">
                  <span className="eyebrow">Built for small teams</span>
                  <h2>The essentials, without the overhead.</h2>
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
          <div className="container">
              <div className="section-header">
                  <span className="eyebrow">Broad UPI compatibility</span>
                  <h2>Customers pay with their UPI app.</h2>
                  <p>Use UPI intent links or scan a QR code. No special app is required.</p>
              </div>
              <div className="apps-badges">
                  <span className="app-badge">Google Pay</span>
                  <span className="app-badge">PhonePe</span>
                  <span className="app-badge">Paytm</span>
                  <span className="app-badge">BHIM</span>
                  <span className="app-badge">Mobikwik</span>
                  <span className="app-badge">CRED</span>
                  <span className="app-badge">Freecharge</span>
                  <span className="app-badge">Any UPI app</span>
              </div>
          </div>
      </section>

      {/* Future Roadmap */}
      <section>
          <div className="container">
              <div className="section-header">
                  <h2>What we're working on.</h2>
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
                  <span className="eyebrow">Before you get started</span>
                  <h2>Common questions.</h2>
              </div>
              <div className="faq-list">
                  <details className="faq-item">
                      <summary className="faq-question">
                          Is Free Pi really free?
                          <span className="faq-icon" aria-hidden="true">+</span>
                      </summary>
                      <div className="faq-answer">
                          <p>Yes. No transaction fees, no monthly plans, no hidden charges. Free Pi is an open, indie project.</p>
                      </div>
                  </details>
                  <details className="faq-item">
                      <summary className="faq-question">
                          How is payment verified?
                          <span className="faq-icon" aria-hidden="true">+</span>
                      </summary>
                      <div className="faq-answer">
                          <p>After paying, the customer enters their UTR (transaction reference number) from their UPI app. You confirm it from your dashboard.</p>
                      </div>
                  </details>
                  <details className="faq-item">
                      <summary className="faq-question">
                          Which UPI apps are supported?
                          <span className="faq-icon" aria-hidden="true">+</span>
                      </summary>
                      <div className="faq-answer">
                          <p>Google Pay, PhonePe, Paytm, BHIM, Amazon Pay and any app that supports the UPI protocol.</p>
                      </div>
                  </details>
                  <details className="faq-item">
                      <summary className="faq-question">
                          Is it safe for production use?
                          <span className="faq-icon" aria-hidden="true">+</span>
                      </summary>
                      <div className="faq-answer">
                          <p>Free Pi is an indie project under active development. Use it with that in mind. UTR verification is manual, not bank-validated.</p>
                      </div>
                  </details>
                  <details className="faq-item">
                      <summary className="faq-question">
                          Can I self-host Free Pi?
                          <span className="faq-icon" aria-hidden="true">+</span>
                      </summary>
                      <div className="faq-answer">
                          <p>Yes. The entire stack runs on Cloudflare Pages, Workers, and D1 — all free tier. Fork and deploy your own instance.</p>
                      </div>
                  </details>
              </div>
          </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
          <div className="container">
              <h2>Start Accepting UPI Payments Today</h2>
              <p>Free forever. No credit card required.</p>
              <Link href="/register" className="btn btn-primary">Get started free <span aria-hidden="true">&rarr;</span></Link>
              <div>
                  <span>Already have an account?</span>
                  <Link href="/login" className="cta-login">Sign in</Link>
              </div>
          </div>
      </section>

      </main>

      {/* Footer */}
      <footer>
          <div className="container">
              <div className="footer-content">
                  <div>
                      <Link href="/" className="footer-logo">
                          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="24" width="24" xmlns="http://www.w3.org/2000/svg">
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
                              <li><Link href="/api-keys">API keys</Link></li>
                              <li><Link href="/analytics">Analytics</Link></li>
                          </ul>
                      </div>
                      <div className="footer-col">
                          <h4>Resources</h4>
                          <ul>
                              <li><a href="https://github.com/byrohithreddy/Free-pi#readme">Documentation</a></li>
                              <li><a href="https://github.com/byrohithreddy/Free-pi/issues">Support</a></li>
                              <li><a href="https://github.com/byrohithreddy/Free-pi">GitHub</a></li>
                          </ul>
                      </div>
                  </div>
                  <div className="footer-right">
                      <p>Donate to keep Free Pi running</p>
                      <Link href="/donate" className="btn btn-outline">Donate with UPI</Link>
                  </div>
              </div>
              <div className="footer-bottom">
                  &copy; 2026 Free Pi. Built with ❤️ for Indian Micro Enterprises.
              </div>
          </div>
      </footer>
    </div>
  );
}
