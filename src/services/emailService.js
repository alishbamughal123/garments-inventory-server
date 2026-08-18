import dotenv from 'dotenv';
dotenv.config();

import nodemailer from 'nodemailer';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { BrevoClient } = require('@getbrevo/brevo');

// EMAIL_PROVIDER=gmail | resend  (default: gmail)
const PROVIDER = (process.env.EMAIL_PROVIDER || 'gmail').toLowerCase();



// ── Brevo ─────────────────────────────────────────────────────────────────────
let brevoClient = null;
    brevoClient = new BrevoClient({
        apiKey: process.env.BREVO_API_KEY
    });


// ── from address ──────────────────────────────────────────────────────────────
const fromAddress = (name) => {
    const appName = name || process.env.APP_NAME || 'Your App';
    return `"${appName}" <${process.env.EMAIL_USER}>`;
};

// ── internal send helper ──────────────────────────────────────────────────────
const sendMail = async ({ to, subject, html, fromName }) => {
    const appName = fromName || process.env.APP_NAME || 'Your App';
        await brevoClient.transactionalEmails.sendTransacEmail({
            sender: {
                email: process.env.EMAIL_FROM || process.env.EMAIL_USER,
                name: appName
            },
            to: [{ email: to }],
            subject,
            htmlContent: html
        });
};
