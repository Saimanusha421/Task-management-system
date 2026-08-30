const nodemailer = require('nodemailer');

// Creates a reusable transporter using credentials from environment variables.
// Sensitive credentials (EMAIL_USER / EMAIL_PASS) are never hard-coded.
const createTransporter = () =>
  nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

/**
 * Send an email. Fails gracefully (logs a warning) instead of crashing
 * the request if email credentials are not configured or sending fails,
 * so core task-management functionality still works during development.
 */
const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn(
      `[email skipped] EMAIL_USER/EMAIL_PASS not configured. Would have sent "${subject}" to ${to}.`
    );
    return { skipped: true };
  }

  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
    return info;
  } catch (error) {
    console.error(`Failed to send email to ${to}: ${error.message}`);
    // Do not throw - email failure should not block the main action (task assignment / status update)
    return { error: error.message };
  }
};

const taskAssignedTemplate = ({ employeeName, taskTitle, priority, adminName }) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
    <h2 style="color: #2563eb;">New Task Assigned</h2>
    <p>Hi ${employeeName},</p>
    <p>A new task has been assigned to you by <strong>${adminName}</strong>.</p>
    <table style="border-collapse: collapse; width: 100%;">
      <tr><td style="padding:8px; font-weight:bold;">Task:</td><td style="padding:8px;">${taskTitle}</td></tr>
      <tr><td style="padding:8px; font-weight:bold;">Priority:</td><td style="padding:8px;">${priority}</td></tr>
    </table>
    <p>Please log in to the Task Management System to view the full details.</p>
    <p style="color:#6b7280; font-size: 12px;">This is an automated notification.</p>
  </div>
`;

const statusUpdatedTemplate = ({ adminName, employeeName, taskTitle, status }) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
    <h2 style="color: #2563eb;">Task Status Updated</h2>
    <p>Hi ${adminName},</p>
    <p><strong>${employeeName}</strong> has updated the status of a task.</p>
    <table style="border-collapse: collapse; width: 100%;">
      <tr><td style="padding:8px; font-weight:bold;">Task:</td><td style="padding:8px;">${taskTitle}</td></tr>
      <tr><td style="padding:8px; font-weight:bold;">New Status:</td><td style="padding:8px;">${status}</td></tr>
    </table>
    <p style="color:#6b7280; font-size: 12px;">This is an automated notification.</p>
  </div>
`;

module.exports = { sendEmail, taskAssignedTemplate, statusUpdatedTemplate };
