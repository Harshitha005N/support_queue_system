import React, {
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  Button,
  StyleSheet,
  ScrollView,
} from "react-native";

import axios from "axios";

import io from "socket.io-client";

// ======================
// SERVER URL
// ======================

const SERVER_URL =
  "http://10.202.202.92:5000";

// socket connection
const socket = io(SERVER_URL);

export default function App() {

  const [tickets, setTickets] = useState([]);

  const [myTicketId, setMyTicketId] =
    useState(null);

  // ======================
  // SOCKET LISTENER
  // ======================

  useEffect(() => {

    fetchTickets();

    socket.on("queueUpdated", (data) => {

      setTickets(data);

    });

    return () => {

      socket.off("queueUpdated");

    };

  }, []);

  // ======================
  // HEARTBEAT
  // ======================

  useEffect(() => {

    if (!myTicketId) return;

    const interval = setInterval(() => {

      axios.post(
        `${SERVER_URL}/heartbeat/${myTicketId}`
      );

    }, 5000);

    return () => clearInterval(interval);

  }, [myTicketId]);

  // ======================
  // FETCH TICKETS
  // ======================

  const fetchTickets = async () => {

    try {

      const res = await axios.get(
        `${SERVER_URL}/tickets`
      );

      setTickets(res.data);

    } catch (error) {

      console.log(error);

    }

  };

  // ======================
  // CREATE TICKET
  // ======================

  const createTicket = async (type) => {

    try {

      const res = await axios.post(
        `${SERVER_URL}/tickets`,
        { type }
      );

      setMyTicketId(res.data.id);

    } catch (error) {

      console.log(error);

    }

  };

  // ======================
  // FIND MY TICKET
  // ======================

  const myTicket = tickets.find(
    (ticket) => ticket.id === myTicketId
  );

  // ======================
  // QUEUE POSITION
  // ======================

  const queuePosition = tickets.findIndex(
    (ticket) => ticket.id === myTicketId
  );

  return (

    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.title}>
        Support Queue System
      </Text>

      {/* CREATE BILLING */}

      <View style={styles.buttonContainer}>

        <Button
          title="Create Billing Ticket"
          onPress={() =>
            createTicket("billing")
          }
        />

      </View>

      {/* CREATE TECHNICAL */}

      <View style={styles.buttonContainer}>

        <Button
          title="Create Technical Ticket"
          onPress={() =>
            createTicket("technical")
          }
        />

      </View>

      {/* MY TICKET */}

      {myTicket && (

        <View style={styles.card}>

          <Text style={styles.heading}>
            My Ticket
          </Text>

          <Text>
            Ticket ID:
            {" "}
            {myTicket.id}
          </Text>

          <Text>
            Type:
            {" "}
            {myTicket.type}
          </Text>

          <Text>
            Priority:
            {" "}
            {myTicket.priority}
          </Text>

          <Text>
            Status:
            {" "}
            {myTicket.status}
          </Text>

          <Text>
            Queue Position:
            {" "}
            {queuePosition + 1}
          </Text>

          <Text>
            Assigned Agent:
            {" "}
            {myTicket.assignedAgent ||
              "Not Assigned"}
          </Text>

        </View>

      )}

      {/* LIVE QUEUE */}

      <View style={styles.card}>

        <Text style={styles.heading}>
          Live Queue
        </Text>

        {tickets.map((ticket, index) => (

          <View
            key={ticket.id}
            style={styles.ticket}
          >

            <Text>
              Position:
              {" "}
              {index + 1}
            </Text>

            <Text>
              Type:
              {" "}
              {ticket.type}
            </Text>

            <Text>
              Priority:
              {" "}
              {ticket.priority}
            </Text>

            <Text>
              Status:
              {" "}
              {ticket.status}
            </Text>

            <Text>
              Agent:
              {" "}
              {ticket.assignedAgent ||
                "Waiting"}
            </Text>

          </View>

        ))}

      </View>

    </ScrollView>

  );

}

const styles = StyleSheet.create({

  container: {
    padding: 20,
    marginTop: 50,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },

  buttonContainer: {
    marginBottom: 10,
  },

  card: {
    marginTop: 20,
    padding: 15,
    borderWidth: 1,
    borderRadius: 10,
  },

  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },

  ticket: {
    padding: 10,
    borderBottomWidth: 1,
  },

});