// backend/utils/emailService.js — Automated Email Notifications & Google Calendar (.ics) Invites
let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  nodemailer = null;
}

/**
 * Creates reusable transporter.
 * Uses environment SMTP if configured, else creates an Ethereal/mock transport.
 */
function createTransporter() {
  if (!nodemailer) return null;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Fallback test transport
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'campusconnect.dev@ethereal.email',
      pass: 'ethereal_sample_pass'
    }
  });
}

/**
 * Generates RFC 5545 Standard .ics Calendar Invite string
 */
function generateIcs(event) {
  const { title, description, location, startDate, durationMinutes = 45 } = event;
  const start = new Date(startDate);
  const end = new Date(start.getTime() + durationMinutes * 60000);

  const formatDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const now = formatDate(new Date());
  const dtStart = formatDate(start);
  const dtEnd = formatDate(end);
  const uid = `campusconnect-${Date.now()}@campusconnect.edu`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CampusConnect//Placement Cell//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${(description || '').replace(/\n/g, '\\n')}`,
    `LOCATION:${location || 'Virtual Video Call'}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: Upcoming Placement Interview Round',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

/**
 * Send Interview Invitation with Google Calendar .ics Attachment
 */
async function sendInterviewInviteEmail(student, job, interview) {
  const icsContent = generateIcs({
    title: `Placement Interview: ${interview.round_name} (${job.company})`,
    description: `Interview round for role: ${job.title}.\nMode: ${interview.mode}\nDetails: ${interview.location_or_link}\nNotes: ${interview.notes || 'Be on time with college ID and portfolio.'}`,
    location: interview.location_or_link,
    startDate: interview.scheduled_date,
    durationMinutes: interview.duration_minutes || 45
  });

  const mailOptions = {
    from: '"CampusConnect Placement Cell" <placements@campusconnect.edu>',
    to: student.email,
    subject: `📅 Interview Scheduled: ${interview.round_name} at ${job.company}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #fed7aa; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">CampusConnect Placement Portal</h2>
          <p style="margin: 5px 0 0; font-size: 14px;">Official Interview Call Letter & Calendar Invite</p>
        </div>
        <div style="padding: 24px; color: #0f172a; line-height: 1.6;">
          <p>Dear <strong>${student.name}</strong>,</p>
          <p>Congratulations! You have been shortlisted for the next assessment round with <strong>${job.company}</strong> for the <strong>${job.title}</strong> profile.</p>
          
          <div style="background: #fff7ed; border-left: 4px solid #ea580c; padding: 14px; margin: 18px 0; border-radius: 6px;">
            <p style="margin: 0 0 6px 0;"><strong>Round Name:</strong> ${interview.round_name} (${interview.round_type})</p>
            <p style="margin: 0 0 6px 0;"><strong>Date & Time:</strong> ${new Date(interview.scheduled_date).toLocaleString('en-IN')}</p>
            <p style="margin: 0 0 6px 0;"><strong>Duration:</strong> ${interview.duration_minutes} Minutes</p>
            <p style="margin: 0 0 6px 0;"><strong>Mode:</strong> ${interview.mode}</p>
            <p style="margin: 0;"><strong>Meeting / Venue:</strong> <a href="${interview.location_or_link}" style="color: #ea580c; font-weight: bold;">${interview.location_or_link}</a></p>
          </div>

          ${interview.notes ? `<p style="font-size: 13px; color: #64748b; font-style: italic;"><strong>Recruiter Instructions:</strong> ${interview.notes}</p>` : ''}
          
          <p>A Google / Outlook Calendar invitation file (.ics) is attached to this email. Please click <strong>"Add to Calendar"</strong> to prevent any scheduling conflicts.</p>
          <p style="margin-top: 25px;">Best wishes,<br><strong>Training & Placement Cell</strong><br>CampusConnect University</p>
        </div>
      </div>
    `,
    icalEvent: {
      filename: 'interview-invite.ics',
      method: 'REQUEST',
      content: icsContent
    }
  };

  try {
    const transporter = createTransporter();
    if (transporter) {
      await transporter.sendMail(mailOptions);
      console.log(`📧 Interview invite email + .ics calendar event dispatched to ${student.email}`);
    } else {
      console.log(`📧 [Mock Email Dispatch] Interview invite sent to ${student.email}`);
    }
    return { success: true, icsContent };
  } catch (err) {
    console.warn(`Email dispatch error (continuing gracefully):`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Send Official Offer Letter Email
 */
async function sendOfferLetterEmail(student, job, offerDetails) {
  const mailOptions = {
    from: '"CampusConnect Placement Cell" <placements@campusconnect.edu>',
    to: student.email,
    subject: `🎉 Official Selection Offer: ${job.company} — Congratulations!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #86efac; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: #ffffff; padding: 22px; text-align: center;">
          <h2 style="margin: 0;">🎉 Hearty Congratulations!</h2>
          <p style="margin: 5px 0 0; font-size: 15px;">Placement Selection & Offer Release</p>
        </div>
        <div style="padding: 24px; color: #0f172a; line-height: 1.6;">
          <p>Dear <strong>${student.name}</strong>,</p>
          <p>We are delighted to share that you have been formally selected by <strong>${job.company}</strong> for the <strong>${job.title}</strong> role during the campus placement drive!</p>
          
          <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 14px; margin: 18px 0; border-radius: 6px;">
            <p style="margin: 0 0 6px 0;"><strong>Company:</strong> ${job.company}</p>
            <p style="margin: 0 0 6px 0;"><strong>Job Role:</strong> ${job.title}</p>
            <p style="margin: 0 0 6px 0;"><strong>Offered CTC:</strong> ${offerDetails.offered_ctc}</p>
            ${offerDetails.joining_date ? `<p style="margin: 0;"><strong>Tentative Joining:</strong> ${new Date(offerDetails.joining_date).toLocaleDateString('en-IN')}</p>` : ''}
          </div>

          ${offerDetails.offer_letter_url ? `
            <div style="text-align: center; margin: 20px 0;">
              <a href="${offerDetails.offer_letter_url.startsWith('http') ? offerDetails.offer_letter_url : 'http://localhost:5000' + offerDetails.offer_letter_url}" 
                 style="background: #16a34a; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: bold; text-decoration: none; display: inline-block;">
                📥 Download Formal Offer Letter PDF
              </a>
            </div>
          ` : ''}

          <p>Please log in to your CampusConnect student dashboard to review onboarding instructions.</p>
          <p style="margin-top: 25px;">Warm regards,<br><strong>Directorate of Career Development</strong><br>CampusConnect University</p>
        </div>
      </div>
    `
  };

  try {
    const transporter = createTransporter();
    if (transporter) {
      await transporter.sendMail(mailOptions);
      console.log(`📧 Offer letter email dispatched to ${student.email}`);
    } else {
      console.log(`📧 [Mock Email Dispatch] Offer email sent to ${student.email}`);
    }
    return { success: true };
  } catch (err) {
    console.warn(`Offer email dispatch error:`, err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  sendInterviewInviteEmail,
  sendOfferLetterEmail,
  generateIcs
};
