import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
} from "@react-pdf/renderer";

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface PDFReportProps {
  messages: Message[];
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#ffffff",
  },
  section: {
    margin: 10,
    padding: 10,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    color: "#000000",
  },
  messageContainer: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
  },
  userMessage: {
    backgroundColor: "#e3f2fd",
    marginLeft: "auto",
    maxWidth: "80%",
  },
  botMessage: {
    backgroundColor: "#f5f5f5",
    marginRight: "auto",
    maxWidth: "80%",
  },
  messageText: {
    fontSize: 12,
    color: "#000000",
  },
  timestamp: {
    fontSize: 8,
    color: "#666666",
    marginTop: 5,
  },
  header: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 20,
    textAlign: "center",
  },
});

const PDFReport: React.FC<PDFReportProps> = ({ messages }) => {
  const formatDate = (date: Date) => {
    return date.toLocaleString();
  };

  return (
    <PDFViewer style={{ width: "100%", height: "100vh" }}>
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.title}>Chat Conversation Report</Text>
            <Text style={styles.header}>
              Generated on {new Date().toLocaleString()}
            </Text>
            {messages.map((message, index) => (
              <View
                key={index}
                style={[
                  styles.messageContainer,
                  message.isUser ? styles.userMessage : styles.botMessage,
                ]}
              >
                <Text style={styles.messageText}>{message.text}</Text>
                <Text style={styles.timestamp}>
                  {message.isUser ? "You" : "Assistant"} -{" "}
                  {formatDate(message.timestamp)}
                </Text>
              </View>
            ))}
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};

export default PDFReport;
