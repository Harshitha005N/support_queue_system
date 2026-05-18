import { useEffect, useState } from "react";

import socket from "../socket";

import TicketCard from "./TicketCard";

import AgentCard from "./AgentCard";

function AdminDashboard() {

  const [tickets, setTickets] = useState([]);

  const [agents, setAgents] = useState([]);

  useEffect(() => {

    socket.on("queueUpdated", (data) => {
      setTickets(data);
    });

    socket.on("agentsUpdated", (data) => {
      setAgents(data);
    });

    return () => {
      socket.off("queueUpdated");
      socket.off("agentsUpdated");
    };

  }, []);

  const completeTicket = async (ticketId) => {

    await fetch(
      `http://localhost:5000/complete/${ticketId}`,
      {
        method: "POST",
      }
    );

  };

  return (
    <div style={{ padding: "20px" }}>

      <h1>Admin Dashboard</h1>

      <h2>Queue</h2>

      {tickets.map((ticket) => (
        <TicketCard
          key={ticket.id}
          ticket={ticket}
          onComplete={completeTicket}
        />
      ))}

      <h2>Agents</h2>

      {agents.map((agent) => (
        <AgentCard
          key={agent.id}
          agent={agent}
        />
      ))}

    </div>
  );
}

export default AdminDashboard;