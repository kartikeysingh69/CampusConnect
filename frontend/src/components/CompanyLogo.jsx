// src/components/CompanyLogo.jsx — High-definition company brand logo with monogram fallback
import { useState } from 'react';
import { FaBuilding } from 'react-icons/fa';

// Company domain mapping for official logo retrieval
const DOMAIN_MAP = {
  'google': 'google.com',
  'google people operations': 'google.com',
  'amazon': 'amazon.com',
  'amazon web services': 'aws.amazon.com',
  'amazon fulfillment': 'amazon.com',
  'amazon customer service': 'amazon.com',
  'microsoft': 'microsoft.com',
  'microsoft azure': 'microsoft.com',
  'infosys': 'infosys.com',
  'infosys hr': 'infosys.com',
  'meta': 'meta.com',
  'oracle': 'oracle.com',
  'oracle cloud': 'oracle.com',
  'oracle india': 'oracle.com',
  'uber': 'uber.com',
  'uber india': 'uber.com',
  'cisco': 'cisco.com',
  'netflix': 'netflix.com',
  'nvidia': 'nvidia.com',
  'atlassian': 'atlassian.com',
  'swiggy': 'swiggy.com',
  'adobe': 'adobe.com',
  'ibm': 'ibm.com',
  'qualcomm': 'qualcomm.com',
  'qualcomm india': 'qualcomm.com',
  'zomato': 'zomato.com',
  'tata motors': 'tatamotors.com',
  'tata power solar': 'tatapower.com',
  'tata consultancy services': 'tcs.com',
  'tcs digital': 'tcs.com',
  'tcs': 'tcs.com',
  'tata projects': 'tataprojects.com',
  'razorpay': 'razorpay.com',
  'paytm': 'paytm.com',
  'fractal analytics': 'fractal.ai',
  'phonepe': 'phonepe.com',
  'urban company': 'urbancompany.com',
  'wipro': 'wipro.com',
  'wipro cybersecurity': 'wipro.com',
  'wipro bpo aviation': 'wipro.com',
  'wipro l&d academy': 'wipro.com',
  'reliance jio': 'jio.com',
  'reliance jio ai': 'jio.com',
  'polygon labs': 'polygon.technology',
  'dream11': 'dream11.com',
  'hcl technologies': 'hcltech.com',
  'bosch india': 'bosch.in',
  'bosch': 'bosch.in',
  'mahindra & mahindra': 'mahindra.com',
  'mahindra': 'mahindra.com',
  'maruti suzuki': 'marutisuzuki.com',
  'voltas limited': 'voltas.com',
  'voltas': 'voltas.com',
  'larsen & toubro': 'larsentoubro.com',
  'larsen & toubro heavy': 'larsentoubro.com',
  'larsen & toubro construction': 'lntecc.com',
  'l&t electrical & automation': 'larsentoubro.com',
  'thermax global': 'thermaxglobal.com',
  'thermax': 'thermaxglobal.com',
  'fanuc india': 'fanuc.com',
  'drdo aeronautics': 'drdo.gov.in',
  'jindal steel & power': 'jindalsteelpower.com',
  'technip energies': 'technipenergies.com',
  'ntpc limited': 'ntpc.co.in',
  'godrej & boyce': 'godrej.com',
  'godrej properties': 'godrejproperties.com',
  'godrej': 'godrej.com',
  'brembo brakes india': 'brembo.com',
  'bharat forge': 'bharatforge.com',
  'caterpillar india': 'caterpillar.com',
  'caterpillar': 'caterpillar.com',
  'abb india': 'abb.com',
  'abb': 'abb.com',
  'siemens energy': 'siemens-energy.com',
  'siemens': 'siemens.com',
  'ola electric': 'olaelectric.com',
  'adani transmission': 'adanitransmission.com',
  'adani': 'adani.com',
  'schneider electric': 'se.com',
  'rockwell automation': 'rockwellautomation.com',
  'ather energy': 'atherenergy.com',
  'havells india': 'havells.com',
  'havells': 'havells.com',
  'alstom india': 'alstom.com',
  'alstom': 'alstom.com',
  'suzlon energy': 'suzlon.com',
  'intel india': 'intel.com',
  'intel': 'intel.com',
  'bharti airtel': 'airtel.in',
  'airtel': 'airtel.in',
  'honeywell india': 'honeywell.com',
  'honeywell': 'honeywell.com',
  'texas instruments': 'ti.com',
  'harman connected services': 'harman.com',
  'sterlite technologies (stl)': 'stl.tech',
  'amd india': 'amd.com',
  'amd': 'amd.com',
  'bharat electronics (bel)': 'bel-india.in',
  'samsung r&d': 'samsung.com',
  'samsung': 'samsung.com',
  'ideaforge': 'ideaforge.co.in',
  'continental automotive': 'continental.com',
  'shapoorji pallonji': 'shapoorjipallonji.com',
  'afcons infrastructure': 'afcons.com',
  'dilip buildcon': 'dilipbuildcon.com',
  'sobha developers': 'sobha.com',
  'va tech wabag': 'wabag.com',
  'jll india': 'jll.com',
  'gammon india': 'gammonindia.com',
  'pwc infrastructure': 'pwc.in',
  'pwc': 'pwc.com',
  'deloitte india': 'deloitte.com',
  'deloitte': 'deloitte.com',
  'kpmg india': 'kpmg.com',
  'kpmg': 'kpmg.com',
  'flipkart': 'flipkart.com',
  'flipkart customer ops': 'flipkart.com',
  'makemytrip': 'makemytrip.com',
  'unilever india': 'unilever.com',
  'unilever': 'unilever.com',
  'byjus enterprise': 'byjus.com',
  'byjus': 'byjus.com',
  'accenture strategy': 'accenture.com',
  'accenture': 'accenture.com',
  'meesho': 'meesho.com',
  'ey india (ernst & young)': 'ey.com',
  'ey': 'ey.com',
  'dunzo for business': 'dunzo.com',
  'goldman sachs india': 'goldmansachs.com',
  'goldman sachs': 'goldmansachs.com',
  'hdfc bank': 'hdfcbank.com',
  'american express': 'americanexpress.com',
  'icici securities': 'icicisecurities.com',
  'morgan stanley': 'morganstanley.com',
  'axis bank': 'axisbank.com',
  'kotak mahindra bank': 'kotak.com',
  'tower research capital': 'tower-research.com',
  'standard chartered': 'sc.com',
  'groww': 'groww.in',
  'grant thornton': 'grantthornton.in',
  'blackstone india': 'blackstone.com',
  'concentrix india': 'concentrix.com',
  'dell technologies': 'dell.com',
  'freshworks': 'freshworks.com',
  'teleperformance': 'teleperformance.com',
  'wns global services': 'wns.com',
  'genpact': 'genpact.com',
  'cognizant service desk': 'cognizant.com',
  'cognizant': 'cognizant.com',
  'foundever': 'foundever.com',
  'taskus india': 'taskus.com',
  'ogilvy india': 'ogilvy.com',
  'zoho corporation': 'zoho.com',
  'zoho': 'zoho.com',
  'nykaa': 'nykaa.com',
  'asian paints': 'asianpaints.com',
  'boat lifestyle': 'boat-lifestyle.com',
  'nestle india': 'nestle.in',
  'nestle': 'nestle.com',
  'edelman india': 'edelman.com',
  'cred': 'cred.club',
  'kirloskar brothers': 'kirloskarpumps.com',
  'mercer india': 'mercer.com',
  'capgemini india': 'capgemini.com',
  'capgemini': 'capgemini.com',
  'mindtree / ltimindtree': 'ltimindtree.com',
  'ltimindtree': 'ltimindtree.com',
  'adp india': 'adp.com',
  'adp': 'adp.com'
};

function getDomain(name = '') {
  const clean = name.toLowerCase().trim();
  if (DOMAIN_MAP[clean]) return DOMAIN_MAP[clean];
  for (const [key, domain] of Object.entries(DOMAIN_MAP)) {
    if (clean.includes(key) || key.includes(clean)) {
      return domain;
    }
  }
  const simple = clean.replace(/[^a-z0-9]/g, '');
  return simple ? `${simple}.com` : 'google.com';
}

// Brand color generation from name for stylish fallback
function getGradient(name = '') {
  const gradients = [
    'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
    'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
    'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
    'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
    'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

export default function CompanyLogo({ company = 'Company', size = 44, className = '', style = {} }) {
  const [errorCount, setErrorCount] = useState(0);

  const domain = getDomain(company);
  const initials = company
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  // Try Google Favicon CDN first (reliable 128px official icon)
  // If fails, try Clearbit, then fallback to initial monogram
  let logoUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  if (errorCount === 1) {
    logoUrl = `https://logo.clearbit.com/${domain}`;
  }

  const containerStyle = {
    width: `${size}px`,
    height: `${size}px`,
    minWidth: `${size}px`,
    minHeight: `${size}px`,
    borderRadius: size > 48 ? '16px' : '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#ffffff',
    padding: size > 48 ? '8px' : '6px',
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
    position: 'relative',
    ...style
  };

  if (errorCount >= 2) {
    // Elegant monogram fallback
    return (
      <div
        className={`company-logo-badge ${className}`}
        style={{
          ...containerStyle,
          background: getGradient(company),
          color: '#ffffff',
          fontWeight: 800,
          fontSize: `${Math.round(size * 0.42)}px`,
          letterSpacing: '0.5px',
          textShadow: '0 1px 3px rgba(0,0,0,0.3)'
        }}
        title={company}
      >
        {initials || <FaBuilding />}
      </div>
    );
  }

  return (
    <div className={`company-logo-wrapper ${className}`} style={containerStyle} title={company}>
      <img
        src={logoUrl}
        alt={`${company} Logo`}
        onError={() => setErrorCount((prev) => prev + 1)}
        loading="lazy"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block'
        }}
      />
    </div>
  );
}

