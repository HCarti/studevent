import React, { useEffect, useState } from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import logo from "../Images/NU_logo.png";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.4,
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: '1px solid #ccc',
  },
  logo: {
    width: 80,
    height: 40,
  },
  headerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 15,
    color: '#2c3e50',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2c3e50',
    borderBottom: '1px solid #000',
    paddingBottom: 4,
    textTransform: 'uppercase',
  },
  borderedField: {
    border: '1px solid #000',
    padding: 10,
    marginBottom: 8,
    borderRadius: 3,
    backgroundColor: '#fafafa',
  },
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 8,
    borderBottom: '1px solid #000',
    paddingBottom: 8,
  },
  fieldLabel: {
    width: '30%',
    fontWeight: 'bold',
    color: '#555',
  },
  fieldValue: {
    width: '70%',
  },
  tableContainer: {
    marginTop: 15,
    marginBottom: 20,
  },
  tableTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#f2f4f7',
    textAlign: 'center',
    backgroundColor: '#1e4d8f',
    padding: 6,
    border: '1px solid #000',
    borderBottom: 'none',
  },
  table: {
    width: '100%',
    border: '1px solid #000',
    fontSize: 10,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  tableCell: {
    padding: 8,
    borderRight: '1px solid #000',
    borderBottom: '1px solid #000',
    flex: 1,
  },
  lastTableCell: {
    padding: 8,
    borderBottom: '1px solid #000',
    flex: 1,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  bulletPoint: {
    width: 15,
    fontSize: 12,
    color: '#555',
  },
  bulletText: {
    flex: 1,
  },
  signatureArea: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 20,
  },
  signatureBox: {
    width: '45%',
    borderTop: '1px solid #ccc',
    paddingTop: 10,
    textAlign: 'center',
  },
  signatureLabel: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  signatureLine: {
    marginVertical: 15,
    borderTop: '1px solid #333',
    width: '80%',
    alignSelf: 'center',
  },
  signatureText: {
    fontSize: 10,
    color: '#666',
  },
     // Updated styles for cover page
  coverPage: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    padding: 40,
    backgroundColor: '#fff',
  },
  coverLogo: {
    width: 80,
    height: 80,
    marginBottom: 30,
  },
  organizationName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 40,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  proposalText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    textTransform: 'uppercase',
    marginTop: 40,
    borderTop: '2px solid #2c3e50',
    borderBottom: '2px solid #2c3e50',
    padding: '15px 0',
  },
  coverFooter: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
  },
  // Signature section styles
  signatureSection: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#000',
    padding: 8,
  },
  signatureTitle: {
    fontWeight: 'bold',
    textDecoration: 'underline',
    marginBottom: 10,
    fontSize: 11,
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  borderedSignatureColumn: {
    width: '48%',
    padding: 8,
    marginBottom: 10,
  },
  signatureLabel: {
    fontWeight: 'bold',
    fontSize: 9,
    marginBottom: 5,
  },
  signatureLine: {
    borderBottom: '1px solid #000',
    height: 20,
    marginBottom: 5,
  },
  signatureName: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  signaturePosition: {
    fontSize: 8,
  },
  signatureImage: {
    width: 100,
    height: 40,
    marginBottom: 5,
  },
  dateText: {
    fontSize: 8,
    marginTop: 3,
  },
  remarksText: {
    fontSize: 8,
    color: '#666',
    marginTop: 3,
  }
});

const formatDate = (dateString) => {
    if (!dateString) return '___________';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

const SignatureField = ({ title, name, position, signature, date,}) => (
  <View style={styles.borderedSignatureColumn}>
    <Text style={styles.signatureLabel}>{title}</Text>
    
    {signature ? (
      <Image src={signature} style={styles.signatureImage} />
    ) : (
      <View style={styles.signatureLine} />
    )}
    
    <Text style={styles.signatureName}>{name || '________________'}</Text>
    {position && <Text style={styles.signaturePosition}>{position}</Text>}
    <Text style={styles.dateText}>Date: {formatDate(date)}</Text>
    
  </View>
);

const ProjectPdf = ({ formData, signatures = {} }) => {

    const [organizationName, setOrganizationName] = useState('ORGANIZATION');
    const [loading, setLoading] = useState(true);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  
  useEffect(() => {
    const fetchOrganizationName = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || !formData.emailAddress) {
          setLoading(false);
          return;
        }

        // First fetch all organizations to map emails to organization names
        const response = await fetch("https://studevent-server.vercel.app/api/organizations", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const orgsData = await response.json();
          const org = orgsData.find(o => o.email === formData.emailAddress);
          if (org) {
            setOrganizationName(org.organizationName);
          }
        }
      } catch (error) {
        console.error("Error fetching organization data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizationName();
  }, [formData.emailAddress]);


  return (
    <Document>
        {/* Cover Page */}
        <Page size="A4" style={styles.page}>
        <View style={styles.coverPage}>
          <Image style={styles.coverLogo} src={logo} />
          {!loading && (
            <Text style={styles.organizationName}>
              {organizationName}
            </Text>
          )}
          <Text style={styles.proposalText}>PROJECT PROPOSAL</Text>
          <Text style={styles.coverFooter}>
            Submitted on: {formatDate(new Date())} | 
            Submitted by: {formData.emailAddress}
          </Text>
        </View>
      </Page>


      {/* Page 1: Project Overview */}
      <Page size="A4" style={styles.page}>

        <View style={styles.section}>
        <View style={styles.tableContainer}>
        <Text style={styles.tableTitle}>PROJECT TITLE</Text>
        <View style={styles.table}>
              <View style={styles.tableRow}>
              <Text style={[styles.tableCell, {flex: 1, textAlign: 'center'}]}>{formData.projectTitle || 'Project Proposal'}</Text>
              </View>
            </View>
        </View>
        </View>
        {/* Project Description */}
        <View style={styles.section}>
          <View style={styles.tableContainer}>
            <Text style={styles.tableTitle}>PROJECT DESCRIPTION</Text>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, {flex: 1, textAlign: 'center' }]}>{formData.projectDescription}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Project Objectives */}
        <View style={styles.section}>
          <View style={styles.tableContainer}>
            <Text style={styles.tableTitle}>PROJECT OBJECTIVES</Text>
            <View style={styles.table}>
              {formData.projectObjectives?.split('\n').map((item, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, {flex: 1, flexDirection: 'row'}]}>
                    <Text style={styles.bulletPoint}>• </Text>
                    <Text>{item}</Text>
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Event Details */}
        <View style={styles.section}>
          <View style={styles.tableContainer}>
            <Text style={styles.tableTitle}>EVENT DETAILS</Text>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, {width: '30%', fontWeight: 'bold'}]}>Date:</Text>
                <Text style={[styles.lastTableCell, {width: '70%'}]}>{formatDate(formData.startDate)}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, {width: '30%', fontWeight: 'bold'}]}>Time:</Text>
                <Text style={[styles.lastTableCell, {width: '70%'}]}>{formData.eventTime || '12:00 PM to 5:00 PM'}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, {width: '30%', fontWeight: 'bold'}]}>Theme:</Text>
                <Text style={[styles.lastTableCell, {width: '70%'}]}>{formData.eventTheme || 'Modern Filipiniana'}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, {width: '30%', fontWeight: 'bold'}]}>Venue:</Text>
                <Text style={[styles.lastTableCell, {width: '70%'}]}>{formData.venue}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, {width: '30%', fontWeight: 'bold'}]}>Target Participants:</Text>
                <Text style={[styles.lastTableCell, {width: '70%'}]}>{formData.targetParticipants}</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>

      {/* Page 2: Project Guidelines */}
      <Page size="A4" style={styles.page}>

        <View style={styles.section}>
          <View style={styles.tableContainer}>
            <Text style={styles.tableTitle}>PROJECT GUIDELINES</Text>
            <View style={styles.table}>
              {formData.projectGuidelines?.split('\n\n').map((section, index) => {
                const [title, ...content] = section.split('\n');
                return (
                  <React.Fragment key={index}>
                    <View style={[styles.tableRow, {backgroundColor: '#f9f9f9'}]}>
                      <Text style={[styles.tableCell, {flex: 1, fontWeight: 'bold'}]}>{title}</Text>
                    </View>
                    {content.map((item, i) => (
                      <View key={i} style={styles.tableRow}>
                        <Text style={[styles.tableCell, {flex: 1, flexDirection: 'row'}]}>
                          <Text style={styles.bulletPoint}>• </Text>
                          <Text>{item}</Text>
                        </Text>
                      </View>
                    ))}
                  </React.Fragment>
                );
              })}
            </View>
          </View>
        </View>
      </Page>

      {/* Page 3: Program Flow and Team Leaders */}
      <Page size="A4" style={styles.page}>


        <View style={styles.tableContainer}>
          <Text style={styles.tableTitle}>PROGRAM FLOW</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>Time</Text>
              <Text style={styles.tableCell}>Duration</Text>
              <Text style={styles.lastTableCell}>Segment</Text>
            </View>
            {formData.programFlow?.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{item.timeRange}</Text>
                <Text style={styles.tableCell}>{item.duration}</Text>
                <Text style={styles.lastTableCell}>{item.segment}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.tableContainer}>
          <Text style={styles.tableTitle}>TEAM LEADERS</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>Name</Text>
              <Text style={styles.lastTableCell}>Designated Office</Text>
            </View>
            {formData.projectHeads?.map((head, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{head.headName}</Text>
                <Text style={styles.lastTableCell}>{head.designatedOffice}</Text>
              </View>
            ))}
          </View>
        </View>
      </Page>

      {/* Page 4: Additional Sections */}
      {(formData.workingCommittees?.length > 0 || 
        formData.taskDeligation?.length > 0 || 
        formData.timelineSchedules?.length > 0) && (
        <Page size="A4" style={styles.page}>

          {/* Working Committees */}
          {formData.workingCommittees?.length > 0 && (
            <View style={styles.tableContainer}>
              <Text style={styles.tableTitle}>WORKING COMMITTEES</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={styles.tableCell}>Name</Text>
                  <Text style={styles.lastTableCell}>Designated Task</Text>
                </View>
                {formData.workingCommittees.map((committee, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={styles.tableCell}>{committee.workingName}</Text>
                    <Text style={styles.lastTableCell}>{committee.designatedTask}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Task Delegation */}
          {formData.taskDeligation?.length > 0 && (
            <View style={styles.tableContainer}>
              <Text style={styles.tableTitle}>TASK DELEGATION</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={styles.tableCell}>Task List</Text>
                  <Text style={styles.lastTableCell}>Deadline</Text>
                </View>
                {formData.taskDeligation.map((task, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={styles.tableCell}>{task.taskList}</Text>
                    <Text style={styles.lastTableCell}>{formatDate(task.deadline)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Timeline Schedules */}
          {formData.timelineSchedules?.length > 0 && (
            <View style={styles.tableContainer}>
              <Text style={styles.tableTitle}>TIMELINE SCHEDULES</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={styles.tableCell}>Publication Materials</Text>
                  <Text style={styles.lastTableCell}>Schedule</Text>
                </View>
                {formData.timelineSchedules.map((schedule, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={styles.tableCell}>{schedule.publicationMaterials}</Text>
                    <Text style={styles.lastTableCell}>{formatDate(schedule.schedule)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </Page>
      )}

      {/* Page 5: Equipment and Budget */}
      {(formData.schoolEquipments?.length > 0 || formData.budgetProposal?.length > 0) && (
        <Page size="A4" style={styles.page}>

          {/* School Equipment */}
          {formData.schoolEquipments?.length > 0 && (
            <View style={styles.tableContainer}>
              <Text style={styles.tableTitle}>SCHOOL EQUIPMENT NEEDED</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={styles.tableCell}>Equipment</Text>
                  <Text style={styles.lastTableCell}>Estimated Quantity</Text>
                </View>
                {formData.schoolEquipments.map((equipment, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={styles.tableCell}>{equipment.equipments}</Text>
                    <Text style={styles.lastTableCell}>{equipment.estimatedQuantity}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Budget Proposal */}
          {formData.budgetProposal?.length > 0 && (
            <View style={styles.tableContainer}>
              <Text style={styles.tableTitle}>BUDGET PROPOSAL</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={styles.tableCell}>Budget Items</Text>
                  <Text style={styles.tableCell}>Est. Quantity</Text>
                  <Text style={styles.tableCell}>Cost Per Unit</Text>
                  <Text style={styles.lastTableCell}>Est. Amount</Text>
                </View>
                {formData.budgetProposal.map((item, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={styles.tableCell}>{item.budgetItems}</Text>
                    <Text style={styles.tableCell}>{item.budgetEstimatedQuantity}</Text>
                    <Text style={styles.tableCell}>{item.budgetPerUnit}</Text>
                    <Text style={styles.lastTableCell}>{item.budgetEstimatedAmount}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </Page>
      )}

       <Page size="A4" style={styles.page}>
            {/* Signatures Section */}
            <View style={styles.signatureSection}>
              <Text style={styles.signatureTitle}>SIGNATURES / APPROVALS</Text>
              
              <View style={styles.signatureRow}>
                <SignatureField 
                  title="Prepared by:"
                  name={signatures.preparedBy?.name || formData?.preparedBy}
                  position="President of Organization/Organizer"
                  signature={signatures.preparedBy?.signature}
                  date={signatures.preparedBy?.date}
                />
                
                <SignatureField 
                  title="SDAO Coordinator"
                  name={signatures.admin?.name || "Neresa N. Navarro"}
                  position="SDAO"
                  signature={signatures.admin?.signature}
                  date={signatures.admin?.date}
                />
              </View>
              
              
              <View style={styles.signatureRow}>
                <SignatureField 
                  title="Academic Services"
                  name={signatures.academicservices?.name || "Gabriel S. Cabardo"}
                  position="Academic Services"
                  signature={signatures.academicservices?.signature}
                  date={signatures.academicservices?.date}
                />
                
                <SignatureField 
                  title="Executive Director"
                  name={signatures.executivedirector?.name || "Dolly Rose Manalang"}
                  position="Executive Director"
                  signature={signatures.executivedirector?.signature}
                  date={signatures.executivedirector?.date}
                />
              </View>
            </View>
          </Page>
    </Document>
  );
};

export default ProjectPdf;