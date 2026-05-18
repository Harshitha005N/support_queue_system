import { useEffect, useState } from "react";

import axios from "axios";

import io from "socket.io-client";

const socket = io("http://localhost:5000");

function App() {

  const [tickets, setTickets] = useState([]);

  const [agents, setAgents] = useState([]);

  // ======================
  // FETCH INITIAL DATA
  // ======================

  useEffect(() => {

    fetchTickets();

    fetchAgents();

    // realtime queue updates
    socket.on("queueUpdated", (data) => {

      setTickets(data);

    });

    // realtime agent updates
    socket.on("agentsUpdated", (data) => {

      setAgents(data);

    });

    return () => {

      socket.off("queueUpdated");

      socket.off("agentsUpdated");

    };

  }, []);

  // ======================
  // FETCH TICKETS
  // ======================

  const fetchTickets = async () => {

    const res = await axios.get(
      "http://localhost:5000/tickets"
    );

    setTickets(res.data);

  };

  // ======================
  // FETCH AGENTS
  // ======================

  const fetchAgents = async () => {

    const res = await axios.get(
      "http://localhost:5000/agents"
    );

    setAgents(res.data);

  };

  // ======================
  // CREATE TICKET
  // ======================

  const createTicket = async (type) => {

    await axios.post(
      "http://localhost:5000/tickets",
      { type }
    );

  };

  // ======================
  // COMPLETE TICKET
  // ======================

  const completeTicket = async (ticketId) => {

    await axios.post(
      `http://localhost:5000/complete/${ticketId}`
    );

  };

  return (

    <div style={{ padding: 20 }}>

      <h1>Admin Queue Dashboard</h1>

      {/* CREATE BUTTONS */}

      <button
        onClick={() =>
          createTicket("billing")
        }
      >
        Create Billing Ticket
      </button>

      <button
        onClick={() =>
          createTicket("technical")
        }
        style={{ marginLeft: 10 }}
      >
        Create Technical Ticket
      </button>

      {/* ====================== */}
      {/* QUEUE TABLE */}
      {/* ====================== */}

      <h2 style={{ marginTop: 30 }}>
        Ticket Queue
      </h2>

      <table
        border="1"
        cellPadding="10"
        style={{ marginTop: 10 }}
      >

        <thead>

          <tr>

            <th>Position</th>

            <th>ID</th>

            <th>Type</th>

            <th>Priority</th>

            <th>Status</th>

            <th>Assigned Agent</th>

            <th>Displacement</th>

            <th>Locked</th>

            <th>Action</th>

          </tr>

        </thead>

        <tbody>

          {tickets.map((ticket, index) => (

            <tr key={ticket.id}>

              <td>{index + 1}</td>

              <td>{ticket.id}</td>

              <td>{ticket.type}</td>

              <td>{ticket.priority}</td>

              <td>{ticket.status}</td>

              <td>
                {ticket.assignedAgent ||
                  "Not Assigned"}
              </td>

              <td>
                {ticket.displacementCount}
              </td>

              <td>
                {ticket.lockedPosition
                  ? "Yes"
                  : "No"}
              </td>

              <td>

                {ticket.status ===
                  "assigned" && (

                  <button
                    onClick={() =>
                      completeTicket(
                        ticket.id
                      )
                    }
                  >
                    Complete
                  </button>

                )}

              </td>

            </tr>

          ))}

        </tbody>

      </table>

      {/* ====================== */}
      {/* AGENTS TABLE */}
      {/* ====================== */}

      <h2 style={{ marginTop: 40 }}>
        Support Agents
      </h2>

      <table
        border="1"
        cellPadding="10"
        style={{ marginTop: 10 }}
      >

        <thead>

          <tr>

            <th>Agent</th>

            <th>Specialization</th>

            <th>Availability</th>

            <th>Current Ticket</th>

          </tr>

        </thead>

        <tbody>

          {agents.map((agent) => (

            <tr key={agent.id}>

              <td>{agent.name}</td>

              <td>
                {agent.specialization}
              </td>

              <td>

                {agent.available
                  ? "Available"
                  : "Busy"}

              </td>

              <td>

                {agent.currentTicket ||
                  "None"}

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

}

export default App;