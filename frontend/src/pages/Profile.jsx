// src/pages/Profile.jsx — Student Profile Workspace (Dynamic per logged-in user, warm orange light theme)
import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, uploadResume, deleteResume, resolveAssetUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  FaUser,
  FaIdBadge,
  FaGraduationCap,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaEdit,
  FaCamera,
  FaFileUpload,
  FaGithub,
  FaLinkedin,
  FaTimes,
  FaAward,
  FaCode,
  FaLanguage,
  FaCheck,
  FaCheckCircle,
  FaInfoCircle,
  FaExclamationTriangle,
  FaBriefcase,
  FaBuilding,
  FaShieldAlt,
  FaGlobe,
  FaExternalLinkAlt,
  FaLocationArrow,
  FaFileAlt,
  FaFilePdf,
  FaEye,
  FaTrash
} from 'react-icons/fa';

// Theme tokens matching the website's warm orange/amber light theme
const THEME = {
  bg: '#f8fafc',
  card: '#ffffff',
  cardHover: '#ffffff',
  border: '#e2e8f0',
  borderFocus: '#fed7aa',
  text: '#0f172a',
  muted: '#64748b',
  orange: '#ea580c',
  orangeHover: '#c2410c',
  orangeLight: '#fff7ed',
  orangeBorder: '#fed7aa',
  amber: '#f59e0b',
  amberLight: '#fef3c7',
  amberBorder: '#fde68a',
  emerald: '#10b981',
  emeraldLight: '#dcfce7',
  emeraldDark: '#15803d',
  blueLight: '#e0f2fe',
  blueText: '#0369a1',
  blueBorder: '#bae6fd',
  shadow: '0 4px 18px rgba(0, 0, 0, 0.03)'
};

export default function Profile() {
  const { user, loginUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const resumeFileInputRef = useRef(null);
  const [uploadingResume, setUploadingResume] = useState(false);

  // Helper for full resume URL (handles local /uploads and external http links)
  const getFullResumeUrl = (url) => resolveAssetUrl(url);

  // Dynamic initial profile state — NO hardcoded data of other students
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    institute: '',
    course: '',
    year: '—',
    enrolment: '',
    student_id: user?.id ? `STU${String(user.id).padStart(6, '0')}` : '',
    category_gender: '',
    gender: '',
    category: '',
    dob: '',
    nationality: 'Indian',
    location: '',
    father_name: '',
    mother_name: '',
    area_of_interest: '',
    bio: '',
    cgpa: '',
    branch: '',
    graduation_year: '',
    profile_pic: '',
    resume_url: '',
    college_id_card_uploaded: false,
    ews_certificate_uploaded: false,
    academics: [],
    skills: [],
    locations: [],
    documents: [
      { name: 'Résumé', uploaded: false },
      { name: 'College ID card', uploaded: false },
      { name: 'Covering letter', uploaded: false },
      { name: 'Transcript', uploaded: false },
      { name: 'Document', uploaded: false },
      { name: 'Government ID', uploaded: false },
      { name: 'EWS / income certificate', uploaded: false }
    ],
    languages: [],
    work_experience: [],
    github: '',
    linkedin: ''
  });

  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ ...profile });
  const [activeTab, setActiveTab] = useState('basic');

  // Load profile strictly from database for the logged-in user
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getProfile()
      .then(({ data }) => {
        let meta = {};
        if (data.student_meta) {
          try {
            meta = typeof data.student_meta === 'string' ? JSON.parse(data.student_meta) : data.student_meta;
          } catch (e) {}
        }

        const activeResumeUrl = data.resume_url || meta.resume_url || '';

        const defaultDocs = [
          { name: 'Résumé', uploaded: Boolean(activeResumeUrl) },
          { name: 'College ID card', uploaded: Boolean(meta.college_id_card_uploaded) },
          { name: 'Covering letter', uploaded: false },
          { name: 'Transcript', uploaded: false },
          { name: 'Document', uploaded: false },
          { name: 'Government ID', uploaded: false },
          { name: 'EWS / income certificate', uploaded: Boolean(meta.ews_certificate_uploaded) }
        ];

        const rawDocs = Array.isArray(meta.documents) && meta.documents.length ? meta.documents : defaultDocs;
        const normalizedDocs = rawDocs.map((doc) => {
          if (doc.name === 'Résumé') return { ...doc, uploaded: Boolean(activeResumeUrl) };
          if (doc.name === 'College ID card') return { ...doc, uploaded: Boolean(meta.college_id_card_uploaded) };
          if (doc.name === 'EWS / income certificate') return { ...doc, uploaded: Boolean(meta.ews_certificate_uploaded) };
          return doc;
        });

        const loadedProfile = {
          name: data.name || user.name || '',
          email: data.email || user.email || '',
          phone: data.phone || meta.phone || '',
          cgpa: data.cgpa ? String(data.cgpa) : (meta.cgpa || ''),
          branch: data.branch || meta.branch || '',
          bio: data.bio || meta.bio || '',
          profile_pic: data.profile_pic || meta.profile_pic || '',
          resume_url: activeResumeUrl,
          github: data.github || meta.github || '',
          linkedin: data.linkedin || meta.linkedin || '',
          institute: meta.institute || data.college_id || '',
          course: meta.course || '',
          year: meta.year || '—',
          enrolment: meta.enrolment || '',
          student_id: meta.student_id || (user.id ? `STU${String(user.id).padStart(6, '0')}` : ''),
          category_gender: meta.category_gender || (meta.category && meta.gender ? `${meta.category} · ${meta.gender}` : (meta.category || meta.gender || '')),
          gender: meta.gender || '',
          category: meta.category || '',
          dob: meta.dob || '',
          nationality: meta.nationality || 'Indian',
          location: meta.location || '',
          father_name: meta.father_name || '',
          mother_name: meta.mother_name || '',
          area_of_interest: meta.area_of_interest || '',
          graduation_year: meta.graduation_year || data.graduation_year || '',
          college_id_card_uploaded: Boolean(meta.college_id_card_uploaded),
          ews_certificate_uploaded: Boolean(meta.ews_certificate_uploaded),
          academics: Array.isArray(meta.academics) ? meta.academics : [],
          skills: data.skills
            ? data.skills.split(',').map((s) => s.trim()).filter(Boolean)
            : (Array.isArray(meta.skills) ? meta.skills : []),
          locations: Array.isArray(meta.locations) ? meta.locations : [],
          documents: normalizedDocs,
          languages: Array.isArray(meta.languages) ? meta.languages : [],
          work_experience: Array.isArray(meta.work_experience) ? meta.work_experience : []
        };

        setProfile(loadedProfile);
      })
      .catch((err) => {
        console.error('Failed to load profile:', err);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const openEditModal = (targetField = null) => {
    setEditForm({
      ...profile,
      skillsInput: profile.skills.join(', '),
      locationsInput: profile.locations.join(', ')
    });
    if (targetField === 'bio') setActiveTab('statement');
    else if (targetField === 'skills' || targetField === 'area_of_interest') setActiveTab('skills');
    else if (targetField === 'college_id_card' || targetField === 'ews' || targetField === 'resume') setActiveTab('documents');
    else setActiveTab('basic');
    setModalOpen(true);
  };

  // Direct resume upload via file picker
  const handleDirectResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validExts = ['.pdf', '.doc', '.docx'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validExts.includes(ext)) {
      toast.error('Only PDF, DOC, and DOCX files are allowed!');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB!');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    setUploadingResume(true);
    try {
      const { data } = await uploadResume(formData);
      toast.success('Resume uploaded successfully! 📄');
      setProfile((prev) => ({
        ...prev,
        resume_url: data.resume_url,
        documents: prev.documents.map((d) => (d.name === 'Résumé' ? { ...d, uploaded: true } : d))
      }));
      setEditForm((prev) => ({ ...prev, resume_url: data.resume_url }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload resume');
    } finally {
      setUploadingResume(false);
      if (resumeFileInputRef.current) resumeFileInputRef.current.value = '';
    }
  };

  // Resume upload from inside modal
  const handleModalResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validExts = ['.pdf', '.doc', '.docx'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validExts.includes(ext)) {
      toast.error('Only PDF, DOC, and DOCX files are allowed!');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB!');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    setUploadingResume(true);
    try {
      const { data } = await uploadResume(formData);
      toast.success('Resume uploaded successfully! 📄');
      setEditForm((prev) => ({ ...prev, resume_url: data.resume_url }));
      setProfile((prev) => ({
        ...prev,
        resume_url: data.resume_url,
        documents: prev.documents.map((d) => (d.name === 'Résumé' ? { ...d, uploaded: true } : d))
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload resume');
    } finally {
      setUploadingResume(false);
      e.target.value = '';
    }
  };

  // Remove resume
  const handleDeleteResume = async () => {
    if (!window.confirm('Are you sure you want to remove your attached resume?')) return;
    try {
      await deleteResume();
      toast.success('Resume removed successfully');
      setProfile((prev) => ({
        ...prev,
        resume_url: '',
        documents: prev.documents.map((d) => (d.name === 'Résumé' ? { ...d, uploaded: false } : d))
      }));
      setEditForm((prev) => ({ ...prev, resume_url: '' }));
    } catch (err) {
      toast.error('Failed to remove resume');
    }
  };

  // Profile Completeness calculation based on logged-in student's actual data
  const { completeness, missingFields } = useMemo(() => {
    const checks = [
      { id: 'resume', label: 'Student Résumé', filled: Boolean(profile.resume_url && profile.resume_url.trim()) },
      { id: 'bio', label: 'About Me Statement', filled: Boolean(profile.bio && profile.bio.trim()) },
      { id: 'area_of_interest', label: 'Area of Interest', filled: Boolean(profile.area_of_interest && profile.area_of_interest.trim() && profile.area_of_interest !== '—') },
      { id: 'college_id_card', label: 'College ID Card', filled: Boolean(profile.college_id_card_uploaded) },
      { id: 'ews_certificate', label: 'EWS / income certificate', filled: Boolean(profile.ews_certificate_uploaded) }
    ];
    const missing = checks.filter((c) => !c.filled);
    const resolvedCount = 5 - missing.length;
    // Base 50% for account creation + 10% per completed mandatory field
    const finalPct = Math.round(50 + resolvedCount * 10);
    return { completeness: Math.min(100, finalPct), missingFields: missing };
  }, [profile]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const skillsArray = editForm.skillsInput
      ? editForm.skillsInput.split(',').map((s) => s.trim()).filter(Boolean)
      : profile.skills;
    const locationsArray = editForm.locationsInput
      ? editForm.locationsInput.split(',').map((s) => s.trim()).filter(Boolean)
      : profile.locations;

    // Auto-update academics table entry for graduation if institute/cgpa entered
    const academicsList = [...(profile.academics || [])];
    if (editForm.institute || editForm.cgpa) {
      const idx = academicsList.findIndex((a) => a.qualification === 'Graduation');
      const item = {
        qualification: 'Graduation',
        institute: editForm.institute || '—',
        percentage: editForm.cgpa ? `${editForm.cgpa}` : '—',
        year: editForm.year || '—'
      };
      if (idx >= 0) academicsList[idx] = item;
      else academicsList.push(item);
    }

    const updatedProfile = {
      ...editForm,
      skills: skillsArray,
      locations: locationsArray,
      academics: academicsList,
      category_gender: (editForm.category && editForm.gender) ? `${editForm.category} · ${editForm.gender}` : (editForm.category || editForm.gender || '')
    };

    setProfile(updatedProfile);

    try {
      const parsedCgpa = parseFloat(updatedProfile.cgpa);
      const safeCgpa = !isNaN(parsedCgpa) && parsedCgpa >= 0 && parsedCgpa <= 10 ? parsedCgpa : null;

      const payload = {
        name: updatedProfile.name,
        phone: updatedProfile.phone,
        cgpa: safeCgpa,
        branch: updatedProfile.branch || updatedProfile.course,
        bio: updatedProfile.bio,
        skills: skillsArray.join(', '),
        resume_url: updatedProfile.resume_url,
        github: updatedProfile.github,
        linkedin: updatedProfile.linkedin,
        college_id: (updatedProfile.institute || '').substring(0, 50),
        profile_pic: updatedProfile.profile_pic,
        student_meta: updatedProfile
      };

      await updateProfile(payload);
      toast.success('Profile updated successfully! 🚀');

      if (user && updatedProfile.name !== user.name) {
        loginUser({ ...user, name: updatedProfile.name }, localStorage.getItem('token'));
      }
    } catch (err) {
      toast.error('Failed to save profile');
    }
    setModalOpen(false);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target.result;
      setProfile((prev) => ({ ...prev, profile_pic: dataUrl }));
      toast.success('Profile picture updated!');
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', background: THEME.bg, color: THEME.muted, fontSize: '1.1rem' }}>
        Loading student profile workspace...
      </div>
    );
  }

  const avatarEmoji = profile.name ? String.fromCodePoint(0x1f313 + (profile.name.charCodeAt(0) % 12)) : '🎓';

  return (
    <div style={{ minHeight: '100vh', background: THEME.bg, color: THEME.text, paddingBottom: '3.5rem' }}>
      <main className="container" style={{ maxWidth: '1180px', padding: '1.8rem 1.4rem', margin: '0 auto' }}>
        
        {/* ==================================================== */}
        {/* 1. Incomplete Profile Alert Card                     */}
        {/* ==================================================== */}
        <div
          style={{
            background: '#fffdf5',
            border: '1px solid #fed7aa',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '1.6rem',
            boxShadow: '0 4px 18px rgba(249, 115, 22, 0.05)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ background: '#ea580c', color: '#ffffff', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.74rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', letterSpacing: '0.3px' }}>
                <FaInfoCircle /> {completeness === 100 ? 'PROFILE 100% COMPLETE' : `INCOMPLETE PROFILE (${completeness}% COMPLETED)`}
              </span>
              {missingFields.length > 0 && (
                <span style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.74rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <FaExclamationTriangle /> {missingFields.length} mandatory fields remaining
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => openEditModal()}
              style={{
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '0.6rem 1.35rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.86rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
            >
              ✨ {missingFields.length > 0 ? `Complete Missing Fields (${missingFields.length})` : 'Edit Profile Details'}
            </button>
          </div>

          <h2 style={{ margin: '0 0 0.4rem 0', fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.3 }}>
            Complete missing profile details to unlock 100% internship eligibility
          </h2>
          <p style={{ color: '#475569', fontSize: '0.88rem', margin: '0 0 1.1rem 0', lineHeight: 1.5 }}>
            Employers and government schemes require full information before reviewing applications. Click any missing item below to fill it immediately:
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FaIdBadge style={{ color: '#ea580c' }} /> Profile Completeness
            </span>
            <span style={{ color: '#ea580c', fontWeight: 800, fontSize: '0.86rem' }}>{completeness}% Completed</span>
          </div>

          <div style={{ background: '#e2e8f0', height: 9, borderRadius: '6px', overflow: 'hidden', marginBottom: '1.3rem' }}>
            <div style={{ background: 'linear-gradient(90deg, #ea580c 0%, #f59e0b 50%, #10b981 100%)', height: '100%', width: `${completeness}%`, borderRadius: '6px', transition: 'width 0.6s ease' }} />
          </div>

          {missingFields.length > 0 && (
            <>
              <div style={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
                FIELDS AWAITING YOUR INPUT:
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                {missingFields.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openEditModal(item.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.55rem',
                      background: '#ffffff',
                      border: '1.5px solid #fed7aa',
                      color: '#c2410c',
                      padding: '0.45rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: '0 1px 4px rgba(234, 88, 12, 0.08)',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ea580c', display: 'inline-block' }} />
                    {item.label}
                    <span style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa', fontSize: '0.7rem', padding: '0.12rem 0.5rem', borderRadius: '10px', fontWeight: 800 }}>Fill ↗</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ==================================================== */}
        {/* 2. Workspace Hero Card                               */}
        {/* ==================================================== */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '18px',
            overflow: 'hidden',
            marginBottom: '1.6rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
          }}
        >
          {/* Top Banner Gradient */}
          <div
            style={{
              background: 'linear-gradient(135deg, #f97316 0%, #ec4899 45%, #7c3aed 100%)',
              padding: '1.8rem 2.2rem',
              color: '#ffffff'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <span style={{ background: 'rgba(255, 255, 255, 0.22)', backdropFilter: 'blur(4px)', color: '#ffffff', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                <FaCheckCircle style={{ marginRight: '0.35rem' }} /> INSTITUTE-VERIFIED STUDENT
              </span>
              <button
                type="button"
                onClick={() => openEditModal()}
                style={{
                  background: '#ffffff',
                  color: '#0f172a',
                  border: 'none',
                  padding: '0.55rem 1.2rem',
                  borderRadius: '20px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)'
                }}
              >
                <FaEdit style={{ color: '#ea580c' }} /> Edit Profile
              </button>
            </div>
            <h1 style={{ margin: '0 0 0.35rem 0', fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px' }}>
              Student Profile Workspace
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.92)', fontSize: '0.88rem', margin: 0 }}>
              Email verified · CampusConnect Portal
            </p>
          </div>

          {/* User Details Strip */}
          <div style={{ padding: '1.4rem 2.2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '3px solid #ffffff',
                  background: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 40,
                  position: 'relative',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                {profile.profile_pic ? (
                  <img src={profile.profile_pic} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span>{avatarEmoji}</span>
                )}
                <label
                  htmlFor="profile-pic-input"
                  style={{
                    position: 'absolute',
                    bottom: 4,
                    right: 4,
                    background: '#ea580c',
                    color: '#ffffff',
                    borderRadius: '50%',
                    width: 30,
                    height: 30,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    border: '2px solid #ffffff',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                  }}
                  title="Change profile picture"
                >
                  <FaCamera />
                </label>
                <input id="profile-pic-input" type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} ref={fileInputRef} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800, fontSize: '1.35rem', marginBottom: '0.35rem', color: '#0f172a' }}>
                {profile.name || user?.name || 'Student'}
                <span style={{ background: '#dcfce7', color: '#15803d', padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800 }}>
                  ACTIVE STUDENT
                </span>
              </div>
              <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', color: '#64748b', fontSize: '0.85rem' }}>
                <span>
                  <FaGraduationCap style={{ marginRight: '0.35rem', color: '#ea580c' }} />
                  Enrolment: <strong style={{ color: '#0f172a' }}>{profile.enrolment || '—'}</strong>
                </span>
                <span>
                  <FaIdBadge style={{ marginRight: '0.35rem', color: '#ea580c' }} />
                  ID: <strong style={{ color: '#0f172a' }}>{profile.student_id || (user?.id ? `STU${String(user.id).padStart(6, '0')}` : '—')}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* 3. Attribute Details Grid (12 Cells)                 */}
        {/* ==================================================== */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
            marginBottom: '1.6rem'
          }}
        >
          {[
            { label: 'INSTITUTE', value: profile.institute || '—', icon: FaBuilding, iconColor: '#ea580c' },
            { label: 'EMAIL ADDRESS', value: profile.email || user?.email || '—', icon: FaEnvelope, iconColor: '#ea580c' },
            { label: 'CONTACT INFO', value: profile.phone || '—', icon: FaPhone, iconColor: '#10b981' },
            { label: 'CATEGORY & GENDER', value: profile.category_gender || '—', icon: FaShieldAlt, iconColor: '#f59e0b' },
            { label: 'COURSE & STREAM', value: profile.course || '—', icon: FaGraduationCap, iconColor: '#ea580c' },
            { label: 'YEAR', value: profile.year || '—', icon: FaCalendarAlt, iconColor: '#10b981' },
            { label: 'LOCATION', value: profile.location || '—', icon: FaLocationArrow, iconColor: '#ea580c' },
            { label: 'NATIONALITY', value: profile.nationality || 'Indian', icon: FaGlobe, iconColor: '#0284c7' },
            { label: 'DATE OF BIRTH', value: profile.dob || '—', icon: FaCalendarAlt, iconColor: '#0284c7' },
            { label: "FATHER'S NAME", value: profile.father_name || '—', icon: FaUser, iconColor: '#0284c7' },
            { label: "MOTHER'S NAME", value: profile.mother_name || '—', icon: FaUser, iconColor: '#0284c7' },
            { label: 'AREA OF INTEREST', value: profile.area_of_interest || '—', icon: FaLocationArrow, iconColor: '#f59e0b' }
          ].map((field, i) => (
            <div
              key={i}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '1.1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)'
              }}
            >
              <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <field.icon style={{ color: field.iconColor, fontSize: '0.85rem' }} />
                {field.label}
              </div>
              <div style={{ color: field.value === '—' ? '#94a3b8' : '#0f172a', fontSize: '0.92rem', fontWeight: 600, wordBreak: 'break-word' }}>
                {field.value}
              </div>
            </div>
          ))}
        </div>

        {/* ==================================================== */}
        {/* 4. About Me & Professional Statement                 */}
        {/* ==================================================== */}
        {renderSection('ABOUT ME & PROFESSIONAL STATEMENT', FaUser, '#ea580c', (
          <div style={{ background: '#fffdf5', border: '1px solid #fef08a', borderRadius: '12px', padding: '1.25rem' }}>
            <p style={{ color: profile.bio ? '#1e293b' : '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
              {profile.bio ? `"${profile.bio}"` : 'No statement added yet. Click \'Edit Profile\' to write about yourself.'}
            </p>
          </div>
        ))}

        {/* ==================================================== */}
        {/* 5. Uploaded Documents & Résumé Management            */}
        {/* ==================================================== */}
        {renderSection('RÉSUMÉ & UPLOADED DOCUMENTS', FaFileUpload, '#ea580c', (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {/* Hidden file input for direct upload */}
            <input
              type="file"
              ref={resumeFileInputRef}
              accept=".pdf,.doc,.docx"
              onChange={handleDirectResumeUpload}
              style={{ display: 'none' }}
            />

            {/* Resume Hero Box */}
            <div
              style={{
                background: profile.resume_url ? '#f0fdf4' : '#fffbeb',
                border: `1.5px solid ${profile.resume_url ? '#bbf7d0' : '#fde68a'}`,
                borderRadius: '14px',
                padding: '1.25rem 1.4rem',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: profile.resume_url ? '#dcfce7' : '#fef3c7',
                    color: profile.resume_url ? '#16a34a' : '#d97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem'
                  }}
                >
                  <FaFilePdf />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.98rem', color: '#0f172a' }}>
                      Primary Placement Résumé
                    </span>
                    {profile.resume_url ? (
                      <span
                        style={{
                          background: '#16a34a',
                          color: '#ffffff',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.6rem',
                          borderRadius: '10px'
                        }}
                      >
                        ATTACHED
                      </span>
                    ) : (
                      <span
                        style={{
                          background: '#ea580c',
                          color: '#ffffff',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.6rem',
                          borderRadius: '10px'
                        }}
                      >
                        MISSING
                      </span>
                    )}
                  </div>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: profile.resume_url ? '#15803d' : '#b45309' }}>
                    {profile.resume_url
                      ? 'Companies and campus placement drives will automatically receive this resume.'
                      : '⚠️ Warning: Recruiter drives require a résumé to shortlist your profile!'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                {profile.resume_url ? (
                  <>
                    <a
                      href={getFullResumeUrl(profile.resume_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: '#ffffff',
                        border: '1.5px solid #16a34a',
                        color: '#16a34a',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        textDecoration: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <FaEye /> View Résumé
                    </a>
                    <button
                      type="button"
                      disabled={uploadingResume}
                      onClick={() => resumeFileInputRef.current?.click()}
                      style={{
                        background: '#16a34a',
                        border: 'none',
                        color: '#ffffff',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        cursor: 'pointer'
                      }}
                    >
                      <FaFileUpload /> {uploadingResume ? 'Uploading...' : 'Replace'}
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteResume}
                      title="Remove Resume"
                      style={{
                        background: '#fee2e2',
                        border: '1px solid #fca5a5',
                        color: '#dc2626',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <FaTrash />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      disabled={uploadingResume}
                      onClick={() => resumeFileInputRef.current?.click()}
                      style={{
                        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                        border: 'none',
                        color: '#ffffff',
                        padding: '0.55rem 1.25rem',
                        borderRadius: '8px',
                        fontSize: '0.86rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)'
                      }}
                    >
                      <FaFileUpload /> {uploadingResume ? 'Uploading...' : 'Upload Résumé (.PDF, .DOCX)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal('resume')}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #fed7aa',
                        color: '#ea580c',
                        padding: '0.55rem 1rem',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Add Cloud Link
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Verification Documents Pills */}
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.55rem' }}>
                Additional Verification Documents:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                {profile.documents.map((doc, idx) => {
                  const isUploaded = doc.uploaded;
                  return (
                    <span
                      key={idx}
                      style={{
                        background: isUploaded ? '#e0f2fe' : '#ffffff',
                        color: isUploaded ? '#0369a1' : '#64748b',
                        border: `1.5px solid ${isUploaded ? '#bae6fd' : '#e2e8f0'}`,
                        padding: '0.45rem 1rem',
                        borderRadius: '20px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
                      }}
                    >
                      {isUploaded ? <FaCheck style={{ fontSize: '0.72rem', color: '#0284c7' }} /> : null}
                      {doc.name}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        ))}

        {/* ==================================================== */}
        {/* 6. Academic Qualifications & History                 */}
        {/* ==================================================== */}
        {renderSection('ACADEMIC QUALIFICATIONS & EDUCATIONAL HISTORY', FaGraduationCap, '#ea580c', (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            {profile.academics && profile.academics.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ textAlign: 'left', padding: '0.85rem 1.2rem', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700, borderBottom: '1px solid #e2e8f0' }}>Qualification</th>
                    <th style={{ textAlign: 'left', padding: '0.85rem 1.2rem', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700, borderBottom: '1px solid #e2e8f0' }}>Name of Institute</th>
                    <th style={{ textAlign: 'right', padding: '0.85rem 1.2rem', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700, borderBottom: '1px solid #e2e8f0' }}>Percentage / CGPA</th>
                    <th style={{ textAlign: 'right', padding: '0.85rem 1.2rem', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700, borderBottom: '1px solid #e2e8f0' }}>Year / Date of Completion</th>
                  </tr>
                </thead>
                <tbody>
                  {profile.academics.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.85rem 1.2rem', color: '#0f172a', fontWeight: 600 }}>{row.qualification}</td>
                      <td style={{ padding: '0.85rem 1.2rem', color: '#334155' }}>{row.institute}</td>
                      <td style={{ textAlign: 'right', padding: '0.85rem 1.2rem', color: '#15803d', fontWeight: 700 }}>{row.percentage}</td>
                      <td style={{ textAlign: 'right', padding: '0.85rem 1.2rem', color: '#475569' }}>{row.year}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ color: '#94a3b8', fontSize: '0.88rem', textAlign: 'center', padding: '1.4rem' }}>
                No academic qualifications recorded yet. Click &apos;Edit Profile&apos; to add your qualifications.
              </div>
            )}
          </div>
        ))}

        {/* ==================================================== */}
        {/* 7. Locations & Technical Skills                      */}
        {/* ==================================================== */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.6rem' }}>
          {renderSection('PREFERRED INTERNSHIP LOCATIONS', FaLocationArrow, '#ea580c', (
            <div>
              {profile.locations && profile.locations.length ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem' }}>
                  {profile.locations.map((loc, idx) => (
                    <span key={idx} style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}>
                      <FaMapMarkerAlt style={{ color: '#ea580c', fontSize: '0.75rem', marginRight: '0.4rem' }} /> {loc}
                    </span>
                  ))}
                </div>
              ) : (
                <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No locations selected yet.</div>
              )}
            </div>
          ))}
          {renderSection('TECHNICAL & DOMAIN SKILLS', FaCode, '#ea580c', (
            <div>
              {profile.skills && profile.skills.length ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem' }}>
                  {profile.skills.map((skill, idx) => (
                    <span key={idx} style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}>
                      <FaCheckCircle style={{ color: '#ea580c', fontSize: '0.75rem', marginRight: '0.4rem' }} /> {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No skills added yet.</div>
              )}
            </div>
          ))}
        </div>

        {/* ==================================================== */}
        {/* 8. Languages & Certifications                        */}
        {/* ==================================================== */}
        {renderSection('LANGUAGES, CERTIFICATIONS & ACHIEVEMENTS', FaLanguage, '#ea580c', (
          <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
            {profile.languages && profile.languages.length ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {profile.languages.map((lang, idx) => (
                  <span key={idx} style={{ background: '#f8fafc', color: '#334155', border: '1px solid #e2e8f0', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 600 }}>
                    {lang}
                  </span>
                ))}
              </div>
            ) : (
              <>
                <p style={{ marginBottom: '0.4rem', color: '#475569', fontWeight: 500 }}>No languages listed yet.</p>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>Nothing recorded yet — add it under Languages &amp; Certifications in Edit Profile.</p>
              </>
            )}
          </div>
        ))}

        {/* ==================================================== */}
        {/* 9. Work Experience                                   */}
        {/* ==================================================== */}
        {renderSection('WORK EXPERIENCE', FaBriefcase, '#ea580c', (
          <div>
            {profile.work_experience && profile.work_experience.length ? (
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ textAlign: 'left', padding: '0.8rem 1rem', color: '#475569', fontSize: '0.74rem', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>Organisation</th>
                      <th style={{ textAlign: 'left', padding: '0.8rem 1rem', color: '#475569', fontSize: '0.74rem', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>Type</th>
                      <th style={{ textAlign: 'left', padding: '0.8rem 1rem', color: '#475569', fontSize: '0.74rem', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>Years / Months</th>
                      <th style={{ textAlign: 'left', padding: '0.8rem 1rem', color: '#475569', fontSize: '0.74rem', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>Responsibilities</th>
                      <th style={{ textAlign: 'left', padding: '0.8rem 1rem', color: '#475569', fontSize: '0.74rem', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>Awards</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profile.work_experience.map((w, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.8rem 1rem', color: '#0f172a', fontWeight: 600 }}>{w.organisation}</td>
                        <td style={{ padding: '0.8rem 1rem', color: '#334155' }}>{w.type}</td>
                        <td style={{ padding: '0.8rem 1rem', color: '#334155' }}>{w.duration}</td>
                        <td style={{ padding: '0.8rem 1rem', color: '#334155' }}>{w.responsibilities}</td>
                        <td style={{ padding: '0.8rem 1rem', color: '#64748b' }}>{w.awards || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ color: '#94a3b8', fontSize: '0.88rem', textAlign: 'center', padding: '1.2rem' }}>
                No work experience added yet.
              </div>
            )}
          </div>
        ))}

        {/* ==================================================== */}
        {/* 10. External Profiles                                */}
        {/* ==================================================== */}
        {renderSection('EXTERNAL PROFILES', FaExternalLinkAlt, '#ea580c', (
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {profile.github ? (
              <a
                href={profile.github.startsWith('http') ? profile.github : `https://${profile.github}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: '#ffffff',
                  color: '#0f172a',
                  border: '1px solid #e2e8f0',
                  padding: '0.55rem 1.1rem',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                }}
              >
                <FaGithub style={{ fontSize: '1rem', color: '#0f172a' }} /> GitHub: {profile.github}
              </a>
            ) : null}
            {profile.linkedin ? (
              <a
                href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: '#ffffff',
                  color: '#0f172a',
                  border: '1px solid #e2e8f0',
                  padding: '0.55rem 1.1rem',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                }}
              >
                <FaLinkedin style={{ color: '#0284c7', fontSize: '1rem' }} /> LinkedIn: {profile.linkedin}
              </a>
            ) : null}
            {!profile.github && !profile.linkedin && (
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>No external profiles linked yet.</p>
            )}
          </div>
        ))}

        {/* ==================================================== */}
        {/* 11. Certificates                                     */}
        {/* ==================================================== */}
        {renderSection('CERTIFICATES', FaAward, '#ea580c', (
          <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.5, margin: 0 }}>
            Certificates appear here when a government body, PSU or the Indian Army marks your internship completed. Private companies issue the certificate directly — ask the company for it.
          </p>
        ))}
      </main>

      {/* ==================================================== */}
      {/* EDIT PROFILE MODAL (WARM LIGHT THEME)                */}
      {/* ==================================================== */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '18px',
              width: 'min(900px, 94vw)',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.6rem', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <FaEdit style={{ color: '#ea580c', fontSize: '1.2rem' }} />
                <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f172a' }}>Edit Student Profile Details</span>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.4rem', lineHeight: 1 }}
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', padding: '0.8rem 1.6rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', overflowX: 'auto' }}>
              {[
                { id: 'basic', label: 'Personal Info' },
                { id: 'academic', label: 'Academics & College' },
                { id: 'statement', label: 'Statement & Bio' },
                { id: 'skills', label: 'Skills & Locations' },
                { id: 'documents', label: 'Documents & Verification' },
                { id: 'links', label: 'Social & External' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    background: activeTab === tab.id ? '#fff7ed' : 'transparent',
                    color: activeTab === tab.id ? '#ea580c' : '#64748b',
                    border: 'none',
                    borderBottom: activeTab === tab.id ? '2px solid #ea580c' : '2px solid transparent',
                    padding: '0.5rem 0.95rem',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    borderRadius: '6px 6px 0 0'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveProfile} style={{ padding: '1.5rem 1.6rem' }}>
              {activeTab === 'basic' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.1rem' }}>
                  {renderField('Full Name', 'text', editForm.name, (v) => setEditForm({ ...editForm, name: v }), true)}
                  {renderField('Email Address', 'email', editForm.email, (v) => setEditForm({ ...editForm, email: v }), true)}
                  {renderField('Contact Number', 'tel', editForm.phone, (v) => setEditForm({ ...editForm, phone: v }), false, 'e.g. 9876543210')}
                  {renderField('Date of Birth', 'text', editForm.dob, (v) => setEditForm({ ...editForm, dob: v }), undefined, 'e.g. 15 Aug 2004')}
                  {renderField('Gender', undefined, editForm.gender, (v) => setEditForm({ ...editForm, gender: v }), undefined, undefined, ['MALE', 'FEMALE', 'OTHER'])}
                  {renderField('Category', undefined, editForm.category, (v) => setEditForm({ ...editForm, category: v }), undefined, undefined, ['EWS', 'GENERAL', 'OBC', 'SC', 'ST'])}
                  {renderField('Location', 'text', editForm.location, (v) => setEditForm({ ...editForm, location: v }), false, 'e.g. Delhi, Noida, Varanasi')}
                  {renderField('Nationality', 'text', editForm.nationality, (v) => setEditForm({ ...editForm, nationality: v }))}
                  {renderField("Father's Name", 'text', editForm.father_name, (v) => setEditForm({ ...editForm, father_name: v }), false, "e.g. Father's Name")}
                  {renderField("Mother's Name", 'text', editForm.mother_name, (v) => setEditForm({ ...editForm, mother_name: v }), false, "e.g. Mother's Name")}
                </div>
              )}

              {activeTab === 'academic' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.1rem' }}>
                  {renderField('Institute / University', 'text', editForm.institute, (v) => setEditForm({ ...editForm, institute: v }), false, 'e.g. IIT, NIT, State University')}
                  {renderField('Course & Stream', 'text', editForm.course, (v) => setEditForm({ ...editForm, course: v }), false, 'e.g. B.Tech Computer Science')}
                  {renderField('Enrolment Number', 'text', editForm.enrolment, (v) => setEditForm({ ...editForm, enrolment: v }), false, 'e.g. ENR-2024-001')}
                  {renderField('Student Portal ID', 'text', editForm.student_id, (v) => setEditForm({ ...editForm, student_id: v }))}
                  {renderField('Current Year', 'text', editForm.year, (v) => setEditForm({ ...editForm, year: v }), undefined, 'e.g. 3rd Year, Final Year')}
                  {renderField('CGPA (0.0 - 10.0)', 'text', editForm.cgpa, (v) => setEditForm({ ...editForm, cgpa: v }), undefined, 'e.g. 7.5 or 8.2')}
                </div>
              )}

              {activeTab === 'statement' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.1rem' }}>
                  {renderField('About Me & Professional Statement', undefined, editForm.bio, (v) => setEditForm({ ...editForm, bio: v }), undefined, 'Write a short professional summary about your career goals and interests...', undefined, 'textarea')}
                  {renderField('Area of Interest', 'text', editForm.area_of_interest, (v) => setEditForm({ ...editForm, area_of_interest: v }), undefined, 'e.g. Full Stack Development, Cloud Computing, AI')}
                </div>
              )}

              {activeTab === 'skills' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.1rem' }}>
                  {renderField('Technical Skills (comma separated)', 'text', editForm.skillsInput, (v) => setEditForm({ ...editForm, skillsInput: v }), undefined, 'e.g. Java, Python, React.js, Node.js, SQL')}
                  {renderField('Preferred Locations (comma separated)', 'text', editForm.locationsInput, (v) => setEditForm({ ...editForm, locationsInput: v }), undefined, 'e.g. Bangalore, Noida, Hyderabad')}
                </div>
              )}

              {activeTab === 'documents' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
                  {/* Primary Resume Section */}
                  <div style={{ background: '#fff7ed', border: '1.5px dashed #fed7aa', borderRadius: '12px', padding: '1.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#9a3412', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaFileUpload /> Placement Résumé (.pdf, .doc, .docx)
                      </span>
                      {editForm.resume_url ? (
                        <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.78rem', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 700 }}>
                          ✓ Attached
                        </span>
                      ) : (
                        <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: '0.78rem', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 700 }}>
                          Required
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.9rem' }}>
                      <label style={{
                        background: '#ea580c',
                        color: '#ffffff',
                        padding: '0.55rem 1.1rem',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem'
                      }}>
                        <FaFileUpload /> {uploadingResume ? 'Uploading...' : 'Upload File (.pdf / .docx)'}
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleModalResumeUpload}
                          disabled={uploadingResume}
                          style={{ display: 'none' }}
                        />
                      </label>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Max file size 5MB</span>
                    </div>

                    {renderField('Or Paste Cloud Résumé URL (Google Drive / OneDrive / Portfolio)', 'url', editForm.resume_url, (v) => setEditForm({ ...editForm, resume_url: v }), undefined, 'https://drive.google.com/file/d/...')}

                    {editForm.resume_url && (
                      <div style={{ marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                        <a
                          href={getFullResumeUrl(editForm.resume_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#ea580c', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'underline' }}
                        >
                          Preview Attached Resume
                        </a>
                        <button
                          type="button"
                          onClick={() => setEditForm({ ...editForm, resume_url: '' })}
                          style={{ color: '#ef4444', background: 'none', border: 'none', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  {renderCheckbox('College ID Card', 'Upload or verify college ID badge', editForm.college_id_card_uploaded, (v) => setEditForm({ ...editForm, college_id_card_uploaded: v }))}
                  {renderCheckbox('EWS / Income Certificate', 'Certificate verification for reserved schemes', editForm.ews_certificate_uploaded, (v) => setEditForm({ ...editForm, ews_certificate_uploaded: v }))}
                </div>
              )}

              {activeTab === 'links' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.1rem' }}>
                  {renderField('Profile Photo URL', 'text', editForm.profile_pic, (v) => setEditForm({ ...editForm, profile_pic: v }), undefined, 'https://...')}
                  {renderField('GitHub Profile URL', 'url', editForm.github, (v) => setEditForm({ ...editForm, github: v }), undefined, 'github.com/username')}
                  {renderField('LinkedIn Profile URL', 'url', editForm.linkedin, (v) => setEditForm({ ...editForm, linkedin: v }), undefined, 'linkedin.com/in/username')}
                </div>
              )}

              {/* Modal Footer Buttons */}
              <div style={{ marginTop: '1.8rem', display: 'flex', justifyContent: 'flex-end', gap: '0.85rem' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', padding: '0.65rem 1.4rem', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.65rem 1.8rem',
                    borderRadius: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(234, 88, 12, 0.35)'
                  }}
                >
                  Save & Update Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  function renderSection(title, Icon, iconColor, content) {
    return (
      <div
        key={title}
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '1.6rem',
          boxShadow: '0 4px 18px rgba(0, 0, 0, 0.03)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.1rem' }}>
          <Icon style={{ color: iconColor || '#ea580c', fontSize: '1.1rem' }} />
          <span style={{ fontWeight: 800, fontSize: '0.98rem', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{title}</span>
        </div>
        {content}
      </div>
    );
  }

  function renderField(label, type, value, onChange, required, placeholder, options, asTextarea) {
    const isSelect = !!options;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</label>
        {asTextarea ? (
          <textarea
            rows={3}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
              padding: '0.75rem 0.95rem',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              color: '#0f172a',
              fontSize: '0.9rem',
              fontFamily: 'inherit',
              resize: 'vertical',
              outline: 'none'
            }}
            placeholder={placeholder}
          />
        ) : isSelect ? (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            style={{
              padding: '0.75rem 0.95rem',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              color: value ? '#0f172a' : '#94a3b8',
              fontSize: '0.9rem',
              fontFamily: 'inherit',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="">— Select {label} —</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : (
          <input
            type={type || 'text'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            style={{
              padding: '0.75rem 0.95rem',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              color: '#0f172a',
              fontSize: '0.9rem',
              fontFamily: 'inherit',
              outline: 'none'
            }}
          />
        )}
      </div>
    );
  }

  function renderCheckbox(label, desc, checked, onChange) {
    return (
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{label}</div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{desc}</div>
        </div>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            style={{ width: 18, height: 18, accentColor: '#ea580c' }}
          />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>Mark Uploaded</span>
        </label>
      </div>
    );
  }
}
