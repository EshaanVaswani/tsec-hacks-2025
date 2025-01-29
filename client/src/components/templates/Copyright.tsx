import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: "Helvetica",
    lineHeight: 1.5,
  },
  title: {
    fontSize: 18,
    marginBottom: 4,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    marginBottom: 10,
  },
  field: {
    marginBottom: 8,
  },
  label: {
    color: "#666",
    marginBottom: 4,
  },
  value: {
    borderBottom: "1 solid black",
    paddingBottom: 2,
  },
  text: {
    marginBottom: 8,
  },
  signature: {
    marginTop: 30,
    borderTop: "1 solid black",
    paddingTop: 10,
  },
  indent: {
    marginLeft: 20,
  },
});

interface CopyrightNoticePDFProps {
  data: {
    requesterName: string;
    copyrightOwner: string;
    workTitle: string;
    workDescription: string;
    infringingMaterial: string;
    infringingDescription: string;
    location: string;
    email: string;
    phoneNumber: string;
    postalAddress: string;
    contactPreference: string;
    fullName: string;
  };
}

export const CopyrightNoticePDF: React.FC<CopyrightNoticePDFProps> = ({
  data,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Notice of Copyright Infringement</Text>
      <Text style={styles.subtitle}>
        Request for Removal of Infringing Material
      </Text>

      <View style={styles.section}>
        <Text style={styles.text}>
          I, {data.requesterName}, certify that {data.copyrightOwner} is the
          owner of the following work(s): {data.workTitle}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Description of Work(s):</Text>
        <Text style={styles.value}>{data.workDescription}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.text}>The material {data.infringingMaterial}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Description of Infringing Material(s):</Text>
        <Text style={styles.value}>{data.infringingDescription}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.text}>located at {data.location}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.text}>
          I have a good faith belief that the use of the work(s) described above
          in the material(s) listed here is not authorized by the copyright
          owner, an agent of the copyright owner, or the law.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.text}>
          I request that you expeditiously remove or disable access to the
          material identified directly above.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.text}>You may contact me at:</Text>
        <View style={styles.indent}>
          <Text style={styles.text}>Email: {data.email}</Text>
          <Text style={styles.text}>Phone: {data.phoneNumber}</Text>
          <Text style={styles.text}>Address: {data.postalAddress}</Text>
          <Text style={styles.text}>
            Preferably by: {data.contactPreference}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.text}>
          Under penalty of perjury, I attest that the information in this
          notification is accurate and that I am, or am authorized to act on
          behalf of, the owner of the rights being infringed by the material
          listed above.
        </Text>
      </View>

      <View style={styles.signature}>
        <Text style={styles.text}>Full Name: {data.fullName}</Text>
        <Text style={styles.text}>Date: {new Date().toLocaleDateString()}</Text>
      </View>
    </Page>
  </Document>
);
