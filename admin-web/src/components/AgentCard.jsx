function AgentCard({ agent }) {
  return (
    <div
      style={{
        border: "1px solid blue",
        padding: "10px",
        marginBottom: "10px",
      }}
    >
      <h3>{agent.name}</h3>

      <p>
        Specialization:
        {agent.specialization}
      </p>

      <p>
        Status:
        {agent.available
          ? "Available"
          : "Busy"}
      </p>

      <p>
        Current Ticket:
        {agent.currentTicket || "None"}
      </p>
    </div>
  );
}

export default AgentCard;