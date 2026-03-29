require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  tls: true,
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true,
  serverSelectionTimeoutMS: 10000,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Mongoose Models
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model('User', userSchema);

const roomSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  roomCode: { type: String, unique: true },
  roomSecret: { type: String },  // BUG 3A: shared key material for the room
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  members: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});
const Room = mongoose.model('Room', roomSchema);

const messageSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  ciphertext: { type: String },
  timestamp: { type: Date, default: Date.now },
});
const Message = mongoose.model('Message', messageSchema);

// Express App
const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(bodyParser.json());

// Serve client/index.html as static if it exists
const path = require('path');
app.use(express.static(path.join(__dirname, '..', 'client')));

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ message: 'User registered', token });
  } catch (err) {
    res.status(400).json({ error: 'Username already taken' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  try {
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Room Routes
app.post('/api/rooms', authenticateToken, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Room name required' });
  try {
    const roomCode = name.toUpperCase().substring(0, 6).padEnd(6, '0');
    // BUG 3A: Generate a random roomSecret and save it with the room
    const roomSecret = crypto.randomBytes(32).toString('hex');
    const room = new Room({
      name,
      roomCode,
      roomSecret,
      createdBy: req.user.id,
      members: [req.user.username],
    });
    await room.save();
    res.status(201).json(room);
  } catch (err) {
    res.status(400).json({ error: 'Room already exists' });
  }
});

app.post('/api/rooms/join', authenticateToken, async (req, res) => {
  const { roomCode } = req.body;
  if (!roomCode) return res.status(400).json({ error: 'Room code required' });
  try {
    const room = await Room.findOne({
      $or: [
        { name: roomCode },
        { roomCode: roomCode.toUpperCase() },
        { _id: mongoose.Types.ObjectId.isValid(roomCode) ? roomCode : undefined },
      ],
    });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    if (!room.members.includes(req.user.username)) {
      room.members.push(req.user.username);
      await room.save();
    }
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/rooms', authenticateToken, async (req, res) => {
  const rooms = await Room.find();
  res.json(rooms);
});

// Socket.io with JWT auth
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication error'));
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return next(new Error('Authentication error'));
    socket.user = user;
    next();
  });
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.user.username);

  // Join Room
  // BUG 1 FIX: roomId from client IS the roomCode string — use it directly as socket room name
  // BUG 2 FIX: validate room exists in DB before joining
  socket.on('joinRoom', async (roomId) => {
    // roomId is the roomCode string (e.g. "X7K2M9")
    const roomCode = roomId;

    // BUG 2: Look up room by roomCode before allowing join
    let room;
    try {
      room = await Room.findOne({ roomCode });
    } catch (err) {
      socket.emit('joinError', { message: 'Server error looking up room.' });
      return;
    }

    if (!room) {
      // BUG 2: Emit joinError and return without joining socket room
      socket.emit('joinError', { message: 'Room not found. Check the code and try again.' });
      return;
    }

    // BUG 1: Join using roomCode as the socket room identifier
    socket.join(roomCode);
    console.log(`${socket.user.username} joined room ${roomCode}`);

    // BUG 3B: Emit roomSecret only to the joining socket (never broadcast)
    socket.emit('roomSecret', { secret: room.roomSecret });

    // Fetch message history — look up by MongoDB room _id since that's what messages reference
    try {
      const messages = await Message.find({ room: room._id })
        .populate('user', 'username')
        .sort('timestamp')
        .limit(50);
      socket.emit('roomMessages', messages);
    } catch (err) {
      socket.emit('roomMessages', []);
    }

    // BUG 1: broadcast user-joined using roomCode
    socket.to(roomCode).emit('user-joined', { username: socket.user.username });
  });

  // Leave Room
  // BUG 1 FIX: use roomId (which is roomCode) directly
  socket.on('leaveRoom', (roomId) => {
    const roomCode = roomId;
    socket.leave(roomCode);
    console.log(`${socket.user.username} left room ${roomCode}`);
  });

  // Send Message — server saves ciphertext only, never plaintext
  // BUG 1 FIX: roomId from client is the roomCode string — broadcast to that room
  socket.on('sendMessage', async (data) => {
    const { roomId, message, ciphertext } = data;
    if (!roomId || !message) return;
    const roomCode = roomId;

    try {
      // Look up the room by roomCode to get its MongoDB _id for message storage
      const room = await Room.findOne({ roomCode });
      if (!room) return;

      const newMessage = new Message({
        room: room._id,
        user: socket.user.id,
        message,     // this is the encrypted payload (hex ciphertext)
        ciphertext,  // this is the IV (hex)
      });
      await newMessage.save();
      const populatedMessage = await Message.findById(newMessage._id).populate('user', 'username');
      // BUG 1: broadcast to roomCode room, not MongoDB _id
      io.to(roomCode).emit('newMessage', populatedMessage);
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  // Relay public key for Kyber handshake
  // BUG 1: already uses data.roomCode correctly — no change needed
  socket.on('public-key', (data) => {
    socket.to(data.roomCode).emit('public-key', {
      publicKey: data.publicKey,
      fromUsername: socket.user.username,
      socketId: socket.id,
    });
  });

  // Relay key ciphertext for Kyber handshake
  // BUG 1: already uses data.roomCode correctly — no change needed
  socket.on('key-ciphertext', (data) => {
    socket.to(data.roomCode).emit('key-ciphertext', {
      ciphertext: data.ciphertext,
      fromUsername: socket.user.username,
    });
  });

  // Typing indicator
  // BUG 1: already uses data.roomCode correctly — no change needed
  socket.on('typing', (data) => {
    socket.to(data.roomCode).emit('user-typing', { username: socket.user.username });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.user.username);
  });
});

server.listen(PORT, () => {
  console.log(`QuantumShield Backend running on http://localhost:${PORT}`);
});