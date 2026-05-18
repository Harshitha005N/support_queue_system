function TicketCard({ ticket, onComplete }) {
  return (
    <div
      style={{
        border: "1px solid gray",
        padding: "10px",
        marginBottom: "10px",
      }}
    >
      <h3>Ticket #{ticket.id}</h3>

      <p>Type: {ticket.type}</p>

      <p>Priority: {ticket.priority}</p>

      <p>Status: {ticket.status}</p>

      <p>
        Assigned Agent:
        {ticket.assignedAgent || "None"}
      </p>

      {ticket.status === "assigned" && (
        <button onClick={() => onComplete(ticket.id)}>
          Complete
        </button>
      )}
    </div>
  );
}

export default TicketCard;