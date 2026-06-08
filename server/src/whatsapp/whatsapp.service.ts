import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface SendTextOptions { to: string; message: string; }

@Injectable()
export class WhatsAppService implements OnModuleInit {
  private readonly logger = new Logger(WhatsAppService.name);
  private client: AxiosInstance;
  private sessionId: string;
  private _connected = false;
  private _phone: string | null = null;

  constructor(private config: ConfigService) {}

  async onModuleInit() {
    const url    = this.config.get<string>('OPENWA_URL');
    const apiKey = this.config.get<string>('OPENWA_API_KEY');
    this.sessionId = this.config.get<string>('OPENWA_SESSION_ID', '');

    if (!url || !apiKey || !this.sessionId) {
      this.logger.warn('WhatsApp not configured — set OPENWA_URL, OPENWA_API_KEY, OPENWA_SESSION_ID in .env');
      return;
    }

    this.client = axios.create({
      baseURL: `${url}/api`,
      headers: { 'X-API-Key': apiKey, 'Content-Type': 'application/json' },
      timeout: 15000,
    });

    try {
      const { data } = await this.client.get(`/sessions/${this.sessionId}`);
      this._connected = data.status === 'connected';
      this._phone     = data.phone || null;
      this.logger.log(`WhatsApp status: ${data.status}${this._phone ? ' — ' + this._phone : ''}`);
    } catch (err: any) {
      this.logger.warn(`WhatsApp health check failed: ${err.message}`);
    }
  }

  // ─── Status ────────────────────────────────────────────
  get isEnabled()   { return !!this.client; }
  get isConnected() { return this._connected; }
  get phone()       { return this._phone; }

  async getSessionStatus() {
    if (!this.client) return { status: 'not_configured' };
    try {
      const { data } = await this.client.get(`/sessions/${this.sessionId}`);
      this._connected = data.status === 'connected';
      this._phone     = data.phone || null;
      return data;
    } catch { return { status: 'error' }; }
  }

  async getQRCode(): Promise<{ qrCode: string; status: string } | null> {
    if (!this.client) return null;
    try {
      const { data } = await this.client.get(`/sessions/${this.sessionId}/qr`);
      return data;
    } catch { return null; }
  }

  // ─── Contacts ──────────────────────────────────────────
  async getContacts(search?: string): Promise<any[]> {
    if (!this.client) return [];
    try {
      const { data } = await this.client.get(`/sessions/${this.sessionId}/contacts`);
      const list: any[] = Array.isArray(data) ? data : [];
      if (!search) return list.slice(0, 200); // cap at 200 for perf
      const q = search.toLowerCase();
      return list
        .filter(c =>
          (c.name || '').toLowerCase().includes(q) ||
          (c.pushName || '').toLowerCase().includes(q) ||
          (c.number || '').includes(q)
        )
        .slice(0, 100);
    } catch (err: any) {
      this.logger.error(`getContacts error: ${err.message}`);
      return [];
    }
  }

  // ─── Messages ──────────────────────────────────────────
  async getMessages(chatId: string, limit = 50): Promise<any[]> {
    if (!this.client) return [];
    try {
      const { data } = await this.client.get(
        `/sessions/${this.sessionId}/messages`,
        { params: { chatId, limit } }
      );
      return (data?.messages ?? data ?? []) as any[];
    } catch (err: any) {
      this.logger.error(`getMessages error: ${err.message}`);
      return [];
    }
  }

  // ─── Send ──────────────────────────────────────────────
  async sendText({ to, message }: SendTextOptions): Promise<boolean> {
    if (!this.client) { this.logger.warn('WhatsApp not configured'); return false; }
    const phone = this.formatPhone(to);
    try {
      await this.client.post(`/sessions/${this.sessionId}/messages/send-text`, {
        to: phone, text: message,
      });
      this.logger.log(`📤 WhatsApp → ${phone}`);
      return true;
    } catch (err: any) {
      this.logger.error(`sendText error: ${err.response?.data?.message || err.message}`);
      return false;
    }
  }

  // ─── Ready-made templates ──────────────────────────────
  async sendBookingConfirmation(o: { to: string; customerName: string; tourName: string; tourDate?: string; price?: string }) {
    return this.sendText({ to: o.to, message: [
      `✅ *Booking Confirmed!*`, ``,
      `Dear ${o.customerName},`, ``,
      `Your booking for *${o.tourName}* is confirmed.`,
      o.tourDate ? `📅 Date: ${o.tourDate}`  : '',
      o.price    ? `💰 Price: ${o.price}`    : '',
      ``, `We look forward to seeing you!`, `— Alforsa Gate Tours`,
    ].filter(Boolean).join('\n') });
  }

  async sendWelcome(o: { to: string; customerName: string }) {
    return this.sendText({ to: o.to, message: [
      `👋 *Welcome to Alforsa Gate Tours!*`, ``,
      `Hi ${o.customerName},`, ``,
      `Thank you for joining us. Browse our tours online.`, ``, `— Alforsa Gate Tours`,
    ].join('\n') });
  }

  // ─── Helpers ───────────────────────────────────────────
  private formatPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    return digits.endsWith('@c.us') ? digits : `${digits}@c.us`;
  }
}
