import React from 'react';
import {Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import logo from "../Images/NU_logo.png";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 10,
  },
  logo: {
    width: 100,
    height: 50,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 15,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    backgroundColor: '#f0f0f0',
    padding: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: '40%',
    fontWeight: 'bold',
  },
  value: {
    width: '60%',
  },
  table: {
    width: '100%',
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 5,
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
  tableCol: {
    width: '25%',
    padding: 5,
  },
  signatureArea: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: '40%',
    borderTopWidth: 1,
    borderTopColor: '#000',
    paddingTop: 10,
  },
});

const ProjectPdf = ({ formData }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with Logo */}
        <View style={styles.header}>
          <Image style={styles.logo} src={logo} />
          <Text>Project Proposal Form</Text>
        </View>

        {/* Main Title */}
        <Text style={styles.title}>{formData.projectTitle || 'Project Proposal'}</Text>

        {/* Project Overview Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Overview</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Project Title:</Text>
            <Text style={styles.value}>{formData.projectTitle}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Start Date:</Text>
            <Text style={styles.value}>{formatDate(formData.startDate)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>End Date:</Text>
            <Text style={styles.value}>{formatDate(formData.endDate)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Venue:</Text>
            <Text style={styles.value}>{formData.venue}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Target Participants:</Text>
            <Text style={styles.value}>{formData.targetParticipants}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Project Description:</Text>
            <Text style={styles.value}>{formData.projectDescription}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Project Objectives:</Text>
            <Text style={styles.value}>{formData.projectObjectives}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Project Guidelines:</Text>
            <Text style={styles.value}>{formData.projectGuidelines}</Text>
          </View>
        </View>

        {/* Program Flow Section */}
        {formData.programFlow && formData.programFlow.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Program Flow</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCol}>Time Range</Text>
                <Text style={styles.tableCol}>Duration (mins)</Text>
                <Text style={styles.tableCol}>Segment</Text>
              </View>
              {formData.programFlow.map((item, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCol}>{item.timeRange}</Text>
                  <Text style={styles.tableCol}>{item.duration}</Text>
                  <Text style={styles.tableCol}>{item.segment}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Officers in Charge Section */}
        {formData.projectHeads && formData.projectHeads.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Project Heads</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCol}>Name</Text>
                <Text style={styles.tableCol}>Designated Office</Text>
              </View>
              {formData.projectHeads.map((head, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCol}>{head.headName}</Text>
                  <Text style={styles.tableCol}>{head.designatedOffice}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Working Committees Section */}
        {formData.workingCommittees && formData.workingCommittees.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Working Committees</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCol}>Name</Text>
                <Text style={styles.tableCol}>Designated Task</Text>
              </View>
              {formData.workingCommittees.map((committee, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCol}>{committee.workingName}</Text>
                  <Text style={styles.tableCol}>{committee.designatedTask}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Task Delegation Section */}
        {formData.taskDeligation && formData.taskDeligation.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Task Delegation</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCol}>Task List</Text>
                <Text style={styles.tableCol}>Deadline</Text>
              </View>
              {formData.taskDeligation.map((task, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCol}>{task.taskList}</Text>
                  <Text style={styles.tableCol}>{formatDate(task.deadline)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Timeline/Posting Schedules Section */}
        {formData.timelineSchedules && formData.timelineSchedules.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Timeline/Posting Schedules</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCol}>Publication Materials</Text>
                <Text style={styles.tableCol}>Schedule</Text>
              </View>
              {formData.timelineSchedules.map((schedule, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCol}>{schedule.publicationMaterials}</Text>
                  <Text style={styles.tableCol}>{formatDate(schedule.schedule)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* School Equipment Section */}
        {formData.schoolEquipments && formData.schoolEquipments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>School Equipment Needed</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCol}>Equipment</Text>
                <Text style={styles.tableCol}>Estimated Quantity</Text>
              </View>
              {formData.schoolEquipments.map((equipment, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCol}>{equipment.equipments}</Text>
                  <Text style={styles.tableCol}>{equipment.estimatedQuantity}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Budget Proposal Section */}
        {formData.budgetProposal && formData.budgetProposal.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Budget Proposal</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCol}>Budget Items</Text>
                <Text style={styles.tableCol}>Estimated Quantity</Text>
                <Text style={styles.tableCol}>Cost Per Unit</Text>
                <Text style={styles.tableCol}>Estimated Amount</Text>
              </View>
              {formData.budgetProposal.map((item, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCol}>{item.budgetItems}</Text>
                  <Text style={styles.tableCol}>{item.budgetEstimatedQuantity}</Text>
                  <Text style={styles.tableCol}>{item.budgetPerUnit}</Text>
                  <Text style={styles.tableCol}>{item.budgetEstimatedAmount}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Signature Area */}
        <View style={styles.signatureArea}>
          <View style={styles.signatureBox}>
            <Text>Prepared by:</Text>
            <Text>_________________________</Text>
            <Text>Name & Signature</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text>Approved by:</Text>
            <Text>_________________________</Text>
            <Text>Name & Signature</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default ProjectPdf;