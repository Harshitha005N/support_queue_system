# Real-Time Intelligent Support Queue System

## Overview

This project is a real-time support queue management system built using Node.js, Express, React, React Native, and Socket.IO.

The system includes:
- Customer Mobile Application
- Admin Web Dashboard
- Real-Time Queue Updates
- Specialized Agent Routing
- Heartbeat Monitoring

---

# Features

- Priority-based ticket queue
- FIFO queue ordering
- Dynamic priority aging
- Displacement protection
- Specialized agent assignment
- Real-time synchronization using Socket.IO
- Heartbeat monitoring
- Automatic inactive ticket removal
- Responsive admin dashboard
- React Native mobile application

---

# Tech Stack

## Backend
- Node.js
- Express.js
- Socket.IO

## Frontend
- React.js
- React Native + Expo

## Storage
- In-memory storage

---

# Setup Instructions

## Backend

```bash
cd backend
npm install
node server.js
```

## Admin Web App

```bash
cd admin-web
npm install
npm start
```

## Customer Mobile App

```bash
cd customer-mobile
npm install
npx expo start
```

---

# Core Functionalities

## Queue Ordering
Tickets are sorted using dynamic priority values while maintaining FIFO ordering for equal priorities.

## Priority Aging
Waiting tickets automatically increase in priority every 15 seconds.

## Displacement Protection
Tickets cannot be be displaced more than 3 times in the queue.

## Specialized Agent Routing
Billing tickets are assigned only to billing agents and technical tickets only to technical agents.

## Real-Time Updates
Socket.IO is used for instant synchronization between backend, admin dashboard, and mobile application.

## Heartbeat Monitoring
Inactive tickets are automatically removed if heartbeat signals stop for 30 seconds.

---

# Demo Flow

1. Create ticket from mobile app
2. Queue updates instantly
3. Automatic agent assignment
4. Ticket completion
5. Real-time synchronization
6. Automatic inactive ticket removal
