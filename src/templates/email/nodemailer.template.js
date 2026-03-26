/** @format */

"use strict";

function nodemailerTemplate(cfg) {
  const isTS = cfg.language === "typescript";

  if (isTS) {
    return `import nodemailer from 'nodemailer';
import { env } from '../config/env.config';
import { logger } from '../config/logger.config';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
});

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendMail(options: MailOptions): Promise<void> {
  await transporter.sendMail({
    from: \`"\${env.SMTP_FROM_NAME}" <\${env.SMTP_FROM_EMAIL}>\`,
    ...options,
  });
  logger.info(\`Email sent to \${options.to}: \${options.subject}\`);
}

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  await sendMail({
    to,
    subject: 'Welcome to ${cfg.projectName}! 🎉',
    html: \`
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h1 style="color:#4F46E5;">Welcome, \${name}!</h1>
        <p>Your account has been successfully created.</p>
        <p>Get started by logging into your dashboard.</p>
        <br/>
        <p>Best regards,<br/><strong>${cfg.projectName} Team</strong></p>
      </div>
    \`,
  });
}

export async function sendPasswordResetEmail(
  to: string,
  resetToken: string,
  resetUrl: string,
): Promise<void> {
  await sendMail({
    to,
    subject: 'Reset Your Password',
    html: \`
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h1 style="color:#4F46E5;">Password Reset Request</h1>
        <p>Click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="\${resetUrl}?token=\${resetToken}"
           style="display:inline-block;padding:12px 24px;background:#4F46E5;color:#fff;text-decoration:none;border-radius:6px;margin:16px 0;">
          Reset Password
        </a>
        <p>If you didn't request this, please ignore this email.</p>
        <br/>
        <p>Best regards,<br/><strong>${cfg.projectName} Team</strong></p>
      </div>
    \`,
  });
}
`;
  }

  return `import nodemailer from 'nodemailer';
import { env } from '../config/env.config.js';
import { logger } from '../config/logger.config.js';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
});

async function sendMail({ to, subject, html }) {
  await transporter.sendMail({
    from: \`"\${env.SMTP_FROM_NAME}" <\${env.SMTP_FROM_EMAIL}>\`,
    to,
    subject,
    html,
  });
  logger.info(\`Email sent to \${to}: \${subject}\`);
}

export async function sendWelcomeEmail(to, name) {
  await sendMail({
    to,
    subject: 'Welcome to ${cfg.projectName}! 🎉',
    html: \`
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h1 style="color:#4F46E5;">Welcome, \${name}!</h1>
        <p>Your account has been successfully created.</p>
        <p>Get started by logging into your dashboard.</p>
        <br/>
        <p>Best regards,<br/><strong>${cfg.projectName} Team</strong></p>
      </div>
    \`,
  });
}

export async function sendPasswordResetEmail(to, resetToken, resetUrl) {
  await sendMail({
    to,
    subject: 'Reset Your Password',
    html: \`
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h1 style="color:#4F46E5;">Password Reset Request</h1>
        <p>Click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="\${resetUrl}?token=\${resetToken}"
           style="display:inline-block;padding:12px 24px;background:#4F46E5;color:#fff;text-decoration:none;border-radius:6px;margin:16px 0;">
          Reset Password
        </a>
        <p>If you didn't request this, please ignore this email.</p>
        <br/>
        <p>Best regards,<br/><strong>${cfg.projectName} Team</strong></p>
      </div>
    \`,
  });
}
`;
}

module.exports = { nodemailerTemplate };
