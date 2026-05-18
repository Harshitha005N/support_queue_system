import { useEffect, useState } from "react";

import {
  View,
  Text,
  Button,
  FlatList
} from "react-native";

import axios from "axios";
import io from "socket.io-client";

const socket = io("http://10.202.202.92:5000");

export default function App() {

  const [tickets, setTickets] = useState([]);

  useEffect(() => {

    fetchTickets();

    socket.on("queueUpdated", (data) => {
      setTickets(data);
    });

  }, []);

  const fetchTickets = async () => {

    const res = await axios.get(
      "http://10.202.202.92:5000/tickets"
    );

    setTickets(res.data);
  };

  const createTicket = async (type) => {

    await axios.post(
      "http://10.202.202.92:5000/tickets",
      { type }
    );

  };

  return (

    <View style={{ padding: 40 }}>

      <Text style={{ fontSize: 24 }}>
        Customer App
      </Text>

      <Button
        title="Create Billing Ticket"
        onPress={() => createTicket("billing")}
      />

      <View style={{ height: 20 }} />

      <Button
        title="Create Technical Ticket"
        onPress={() => createTicket("technical")}
      />

      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (

          <View
            style={{
              marginTop: 20,
              borderWidth: 1,
              padding: 10,
            }}
          >

            <Text>
              ID: {item.id}
            </Text>

            <Text>
              Type: {item.type}
            </Text>

            <Text>
              Position: {index + 1}
            </Text>

            <Text>
              Priority: {item.priority}
            </Text>

            <Text>
              Status: {item.status}
            </Text>

          </View>

        )}
      />

    </View>

  );
}