import axios from 'axios';

const BASE_URL = import.meta.env.PIKLE_API_URL ?? 'https://api.pikle.io';
const API_KEY = import.meta.env.PIKLE_API_KEY ?? '';
const API_SECRET = import.meta.env.PIKLE_API_SECRET ?? '';

async function signRequest(method: string, path: string, timestamp: string): Promise<string> {
  const message = `${method.toUpperCase()}\n${path}\n${timestamp}`;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(API_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function authHeaders(method: string, path: string) {
  const timestamp = Date.now().toString();
  const signature = await signRequest(method, path, timestamp);
  return {
    'X-Api-Key': API_KEY,
    'X-Timestamp': timestamp,
    'X-Signature': signature,
  };
}

export async function proxyGet(path: string) {
  const { data } = await axios.get(`${BASE_URL}${path}`, {
    headers: await authHeaders('GET', path),
  });
  return data;
}

export async function proxyPost(path: string, body: unknown) {
  const { data } = await axios.post(`${BASE_URL}${path}`, body, {
    headers: await authHeaders('POST', path),
  });
  return data;
}
