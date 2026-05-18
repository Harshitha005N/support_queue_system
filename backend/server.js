const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// ======================
// DATA
// ======================

let tickets = [];

let agents = [
  {
    id: 1,
    name: "Billing Agent",
    specialization: "billing",
    available: true,
    currentTicket: null,
  },
  {
    id: 2,
    name: "Technical Agent",
    specialization: "technical",
    available: true,
    currentTicket: null,
  },
];

// ======================
// SORT QUEUE
// ======================

function sortQueue() {

  tickets.sort((a, b) => {

    // completed tickets go bottom
    if (a.status === "completed") return 1;

    if (b.status === "completed") return -1;

    // assigned tickets after waiting
    if (
      a.status === "assigned" &&
      b.status === "waiting"
    ) {
      return 1;
    }

    if (
      b.status === "assigned" &&
      a.status === "waiting"
    ) {
      return -1;
    }

    // lock protection
    if (
      a.lockedPosition &&
      a.previousPosition < b.previousPosition
    ) {
      return -1;
    }

    if (
      b.lockedPosition &&
      b.previousPosition < a.previousPosition
    ) {
      return 1;
    }

    // higher priority first
    if (b.priority !== a.priority) {

      return b.priority - a.priority;

    }

    // FIFO
    return a.createdAt - b.createdAt;

  });

  // displacement tracking
  tickets.forEach((ticket, index) => {

    if (
      ticket.previousPosition !== undefined &&
      index > ticket.previousPosition &&
      ticket.status === "waiting"
    ) {

      ticket.displacementCount++;

      if (ticket.displacementCount >= 3) {

        ticket.lockedPosition = true;

      }

    }

    ticket.previousPosition = index;

  });

}

// ======================
// SOCKET EMITTERS
// ======================

function emitQueue() {

  sortQueue();

  io.emit("queueUpdated", tickets);

}

function emitAgents() {

  io.emit("agentsUpdated", agents);

}

// ======================
// AUTO ASSIGNMENT
// ======================

function autoAssignTickets() {

  // assign as many as possible
  tickets.forEach((ticket) => {

    // only waiting tickets
    if (ticket.status !== "waiting") return;

    // matching available agent
    const agent = agents.find(
      (a) =>
        a.specialization === ticket.type &&
        a.available
    );

    if (!agent) return;

    // assign ticket
    ticket.status = "assigned";

    ticket.assignedAgent = agent.name;

    // make agent busy
    agent.available = false;

    agent.currentTicket = ticket.id;

    console.log(
      `Assigned ${ticket.id} to ${agent.name}`
    );

  });

  emitQueue();

  emitAgents();

}

// ======================
// PRIORITY AGING
// ======================

setInterval(() => {

  tickets.forEach((ticket) => {

    if (ticket.status === "waiting") {

      ticket.priority += 1;

    }

  });

  emitQueue();

}, 15000);

// ======================
// CREATE TICKET
// ======================

app.post("/tickets", (req, res) => {

  const { type } = req.body;

  const newTicket = {

    id: Date.now(),

    type,

    priority: 1,

    displacementCount: 0,

    lockedPosition: false,

    status: "waiting",

    createdAt: Date.now(),

    previousPosition: tickets.length,

    assignedAgent: null,

    lastHeartbeat: Date.now(),

  };

  tickets.push(newTicket);

  emitQueue();

  autoAssignTickets();

  res.json(newTicket);

});

// ======================
// GET TICKETS
// ======================

app.get("/tickets", (req, res) => {

  res.json(tickets);

});

// ======================
// GET AGENTS
// ======================

app.get("/agents", (req, res) => {

  res.json(agents);

});

// ======================
// COMPLETE TICKET
// ======================

app.post("/complete/:ticketId", (req, res) => {

  const ticketId = Number(req.params.ticketId);

  const ticket = tickets.find(
    (t) => t.id === ticketId
  );

  if (!ticket) {

    return res.status(404).json({
      message: "Ticket not found",
    });

  }

  // mark completed
  ticket.status = "completed";

  // free agent
  const agent = agents.find(
    (a) => a.currentTicket === ticket.id
  );

  if (agent) {

    agent.available = true;

    agent.currentTicket = null;

  }

  emitQueue();

  emitAgents();

  // auto assign next ticket
  autoAssignTickets();

  res.json({
    message: "Completed",
  });

});

// ======================
// HEARTBEAT
// ======================

app.post("/heartbeat/:ticketId", (req, res) => {

  const ticketId = Number(req.params.ticketId);

  const ticket = tickets.find(
    (t) => t.id === ticketId
  );

  if (ticket) {

    ticket.lastHeartbeat = Date.now();

  }

  res.json({
    success: true,
  });

});

// ======================
// REMOVE INACTIVE
// ======================

setInterval(() => {

  const now = Date.now();

  tickets = tickets.filter((ticket) => {

    // keep completed
    if (ticket.status === "completed") {

      return true;

    }

    // active within 30 sec
    return (
      now - ticket.lastHeartbeat < 30000
    );

  });

  emitQueue();

}, 10000);

// ======================
// SOCKET CONNECTION
// ======================

io.on("connection", (socket) => {

  console.log("User connected");

  socket.emit("queueUpdated", tickets);

  socket.emit("agentsUpdated", agents);

  socket.on("heartbeat", (ticketId) => {

    const ticket = tickets.find(
      (t) => t.id === ticketId
    );

    if (ticket) {

      ticket.lastHeartbeat = Date.now();

    }

  });

  socket.on("disconnect", () => {

    console.log("User disconnected");

  });

});

// ======================
// START SERVER
// ======================

server.listen(5000, () => {

  console.log(
    "Server running on port 5000"
  );

});