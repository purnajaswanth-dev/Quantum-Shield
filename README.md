# 🛡️ QuantumShield  
### Post-Quantum Secure Messaging Platform

> Classical encryption is living on borrowed time. QuantumShield shows you why — and what replaces it.

---

## ⚡ What is QuantumShield?

QuantumShield is a modern, interactive web application that demonstrates:

- How classical encryption (RSA) becomes vulnerable in the age of quantum computing  
- How Post-Quantum Cryptography (PQC), specifically CRYSTALS-Kyber, resists those threats  
- A real-world simulation of secure communication using quantum-safe encryption  

This is not just theory — it is a hands-on, visual, and practical demonstration of the future of cybersecurity.

---

## 🎯 Why This Project Matters

Most systems today rely on RSA.

But:

> A sufficiently powerful quantum computer can break RSA using Shor’s Algorithm.

QuantumShield exposes this weakness and demonstrates a real alternative:

👉 Lattice-based cryptography (CRYSTALS-Kyber)

---

## 🚀 Features

### 🔓 RSA Attack Simulation
- Demonstrates Shor’s Algorithm conceptually  
- Shows how RSA keys can be factored under quantum conditions  
- Makes the quantum threat visible and understandable  

---

### 🔐 Post-Quantum Encryption (CRYSTALS-Kyber)
- Implements lattice-based key exchange  
- Resistant to quantum and classical attacks  
- Represents next-generation encryption  

---

### 💬 Secure Chat System
- End-to-end encrypted messaging demo  
- Kyber for key exchange  
- AES-256 for message encryption  
- Hybrid real-world encryption model  

---

### 📐 Lattice Visualization
- Interactive lattice representation  
- Helps understand why lattice problems are hard  
- Explains why quantum computers struggle with PQC  

---

## 🧠 Tech Stack

| Layer        | Technology |
|-------------|-----------|
| Frontend    | Next.js 15 (App Router), React 19 |
| Styling     | Tailwind CSS |
| Animations  | Framer Motion |
| Backend     | Next.js API Routes |
| Crypto Core | CRYSTALS-Kyber + AES-256 |

---

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18 or later recommended)  
- npm (comes with Node.js)  

---

### Installation

```bash
cd quantum-shield
npm install
npm run dev
```

Open in browser:

```
http://localhost:3000
```

---

## 📦 Sharing the Project

Before zipping the project, delete:

```
node_modules
.next
```

### Why?

- node_modules → Large and system-specific  
- .next → Temporary build files  

### Result:

- Smaller file size (< 1MB)  
- Faster sharing  
- Works on any system  

---

### For the Receiver

```bash
npm install
npm run dev
```

---

## 🧪 How It Works

1. User initiates communication  
2. Kyber generates a quantum-safe shared key  
3. AES-256 encrypts the message  
4. Message is transmitted securely  
5. RSA simulation runs in parallel to show vulnerability  

---

## 🔥 Strength of This Project

- Combines theory + implementation + visualization  
- Demonstrates real-world hybrid encryption  
- Built using modern full-stack technologies  
- Clearly explains a complex cybersecurity problem    

---

## 🧩 Inspiration

The world is moving toward quantum computing.  
Encryption must evolve — or it will break.

---

