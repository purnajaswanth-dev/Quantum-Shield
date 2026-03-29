'use client';
import './encrypt-decrypt.css';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock, Unlock, Zap, Copy, CheckCircle, Shield,
  Key as KeyIcon, AlertCircle, RefreshCw, ShieldCheck
} from 'lucide-react';

export default function EncryptDecryptPage() {
  // --- Encrypt State ---
  const [plainText, setPlainText] = useState('');
  const [encryptedOutput, setEncryptedOutput] = useState('');
  const [generatedKey, setGeneratedKey] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [copiedE, setCopiedE] = useState(false);
  const [copiedK, setCopiedK] = useState(false);

  // --- Decrypt State ---
  const [cipherInput, setCipherInput] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [decryptedOutput, setDecryptedOutput] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptError, setDecryptError] = useState('');
  const [decryptSuccess, setDecryptSuccess] = useState(false);

  const handleCopy = (text: string, type: 'cipher' | 'key') => {
    navigator.clipboard.writeText(text);
    if (type === 'cipher') {
      setCopiedE(true);
      setTimeout(() => setCopiedE(false), 2000);
    } else {
      setCopiedK(true);
      setTimeout(() => setCopiedK(false), 2000);
    }
  };

  const handleEncrypt = async () => {
    if (!plainText) return;
    setIsEncrypting(true);
    setEncryptedOutput('');
    setGeneratedKey('');

    await new Promise(resolve => setTimeout(resolve, 900));

    try {
      const encoded = new TextEncoder().encode(plainText);
      const key = await window.crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const encrypted = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);

      const combinedData = new Uint8Array(iv.length + encrypted.byteLength);
      combinedData.set(iv);
      combinedData.set(new Uint8Array(encrypted), iv.length);
      const ciphertextBase64 = btoa(String.fromCharCode(...combinedData));

      const exportedKey = await window.crypto.subtle.exportKey('raw', key);
      const keyBase64 = btoa(String.fromCharCode(...new Uint8Array(exportedKey)));

      setEncryptedOutput(ciphertextBase64);
      setGeneratedKey(keyBase64);
    } catch (e) {
      console.error(e);
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleDecrypt = async () => {
    if (!cipherInput || !keyInput) return;
    setIsDecrypting(true);
    setDecryptedOutput('');
    setDecryptError('');
    setDecryptSuccess(false);

    await new Promise(resolve => setTimeout(resolve, 900));

    try {
      const combinedData = Uint8Array.from(atob(cipherInput.trim()), c => c.charCodeAt(0));
      const iv = combinedData.slice(0, 12);
      const encryptedData = combinedData.slice(12);

      const rawKey = Uint8Array.from(atob(keyInput.trim()), c => c.charCodeAt(0));
      const key = await window.crypto.subtle.importKey(
        'raw', rawKey, { name: 'AES-GCM' }, true, ['encrypt', 'decrypt']
      );
      const decrypted = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encryptedData);
      const decodedText = new TextDecoder().decode(decrypted);

      setDecryptedOutput(decodedText);
      setDecryptSuccess(true);
    } catch (e) {
      console.error(e);
      setDecryptError('Decryption failed — incorrect key or corrupted data.');
    } finally {
      setIsDecrypting(false);
    }
  };

  return (
    <div className="ed-page">
      {/* Animated background blobs */}
      <div className="ed-blob ed-blob-1" />
      <div className="ed-blob ed-blob-2" />
      <div className="ed-blob ed-blob-3" />

      <div className="ed-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="ed-header"
        >
          <div className="ed-badge">
            <ShieldCheck size={14} />
            <span>AES-256-GCM · Client-Side Encryption</span>
          </div>
          <h1 className="ed-title">Encrypt &amp; Decrypt</h1>
          <p className="ed-subtitle">
            Military-grade encryption that runs entirely in your browser.
            Your data never leaves your device.
          </p>
        </motion.div>

        {/* Two-Column Layout */}
        <div className="ed-grid">

          {/* ━━━ ENCRYPT BOX ━━━ */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="ed-card"
          >
            {/* Card glow border */}
            <div className="ed-card-glow ed-glow-violet" />

            <div className="ed-card-inner">
              {/* Card Header */}
              <div className="ed-card-header">
                <div className="ed-icon-wrap ed-icon-violet">
                  <Lock size={22} />
                </div>
                <div>
                  <h2 className="ed-card-title">Encrypt</h2>
                  <p className="ed-card-desc">Enter your message below</p>
                </div>
              </div>

              {/* Input */}
              <label className="ed-label">Your Message</label>
              <textarea
                value={plainText}
                onChange={(e) => setPlainText(e.target.value)}
                placeholder="Type something secret..."
                className="ed-textarea"
              />

              {/* Button */}
              <button
                onClick={handleEncrypt}
                disabled={!plainText || isEncrypting}
                className="ed-btn ed-btn-violet"
              >
                {isEncrypting ? (
                  <><RefreshCw size={16} className="ed-spin" /> Encrypting...</>
                ) : (
                  <><Zap size={16} /> Encrypt Message</>
                )}
              </button>

              {/* Results */}
              <AnimatePresence>
                {(encryptedOutput || generatedKey) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ed-results"
                  >
                    {/* Cipher output */}
                    <div className="ed-output-block">
                      <div className="ed-output-header">
                        <span className="ed-output-label ed-text-violet">Encrypted Output</span>
                        <button onClick={() => handleCopy(encryptedOutput, 'cipher')} className="ed-copy-btn">
                          {copiedE ? <><CheckCircle size={13} className="ed-text-green" /> Copied!</> : <><Copy size={13} /> Copy</>}
                        </button>
                      </div>
                      <div className="ed-output-box">{encryptedOutput}</div>
                    </div>

                    {/* Key output */}
                    <div className="ed-output-block">
                      <div className="ed-output-header">
                        <span className="ed-output-label ed-text-cyan">
                          <KeyIcon size={12} /> Private Key
                        </span>
                        <button onClick={() => handleCopy(generatedKey, 'key')} className="ed-copy-btn">
                          {copiedK ? <><CheckCircle size={13} className="ed-text-green" /> Copied!</> : <><Copy size={13} /> Copy</>}
                        </button>
                      </div>
                      <div className="ed-output-box ed-key-box">{generatedKey}</div>
                    </div>

                    <div className="ed-warning">
                      <AlertCircle size={14} />
                      <span>Save this key! It's required for decryption and cannot be recovered.</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* ━━━ DECRYPT BOX ━━━ */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="ed-card"
          >
            {/* Card glow border */}
            <div className="ed-card-glow ed-glow-cyan" />

            <div className="ed-card-inner">
              {/* Card Header */}
              <div className="ed-card-header">
                <div className="ed-icon-wrap ed-icon-cyan">
                  <Unlock size={22} />
                </div>
                <div>
                  <h2 className="ed-card-title">Decrypt</h2>
                  <p className="ed-card-desc">Paste ciphertext &amp; key</p>
                </div>
              </div>

              {/* Cipher Input */}
              <label className="ed-label">Encrypted Message</label>
              <textarea
                value={cipherInput}
                onChange={(e) => setCipherInput(e.target.value)}
                placeholder="Paste encrypted text here..."
                className="ed-textarea ed-textarea-sm"
              />

              {/* Key Input */}
              <label className="ed-label" style={{ marginTop: 16 }}>Private Key</label>
              <div className="ed-key-input-wrap">
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="Paste the private key..."
                  className="ed-key-input"
                />
                <KeyIcon size={16} className="ed-key-input-icon" />
              </div>

              {/* Button */}
              <button
                onClick={handleDecrypt}
                disabled={!cipherInput || !keyInput || isDecrypting}
                className="ed-btn ed-btn-cyan"
              >
                {isDecrypting ? (
                  <><RefreshCw size={16} className="ed-spin" /> Decrypting...</>
                ) : (
                  <><Unlock size={16} /> Decrypt Message</>
                )}
              </button>

              {/* Results */}
              <AnimatePresence>
                {(decryptError || decryptedOutput) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ed-results"
                  >
                    {decryptError && (
                      <div className="ed-error">
                        <AlertCircle size={18} />
                        <span>{decryptError}</span>
                      </div>
                    )}

                    {decryptSuccess && decryptedOutput && (
                      <div className="ed-success-block">
                        <div className="ed-success-header">
                          <Shield size={16} className="ed-text-green" />
                          <span>Decrypted Successfully</span>
                          <CheckCircle size={16} className="ed-text-green" />
                        </div>
                        <div className="ed-decrypted-msg">{decryptedOutput}</div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
