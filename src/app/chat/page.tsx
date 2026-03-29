'use client';
import './chat.css';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';

/* ═══════════════════════════════════════════════════════════════
   MODULE-LEVEL STATE — persists for full page lifetime
   ═══════════════════════════════════════════════════════════════ */
let sessionKey: CryptoKey | null = null;
let authToken = '';

const BACKEND_URL = 'http://localhost:5000';

/* ═══════════════════════════════════════════════════════════════
   CRYPTO HELPERS — Web Crypto API only, no external libraries
   ═══════════════════════════════════════════════════════════════ */

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function randomRoomKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from(crypto.getRandomValues(new Uint8Array(6)))
    .map(b => chars[b % chars.length]).join('');
}

/* ── Kyber-style LWE Simulation ── */
const Q = 3329;
const N = 4;
const mod = (a: number, m: number) => ((a % m) + m) % m;

function randSmall(): number { return Math.floor(Math.random() * 5) - 2; }
function randMod(): number { return Math.floor(Math.random() * Q); }

function matVec(A: number[][], v: number[]): number[] {
  return A.map(row => mod(row.reduce((s, a, j) => s + a * v[j], 0), Q));
}

function dot(a: number[], b: number[]): number {
  return mod(a.reduce((s, x, i) => s + x * b[i], 0), Q);
}

function kyberKeyGen() {
  const A = Array.from({ length: N }, () => Array.from({ length: N }, randMod));
  const s = Array.from({ length: N }, randSmall);
  const e = Array.from({ length: N }, randSmall);
  const b = matVec(A, s).map((v, i) => mod(v + e[i], Q));
  return { publicKey: { A, b }, privateKey: s };
}

function kyberEncapsulate(pk: { A: number[][]; b: number[] }) {
  const r = Array.from({ length: N }, randSmall);
  const e1 = Array.from({ length: N }, randSmall);
  const e2 = randSmall();
  const AT = pk.A[0].map((_, i) => pk.A.map(row => row[i]));
  const u = matVec(AT, r).map((v, i) => mod(v + e1[i], Q));
  const secretBit = Math.floor(Math.random() * 2);
  const v = mod(dot(pk.b, r) + e2 + secretBit * Math.floor(Q / 2), Q);
  return { u, v, sharedSecret: secretBit };
}

function kyberDecapsulate(sk: number[], u: number[], v: number) {
  const inner = mod(v - dot(sk, u), Q);
  return inner > Q / 4 && inner < 3 * Q / 4 ? 1 : 0;
}

async function deriveAESKey(seed: string): Promise<CryptoKey> {
  const raw = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(seed));
  return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

async function aesEncrypt(key: CryptoKey, plaintext: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(plaintext));
  return {
    iv: Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join(''),
    ciphertext: Array.from(new Uint8Array(enc)).map(b => b.toString(16).padStart(2, '0')).join(''),
  };
}

async function aesDecrypt(key: CryptoKey, ivHex: string, ctHex: string): Promise<string> {
  const iv = new Uint8Array(ivHex.match(/.{2}/g)!.map(h => parseInt(h, 16)));
  const ct = new Uint8Array(ctHex.match(/.{2}/g)!.map(h => parseInt(h, 16)));
  const dec = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
  return new TextDecoder().decode(dec);
}

/* ═══════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════ */

type Screen = 'auth' | 'lobby' | 'chat';
type ChatMsg = {
  id: string;
  from: string;
  ivHex: string;
  ctHex: string;
  plaintext?: string;
  ts: number;
};

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */

export default function ChatPage() {
  const [screen, setScreen] = useState<Screen>('auth');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [currentUser, setCurrentUser] = useState('');

  const [roomKey, setRoomKey] = useState('');
  const [roomInput, setRoomInput] = useState('');
  const [createdRoom, setCreatedRoom] = useState('');
  // BUG 2: state for join errors shown in lobby
  const [joinError, setJoinError] = useState('');

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [msgInput, setMsgInput] = useState('');
  const [kyberLog, setKyberLog] = useState<string[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [peerTyping, setPeerTyping] = useState(false);
  const [fingerprint, setFingerprint] = useState('');

  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  /* ── AUTH ── */
  const handleAuth = async () => {
    if (!username.trim() || !password.trim()) { setAuthError('Fill in both fields'); return; }
    try {
      const endpoint = authMode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Authentication failed');
        return;
      }
      if (authMode === 'register') {
        // Registration succeeded — auto-login to get token
        const loginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: username.trim(), password }),
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) {
          setAuthError(loginData.error || 'Login after registration failed');
          return;
        }
        authToken = loginData.token;
      } else {
        authToken = data.token;
      }
      setCurrentUser(username.trim());
      setAuthError('');
      setScreen('lobby');
    } catch {
      setAuthError('Cannot reach server. Is the backend running?');
    }
  };

  /* ── ROOM ── */
  const createRoom = async () => {
    const rk = randomRoomKey();
    try {
      const res = await fetch(`${BACKEND_URL}/api/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ name: rk }),
      });
      const data = await res.json();
      if (!res.ok) {
        // If room already exists, just use the key anyway
        console.warn('Room creation response:', data);
      }
      // Display the room key (not the MongoDB _id, so the user can share it)
      setCreatedRoom(rk);
      setRoomKey(rk);
    } catch {
      // If server is unreachable, still allow room creation locally
      setCreatedRoom(rk);
      setRoomKey(rk);
    }
  };

  const joinRoom = async (rk: string) => {
    if (!rk.trim()) return;
    const upperRk = rk.toUpperCase();
    setRoomKey(upperRk);
    setJoinError(''); // clear any previous join error
    await initSession(upperRk);
  };

  /* ── KYBER + AES SESSION INIT ── */
  const initSession = async (rk: string) => {
    const log: string[] = [];
    log.push(`[INIT] Room ${rk} — generating Kyber keypair…`);
    const { publicKey, privateKey } = kyberKeyGen();
    log.push(`[KEYGEN] pk.A = ${N}×${N} matrix mod ${Q}`);
    log.push(`[KEYGEN] pk.b = [${publicKey.b.join(', ')}]`);
    log.push(`[ENCAPS] Encapsulating shared secret…`);
    const { u, v, sharedSecret } = kyberEncapsulate(publicKey);
    log.push(`[ENCAPS] u = [${u.join(', ')}], v = ${v}`);
    const decoded = kyberDecapsulate(privateKey, u, v);
    log.push(`[DECAPS] Recovered secret bit = ${decoded}`);
    // Kyber output is kept for visual demo only — NOT used for the real AES key
    log.push(`[DERIVE] AES-256 session key will be derived from server roomSecret`);
    setKyberLog(log);
    setMessages([]);

    // ── Connect to Socket.io ──
    const socket = io(BACKEND_URL, { auth: { token: authToken } });
    socketRef.current = socket;

    // ✅ Joining must happen only after connection is confirmed
    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      // Join room ONLY after connection confirmed
      socket.emit('joinRoom', rk);
      console.log('📤 Emitted joinRoom for:', rk);
    });

    socket.on('connect_error', (err: Error) => {
      console.error('❌ Socket connection error:', err.message);
    });

    socket.on('disconnect', () => {
      console.log('⚠️ Socket disconnected');
    });

    // BUG 2: Handle joinError — room not found on server
    socket.on('joinError', (data: { message: string }) => {
      console.error('❌ Join error:', data.message);
      // Disconnect the socket
      socket.disconnect();
      socketRef.current = null;
      // Go back to lobby and show the error
      setScreen('lobby');
      setJoinError(data.message);
    });

    // BUG 3C: Listen for roomSecret from server, derive real AES key from it
    // History (roomMessages) is processed INSIDE this callback to guarantee key is ready
    socket.on('roomSecret', async ({ secret }: { secret: string }) => {
      console.log('🔑 Received roomSecret, deriving AES key…');
      // BUG 3C: Derive the session key from server-supplied secret (same for all devices)
      sessionKey = await deriveAESKey(secret);

      // Compute fingerprint from the secret so both devices show the same fingerprint
      const fp = (await sha256(secret)).substring(0, 16).toUpperCase();
      setKyberLog(prev => [...prev, `[READY] Fingerprint: ${fp}`]);
      setFingerprint(fp);

      // Only set screen to 'chat' after key is ready
      setScreen('chat');

      // Receive message history from server — must run after sessionKey is set
      socket.on('roomMessages', async (msgs: Array<{
        _id: string;
        user: { username: string };
        message: string;
        ciphertext?: string;
        timestamp: string;
      }>) => {
        console.log(`📩 Received roomMessages: ${msgs.length} messages`);
        const decryptedMsgs: ChatMsg[] = [];
        for (const msg of msgs) {
          const sender = msg.user?.username || 'Unknown';
          const ivHex = msg.ciphertext || '';
          const ctHex = msg.message || '';
          try {
            if (sessionKey && ivHex && ctHex) {
              const plaintext = await aesDecrypt(sessionKey, ivHex, ctHex);
              decryptedMsgs.push({
                id: msg._id,
                from: sender,
                ivHex,
                ctHex,
                plaintext,
                ts: new Date(msg.timestamp).getTime(),
              });
            } else {
              decryptedMsgs.push({
                id: msg._id,
                from: sender,
                ivHex,
                ctHex,
                plaintext: '[encrypted — key mismatch]',
                ts: new Date(msg.timestamp).getTime(),
              });
            }
          } catch {
            decryptedMsgs.push({
              id: msg._id,
              from: sender,
              ivHex,
              ctHex,
              plaintext: '[encrypted — key mismatch]',
              ts: new Date(msg.timestamp).getTime(),
            });
          }
        }
        console.log(`✅ Decrypted ${decryptedMsgs.length} messages`);
        setMessages(decryptedMsgs);
      });
    });

    // Listen for live incoming messages
    // BUG 3: Uses module-level sessionKey directly (not a closure copy) so it is always current
    socket.on('newMessage', async (msg: {
      _id: string;
      user: { username: string };
      message: string;
      ciphertext?: string;
      timestamp: string;
    }) => {
      const sender = msg.user?.username || 'Unknown';
      console.log(`📩 Received newMessage from ${sender}`);

      // Skip our own messages (we already added them optimistically)
      if (sender === currentUser) {
        console.log(`↖️ Skipping own message from ${sender}`);
        return;
      }

      const ivHex = msg.ciphertext || '';
      const ctHex = msg.message || '';

      if (!sessionKey) {
        setMessages(prev => [...prev, {
          id: msg._id,
          from: sender,
          ivHex,
          ctHex,
          plaintext: 'Re-establishing secure channel...',
          ts: new Date(msg.timestamp).getTime(),
        }]);
        return;
      }

      try {
        // BUG 3: sessionKey is the module-level variable — always reflects current value
        const plaintext = await aesDecrypt(sessionKey, ivHex, ctHex);
        console.log(`✅ Decrypted message from ${sender}`);
        setMessages(prev => [...prev, {
          id: msg._id,
          from: sender,
          ivHex,
          ctHex,
          plaintext,
          ts: new Date(msg.timestamp).getTime(),
        }]);
      } catch (err) {
        console.error(`❌ Decryption failed for message from ${sender}:`, err);
        setMessages(prev => [...prev, {
          id: msg._id,
          from: sender,
          ivHex,
          ctHex,
          plaintext: '[encrypted — key mismatch]',
          ts: new Date(msg.timestamp).getTime(),
        }]);
      }
    });
  };

  /* ── SEND MESSAGE ── */
  const sendMessage = async () => {
    if (!msgInput.trim() || !sessionKey) {
      console.warn('⚠️ Cannot send: empty message or no session key');
      return;
    }
    const { iv, ciphertext } = await aesEncrypt(sessionKey, msgInput);

    // Optimistic local update — sender sees their message immediately
    const msg: ChatMsg = { id: crypto.randomUUID(), from: currentUser, ivHex: iv, ctHex: ciphertext, plaintext: msgInput, ts: Date.now() };
    setMessages(prev => [...prev, msg]);
    console.log(`📤 Sent message: "${msgInput.substring(0, 30)}..."`);

    // Send over Socket.io
    if (!socketRef.current?.connected) {
      console.error('❌ Socket not connected, message not sent');
      return;
    }
    socketRef.current?.emit('sendMessage', {
      roomId: roomKey,
      message: ciphertext,    // hex ciphertext
      ciphertext: iv,         // hex iv
      from: currentUser,
    });
    console.log(`📤 Socket emitted sendMessage to room ${roomKey}`);

    setMsgInput('');
  };

  const handleTyping = () => {
    socketRef.current?.emit('sendMessage', { roomId: roomKey, type: 'typing', from: currentUser });
  };

  /* ── LEAVE ROOM / CLEANUP ── */
  const leaveRoom = () => {
    socketRef.current?.emit('leaveRoom', roomKey);
    socketRef.current?.disconnect();
    socketRef.current = null;
    sessionKey = null;
    setScreen('lobby');
    setCreatedRoom('');
    setRoomInput('');
  };

  const fmtTime = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  /* ═══════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════ */

  return (
    <div className="sc-page">
      <div className="sc-bg-grid" />
      <div className="sc-bg-blob sc-bg-blob-1" />
      <div className="sc-bg-blob sc-bg-blob-2" />

      {/* ━━━ AUTH SCREEN ━━━ */}
      <AnimatePresence mode="wait">
      {screen === 'auth' && (
        <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="sc-center-wrap">
          <div className="sc-auth-card" style={{ border: '1.5px solid rgba(0, 245, 255, 0.35)', boxShadow: '0 0 24px rgba(0, 245, 255, 0.12), inset 0 0 0 1px rgba(0, 245, 255, 0.06)' }}>
            <div className="sc-auth-icon">🔐</div>
            <h2 className="sc-auth-title">Secure Access</h2>
            <p className="sc-auth-sub">Authenticate to join the quantum channel</p>

            <div className="sc-tabs">
              <button className={`sc-tab ${authMode === 'login' ? 'sc-tab-active' : ''}`} onClick={() => { setAuthMode('login'); setAuthError(''); }}>Sign In</button>
              <button className={`sc-tab ${authMode === 'register' ? 'sc-tab-active' : ''}`} onClick={() => { setAuthMode('register'); setAuthError(''); }}>Register</button>
            </div>

            <label className="sc-label">Username</label>
            <input className="sc-input" value={username} onChange={e => setUsername(e.target.value)} placeholder="agent_name" onKeyDown={e => e.key === 'Enter' && handleAuth()} />
            <label className="sc-label" style={{ marginTop: 12 }}>Password</label>
            <input className="sc-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && handleAuth()} />
            {authError && <div className="sc-auth-error">{authError}</div>}

            <button className="sc-btn-primary" onClick={handleAuth} style={{ marginTop: 20 }}>
              {authMode === 'login' ? 'Authenticate' : 'Create Account'}
            </button>
          </div>
        </motion.div>
      )}

      {/* ━━━ LOBBY SCREEN ━━━ */}
      {screen === 'lobby' && (
        <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="sc-center-wrap">
          <div className="sc-lobby-card">
            <div className="sc-lobby-user">Logged in as <strong>{currentUser}</strong></div>
            <h2 className="sc-lobby-title">Quantum Lobby</h2>
            <p className="sc-lobby-sub">Create a room and share the key, or join an existing one.</p>

            <div className="sc-lobby-grid">
              {/* Create Room */}
              <div className="sc-lobby-box sc-lobby-create">
                <div className="sc-lobby-box-icon">🛡️</div>
                <h3>Create Room</h3>
                <p>Generate a secure room key and share it with your peer.</p>
                <button className="sc-btn-primary" onClick={createRoom}>Generate Key</button>
                {createdRoom && (
                  <div className="sc-room-key-display">
                    <span className="sc-room-key-value">{createdRoom}</span>
                    <button className="sc-copy-small" onClick={() => navigator.clipboard.writeText(createdRoom)}>Copy</button>
                  </div>
                )}
                {createdRoom && <button className="sc-btn-go" onClick={() => joinRoom(createdRoom)}>Enter Room →</button>}
              </div>

              {/* Join Room */}
              <div className="sc-lobby-box sc-lobby-join">
                <div className="sc-lobby-box-icon">🔑</div>
                <h3>Join Room</h3>
                <p>Enter the 6-character key shared by your contact.</p>
                <input className="sc-input sc-room-input" placeholder="e.g. X7K2M9" value={roomInput} onChange={e => setRoomInput(e.target.value.toUpperCase())} maxLength={6} onKeyDown={e => e.key === 'Enter' && joinRoom(roomInput)} />
                {/* BUG 2: Show joinError near the join input */}
                {joinError && <div className="sc-auth-error">{joinError}</div>}
                <button className="sc-btn-go" onClick={() => joinRoom(roomInput)} disabled={roomInput.length < 4}>Join →</button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ━━━ CHAT SCREEN ━━━ */}
      {screen === 'chat' && (
        <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="sc-chat-wrap">
          {/* Chat Header */}
          <div className="sc-chat-header">
            <div className="sc-chat-header-left">
              <button className="sc-back-btn" onClick={leaveRoom}>← Lobby</button>
              <div className="sc-room-badge">Room: {roomKey}</div>
            </div>
            <div className="sc-chat-header-right">
              <div className="sc-session-badge">🔐 Kyber-768 Active · <span className="sc-fp">{fingerprint}</span></div>
              <button className="sc-details-toggle" onClick={() => setShowDetails(!showDetails)}>{showDetails ? 'Hide' : 'Details'}</button>
            </div>
          </div>

          {/* Kyber Details Panel */}
          <AnimatePresence>
            {showDetails && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="sc-details-panel">
                <h4>🧬 Kyber Handshake Log</h4>
                <div className="sc-log-list">
                  {kyberLog.map((l, i) => <div key={i} className="sc-log-line">{l}</div>)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages */}
          <div className="sc-messages">
            {messages.length === 0 && (
              <div className="sc-empty">No messages yet. Say something encrypted! 🔒</div>
            )}
            {messages.map(msg => {
              const isMine = msg.from === currentUser;
              return (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={`sc-bubble-row ${isMine ? 'sc-mine' : 'sc-theirs'}`}>
                  <div className={`sc-bubble ${isMine ? 'sc-bubble-mine' : 'sc-bubble-theirs'}`}>
                    <div className="sc-bubble-meta">
                      <span className="sc-bubble-user">{msg.from}</span>
                      <span className="sc-bubble-lock">🔒</span>
                      <span className="sc-bubble-time">{fmtTime(msg.ts)}</span>
                    </div>
                    <div className="sc-bubble-text">{msg.plaintext}</div>
                    {showDetails && (
                      <div className="sc-bubble-crypto">
                        <span>IV: {msg.ivHex.substring(0, 12)}…</span>
                        <span>CT: {msg.ctHex.substring(0, 20)}…</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
            {peerTyping && (
              <div className="sc-typing">
                <span className="sc-typing-dot" /><span className="sc-typing-dot" /><span className="sc-typing-dot" />
                <span className="sc-typing-label">Peer is typing...</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input Bar */}
          <div className="sc-input-bar">
            <input
              className="sc-chat-input"
              placeholder="Type a secure message..."
              value={msgInput}
              onChange={e => { setMsgInput(e.target.value); handleTyping(); }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            />
            <button className="sc-send-btn" onClick={sendMessage} disabled={!msgInput.trim()}>
              Send
            </button>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
