  import React from 'react';
  import { Page, Text, View, Document, StyleSheet, Image, PDFViewer } from '@react-pdf/renderer';
  import NU_logo from "../Images/NU_logo.png";

  // A4 dimensions in points (1mm = 2.83465 points)
  const A4_WIDTH = 595;
  const A4_HEIGHT = 842;

  const styles = StyleSheet.create({
    document: {
      width: '100%',
      minHeight: '100vh',
    },
    page: {
      padding: 40,
      fontSize: 10,
      lineHeight: 1.5,
      color: '#333',
      backgroundColor: '#FFF',
      size: 'A4',
    },
    header: {
      flexDirection: "row",
      marginBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#1a365d',
      paddingBottom: 10,
    },
    logo: {
      width: 50,
      height: 50,
    },
    headerText: {
      marginLeft: 15,
      justifyContent: "center",
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: "bold",
      color: '#1a365d',
    },
    formTitle: {
      textAlign: "center",
      fontSize: 14,
      marginBottom: 20,
      fontWeight: "bold",
      color: '#1a365d',
      textTransform: 'uppercase',
    },
    section: {
      marginBottom: 15,
      padding: 10,
      borderWidth: 1,
      borderColor: "#ddd",
      borderRadius: 4,
      backgroundColor: '#f8fafc',
    },
    sectionTitle: {
      fontWeight: "bold",
      backgroundColor: "#1a365d",
      color: 'white',
      padding: 5,
      margin: -10,
      marginBottom: 5,
      fontSize: 11,
      textTransform: 'uppercase',
    },
    formRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 5,
      gap: 10,
    },
    formColumn: {
      flex: 1,
    },
    signatureRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    table: {
      borderWidth: 1,
      borderColor: "#ddd",
      marginTop: 5,
      backgroundColor: 'white',
    },
    tableRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      padding: 5,
      borderBottomWidth: 1,
      borderBottomColor: "#ddd",
    },
    tableCell: {
      flex: 1,
      padding: 3,
    },
    tableHeader: {
      fontWeight: 'bold',
      backgroundColor: '#edf2f7',
    },
    footer: {
      position: 'absolute',
      bottom: 30,
      left: 0,
      right: 0,
      textAlign: 'center',
      fontSize: 8,
      color: '#666',
    },
    pageNumber: {
      position: 'absolute',
      bottom: 20,
      left: 0,
      right: 0,
      textAlign: 'center',
      fontSize: 10,
      color: '#666',
    },
    longText: {
      textAlign: 'justify',
      marginBottom: 5,
      lineHeight: 1.4,
    },
    label: {
      fontWeight: 'bold',
      marginRight: 5,
      fontSize: 10,
    },
    value: {
      flex: 1,
    },
    borderedField: {
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 3,
      padding: 5,
      marginBottom: 8,
      backgroundColor: '#f8fafc',
    },
    borderedFieldLabel: {
      fontWeight: 'bold',
      fontSize: 10,
      marginBottom: 3,
      paddingBottom: 3,
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
    },
    borderedFieldValue: {
      fontSize: 10,
      minHeight: 15,
      paddingTop: 3,
    },
    borderedRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 5,
      gap: 10,
    },
    borderedColumn: {
      flex: 1,
    },
    // compact tables
    compactTable: {
      borderWidth: 1,
      borderColor: '#000',
      marginBottom: 10,
    },
    compactTableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#000',
    },
    compactTableFirstCell: {
      width: '40%',
      padding: 3,
      borderRightWidth: 1,
      borderRightColor: '#000',
      backgroundColor: '#f0f0f0',
    },
    compactTableCell: {
      width: '60%',
      padding: 3,
    },
    compactTableIndentedRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#000',
    },
    compactTableIndentedCell: {
      width: '40%',
      padding: 3,
      paddingLeft: 15,
      borderRightWidth: 1,
      borderRightColor: '#000',
    },
    //signature section
    signatureSection: {
      marginTop: 12,
      borderWidth: 1,
      borderColor: '#000',
      padding: 5,
    },
    signatureTitle: {
      fontWeight: 'bold',
      textDecoration: 'underline',
      marginBottom: 10,
    },
    signatureRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 15,
    },
    signatureColumn: {
      width: '48%',
    },
    signatureSubRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 5,
    },
    signatureLabel: {
      fontWeight: 'bold',
      fontSize: 10,
    },
    signatureValue: {
      minHeight: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#000',
      marginBottom: 10,
    },
    signatureName: {
      marginTop: 5,
      fontSize: 10,
    },
    signatureImage: {
      width: 120,
      height: 50,
      // borderWidth: 1,
      // borderColor: '#000',
      marginBottom: 5,
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 5,
    },
    checkbox: {
      width: 10,
      height: 10,
      borderWidth: 1,
      borderColor: 'black',
      marginRight: 5,
    },
    checked: {
      backgroundColor: 'black',
    },
    dateText: {
      marginTop: 5,
      fontSize: 10,
    },
    borderedSignatureColumn: {
      width: '48%',
      padding: 8,
      marginBottom: 10,
    },
    signatureRowGap: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 5,
      gap: 8
    },
    signatureDivider: {
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
      marginVertical: 8
    },
    guidanceParagraph: {
    fontSize: 9,
    color: '#555',
    marginBottom: 15,
    lineHeight: 1.3,
    textAlign: 'justify',
    fontStyle: 'italic',
  },
    
  });

  // Create Document Component with Page Numbers
  const ActivityPdf = ({ formData = {}, signatures = {}, budgetData = null }) => {
    // Destructure with proper fallbacks
    const {
      eventLocation = "N/A",
      applicationDate = "N/A",
      studentOrganization = "N/A",
      contactPerson = "N/A",
      contactNo = "N/A",
      emailAddress = "N/A",
      eventTitle = "N/A",
      eventType = "N/A",
      venueAddress = "N/A",
      eventStartDate = "N/A",
      eventEndDate = "N/A",
      organizer = "N/A",
      budgetAmount = "N/A",
      budgetFrom = "N/A",
      coreValuesIntegration = "N/A",
      objectives = "N/A",
      marketingCollaterals = "N/A",
      pressRelease = "N/A",
      others = "N/A",
      eventFacilities = "N/A",
      holdingArea = "N/A",
      toilets = "N/A",
      transportationandParking = "N/A",
      more = "N/A",
      houseKeeping = "N/A",
      wasteManagement = "N/A",
      eventManagementHead = "N/A",
      eventCommitteesandMembers = "N/A",
      health = "N/A",
      safetyAttendees = "N/A",
      emergencyFirstAid = "N/A",
      fireSafety = "N/A",
      weather = "N/A",
      presidentName = "N/A",
      presidentSignature = null
    } = formData;

    // Format date function
    const formatDate = (dateString) => {
      if (!dateString || dateString === "N/A") return "N/A";
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };
    
    const SignatureField = ({ title, name, firstName, lastName, signature, date, status, remarks }) => (
      <View style={styles.signatureColumn}>
        <Text style={styles.signatureLabel}>{title}</Text>
        
        {signature ? (
          <Image 
            src={signature} 
            style={styles.signatureImage}
          />
        ) : (
          <View style={styles.signatureValue}></View>
        )}
        
        {/* Display name if available */}
        {(firstName || lastName) && (
          <Text style={styles.signatureName}>
            {[firstName, lastName].filter(Boolean).join(' ')}
          </Text>
        )}
        
        <Text style={styles.dateText}>
          Date: {date ? formatDate(date) : '__________'}
        </Text>
        
        {remarks && (
          <Text style={styles.remarksText}>Remarks: {remarks}</Text>
        )}
      </View>
    );

    const renderBudgetSection = () => {
  if (!budgetData) return null;

  return (
    <Page size="A4" style={styles.page} wrap>
      <View style={styles.header} fixed>
        <Image src={NU_logo} style={styles.logo} />
        <View style={styles.headerText}>
          <Text style={styles.title}>NU MOA</Text>
          <Text>Student Development and Activities Office</Text>
          <Text>Attached Budget Proposal</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>BUDGET PROPOSAL DETAILS</Text>
        <View style={styles.compactTable}>
          <View style={styles.compactTableRow}>
            <Text style={styles.compactTableFirstCell}>Name Of RSO:</Text>
            <Text style={styles.compactTableCell}>
              {budgetData.nameOfRso || 'N/A'}
            </Text>
          </View>
          <View style={styles.compactTableIndentedRow}>
            <Text style={styles.compactTableFirstCell}>Event Title</Text>
            <Text style={styles.compactTableCell}>
              {budgetData.eventTitle || 'N/A'}
            </Text>
          </View>
          <View style={styles.compactTableIndentedRow}>
            <Text style={styles.compactTableFirstCell}>Total Budget</Text>
            <Text style={[styles.compactTableCell, { fontWeight: 'bold' }]}>
              {typeof budgetData.grandTotal === 'number'
                ? `₱${budgetData.grandTotal.toLocaleString('en-PH')}`
                : 'N/A'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>BUDGET ITEM BREAKDOWN</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, { width: '35%' }]}>Description</Text>
            <Text style={[styles.tableCell, { width: '10%' }]}>Unit</Text>
            <Text style={[styles.tableCell, { width: '15%', textAlign: 'center' }]}>Qty</Text>
            <Text style={[styles.tableCell, { width: '20%', textAlign: 'right' }]}>Unit Cost</Text>
            <Text style={[styles.tableCell, { width: '20%', textAlign: 'right' }]}>Total Cost</Text>
          </View>
          {(budgetData.items || []).map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: '35%' }]}>
                {item.description || 'Unspecified Item'}
              </Text>
              <Text style={[styles.tableCell, { width: '10%' }]}>
                {item.unit || '-'}
              </Text>
              <Text style={[styles.tableCell, { width: '15%', textAlign: 'center' }]}>
                {item.quantity || '0'}
              </Text>
              <Text style={[styles.tableCell, { width: '20%', textAlign: 'right' }]}>
                ₱{(item.unitCost || 0).toLocaleString('en-PH')}
              </Text>
              <Text style={[styles.tableCell, { 
                width: '20%', 
                textAlign: 'right', 
                fontWeight: 'bold' 
              }]}>
                ₱{(item.totalCost || 0).toLocaleString('en-PH')}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Budget Signatures and Endorsements */}
      <View style={styles.signatureSection}>
        <Text style={styles.signatureTitle}>BUDGET SIGNATURES / ENDORSEMENTS</Text>
        <View style={styles.signatureRowGap}>
          {/* President's Signature */}
          <View style={styles.borderedSignatureColumn}>
            <Text style={styles.signatureLabel}>a. Organization President</Text>
            <View style={styles.signatureDivider} />
            {presidentSignature ? (
              <>
                <Image 
                  src={presidentSignature} 
                  style={styles.signatureImage}
                />
                <Text style={styles.signatureName}>{presidentName || 'President'}</Text>
                <Text style={styles.dateText}>Date: ___________________</Text>
              </>
            ) : (
              <>
                <View style={styles.signatureValue}></View>
                <Text style={styles.signatureName}>{presidentName || 'President'}</Text>
                <Text style={styles.dateText}>Date: ___________________</Text>
              </>
            )}
          </View>
          
          {/* Faculty Adviser */}
          <View style={styles.borderedSignatureColumn}>
            <Text style={styles.signatureLabel}>b. Faculty Adviser</Text>
            <View style={styles.signatureDivider} />
            {signatures.adviser ? (
              <>
                {signatures.adviser.signature ? (
                  <Image 
                    src={signatures.adviser.signature} 
                    style={styles.signatureImage}
                  />
                ) : (
                  <View style={styles.signatureValue}></View>
                )}
                <Text style={styles.signatureName}>
                  {signatures.adviser.firstName || signatures.adviser.lastName
                    ? `${signatures.adviser.firstName || ''} ${signatures.adviser.lastName || ''}`.trim()
                    : 'ADVISER NAME'}
                </Text>
                <Text style={styles.dateText}>
                  Date: {signatures.adviser.date ? formatDate(signatures.adviser.date) : "___________________"}
                </Text>
              </>
            ) : (
              <>
                <View style={styles.signatureValue}></View>
                <Text style={styles.signatureName}>ADVISER NAME</Text>
                <Text style={styles.dateText}>Date: ___________________</Text>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Budget Approvals */}
      <View style={styles.signatureSection}>
        <Text style={styles.signatureTitle}>BUDGET APPROVALS</Text>
        
        {/* Dean & Admin */}
        <View style={styles.signatureRowGap}>
          <View style={styles.borderedSignatureColumn}>
            <SignatureField 
              title="a. Dean"
              firstName={signatures.dean?.firstName}
              lastName={signatures.dean?.lastName}
              signature={signatures.dean?.signature}
              date={signatures.dean?.date}
              status={signatures.dean?.status}
            />
          </View>
          
          <View style={styles.borderedSignatureColumn}>
            <SignatureField 
              title="b. Admin"
              firstName={signatures.admin?.firstName}
              lastName={signatures.admin?.lastName}
              signature={signatures.admin?.signature}
              date={signatures.admin?.date}
              status={signatures.admin?.status}
            />
          </View>
        </View>
        
        {/* Academic Services & Academic Director */}
        <View style={styles.signatureRowGap}>
          <View style={styles.borderedSignatureColumn}>
            <SignatureField 
              title="c. Academic Services"
              firstName={signatures.academicservices?.firstName}
              lastName={signatures.academicservices?.lastName}
              signature={signatures.academicservices?.signature}
              date={signatures.academicservices?.date}
              status={signatures.academicservices?.status}
            />
          </View>
          
          <View style={styles.borderedSignatureColumn}>
            <SignatureField 
              title="d. Academic Director"
              firstName={signatures.academicdirector?.firstName}
              lastName={signatures.academicdirector?.lastName}
              signature={signatures.academicdirector?.signature}
              date={signatures.academicdirector?.date}
              status={signatures.academicdirector?.status}
            />
          </View>
        </View>
        
        {/* Executive Director */}
        <View style={[styles.borderedSignatureColumn, { width: '100%' }]}>
          <SignatureField 
            title="e. Executive Director"
            firstName={signatures.executivedirector?.firstName}
            lastName={signatures.executivedirector?.lastName}
            signature={signatures.executivedirector?.signature}
            date={signatures.executivedirector?.date}
            status={signatures.executivedirector?.status}
          />
        </View>
      </View>

      <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
        `Page ${pageNumber} of ${totalPages}`
      )} fixed />
    </Page>
  );
};

    return (
      <Document>
        <Page 
          size="A4" 
          style={styles.page}
          wrap
        >
          {/* Header */}
          <View style={styles.header} fixed>
            <Image src={NU_logo} style={styles.logo} />
            <View style={styles.headerText}>
              <Text style={styles.title}>NU MOA</Text>
              <Text>Student Development and Activities Office</Text>
            </View>
          </View>

          <Text style={styles.formTitle}>STUDENT ORGANIZATION ACTIVITY APPLICATION FORM</Text>

          <Text style={styles.guidanceParagraph}>
        This template provides guidance notes for event organizers and will help in the approval of the detailed Event Proposal/Plan. 
        This Event Proposal/Plan should be submitted at least 1 to 3 months before the event to allow time for preparation and purchasing process. 
        Please route this form and submit the signed form to: (1) Your Faculty Adviser/College Dean/Academic Director; and (2) SDAO.
      </Text>

          {/* Event Location and Date */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EVENT LOCATION</Text>
            <View style={styles.compactTable}>
              <View style={styles.compactTableRow}>
                <Text style={styles.compactTableFirstCell}>Location</Text>
                <Text style={styles.compactTableCell}>{eventLocation}</Text>
              </View>
              <View style={styles.compactTableIndentedRow}>
                <Text style={styles.compactTableFirstCell}>Date Of Application</Text>
                <Text style={styles.compactTableCell}>{formatDate(applicationDate)}</Text>
              </View>
            </View>
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. CONTACT INFORMATION</Text>
            <View style={styles.compactTable}>
              <View style={styles.compactTableRow}>
                <Text style={styles.compactTableFirstCell}>Student Organization</Text>
                <Text style={styles.compactTableCell}>{studentOrganization}</Text>
              </View>
              <View style={styles.compactTableIndentedRow}>
                <Text style={styles.compactTableFirstCell}>Contact Person</Text>
                <Text style={styles.compactTableCell}>{contactPerson}</Text>
              </View>
              <View style={styles.compactTableIndentedRow}>
                <Text style={styles.compactTableFirstCell}>Contact No.</Text>
                <Text style={styles.compactTableCell}>{contactNo}</Text>
              </View>
              <View style={styles.compactTableIndentedRow}>
                <Text style={styles.compactTableFirstCell}>Email Address</Text>
                <Text style={styles.compactTableCell}>{emailAddress}</Text>
              </View>
            </View>
          </View>

          {/* Event Details */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. EVENT DETAILS</Text>
            <View style={styles.compactTable}>
              <View style={styles.compactTableRow}>
                <Text style={styles.compactTableFirstCell}>Event Title</Text>
                <Text style={styles.compactTableCell}>{eventTitle}</Text>
              </View>
              <View style={styles.compactTableIndentedRow}>
                <Text style={styles.compactTableFirstCell}>Event Type</Text>
                <Text style={styles.compactTableCell}>{eventType}</Text>
              </View>
              <View style={styles.compactTableIndentedRow}>
                <Text style={styles.compactTableFirstCell}>Venue Address</Text>
                <Text style={styles.compactTableCell}>{venueAddress}</Text>
              </View>
              <View style={styles.compactTableIndentedRow}>
                <Text style={styles.compactTableFirstCell}>Start Date</Text>
                <Text style={styles.compactTableCell}>{formatDate(eventStartDate)}</Text>
              </View>
              <View style={styles.compactTableIndentedRow}>
                <Text style={styles.compactTableFirstCell}>End Date</Text>
                <Text style={styles.compactTableCell}>{formatDate(eventEndDate)}</Text>
              </View>
              <View style={styles.compactTableIndentedRow}>
                <Text style={styles.compactTableFirstCell}>Organizer</Text>
                <Text style={styles.compactTableCell}>{organizer}</Text>
              </View>
              <View style={styles.compactTableIndentedRow}>
                <Text style={styles.compactTableFirstCell}>Budget Amount</Text>
                <Text style={styles.compactTableCell}>
                  {typeof budgetAmount === 'number' 
                    ? `₱${budgetAmount.toLocaleString('en-PH')}`
                    : budgetAmount === 'N/A'
                      ? 'N/A'
                      : `₱${budgetAmount}`}
                </Text>
              </View>
              <View style={styles.compactTableIndentedRow}>
                <Text style={styles.compactTableFirstCell}>Budget From</Text>
                <Text style={styles.compactTableCell}>{budgetFrom}</Text>
              </View>
            </View>
          </View>

          {/* Core Values Integration */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CORE VALUES INTEGRATION</Text>
            <Text style={styles.longText}>{coreValuesIntegration}</Text>
          </View>

          {/* Objectives */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>OBJECTIVES</Text>
            <Text style={styles.longText}>{objectives}</Text>
          </View>

          {/* Communications and Promotions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>COMMUNICATIONS AND PROMOTIONS REQUIRED</Text>
            <View style={styles.compactTable}>
              <View style={styles.compactTableRow}>
                <Text style={styles.compactTableFirstCell}>Marketing Collaterals</Text>
                <Text style={styles.compactTableCell}>{marketingCollaterals}</Text>
              </View>
              <View style={styles.compactTableRow}>
                <Text style={styles.compactTableFirstCell}>Press Release</Text>
                <Text style={styles.compactTableCell}>{pressRelease}</Text>
              </View>
              <View style={styles.compactTableRow}>
                <Text style={styles.compactTableFirstCell}>Others</Text>
                <Text style={styles.compactTableCell}>{others}</Text>
              </View>
            </View>
          </View>

        {/* Facilities Considerations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>FACILITIES CONSIDERATIONS</Text>
            <View style={styles.compactTable}>
              <View style={styles.compactTableRow}>
                <Text style={styles.compactTableFirstCell}>Event Facilities</Text>
                <Text style={styles.compactTableCell}>{eventFacilities}</Text>
              </View>
              <View style={styles.compactTableIndentedRow}>
                <Text style={styles.compactTableFirstCell}>Holding Area</Text>
                <Text style={styles.compactTableCell}>{holdingArea}</Text>
              </View>
              <View style={styles.compactTableIndentedRow}>
                <Text style={styles.compactTableFirstCell}>Toilets</Text>
                <Text style={styles.compactTableCell}>{toilets}</Text>
              </View>
              <View style={styles.compactTableIndentedRow}>
                <Text style={styles.compactTableFirstCell}>Transportation & Parking</Text>
                <Text style={styles.compactTableCell}>{transportationandParking}</Text>
              </View>
              <View style={styles.compactTableIndentedRow}>
                <Text style={styles.compactTableFirstCell}>Others</Text>
                <Text style={styles.compactTableCell}>{more}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.compactTable}>
              <View style={styles.compactTableIndentedRow}>
                <Text style={styles.compactTableFirstCell}>House Keeping</Text>
                <Text style={styles.compactTableCell}>{houseKeeping}</Text>
              </View>
              <View style={styles.compactTableIndentedRow}>
                <Text style={styles.compactTableFirstCell}>Waste Management</Text>
                <Text style={styles.compactTableCell}>{wasteManagement}</Text>
              </View>
            </View>
          </View>

          {/* Event Management Team */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. EVENT MANAGEMENT TEAM</Text>
            <View style={styles.compactTable}>
              <View style={styles.compactTableRow}>
                <Text style={styles.compactTableFirstCell}>Management Head</Text>
                <Text style={styles.compactTableCell}>{eventManagementHead}</Text>
              </View>
              <View style={styles.compactTableIndentedRow}>
                <Text style={styles.compactTableFirstCell}>Committees and Members</Text>
                <Text style={styles.compactTableCell}>{eventCommitteesandMembers}</Text>
              </View>
            </View>
          </View>


          {/* Risk Assessments */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. RISK ASSESSMENTS</Text>
            <View style={styles.compactTable}>
              <View style={styles.compactTableRow}>
                <Text style={styles.compactTableFirstCell}>Health</Text>
                <Text style={styles.compactTableCell}>{health}</Text>
              </View>
              <View style={styles.compactTableIndentedRow}>
                <Text style={styles.compactTableFirstCell}>Safety Attendees</Text>
                <Text style={styles.compactTableCell}>{safetyAttendees}</Text>
              </View>
              <View style={styles.compactTableIndentedRow}>
                <Text style={styles.compactTableFirstCell}>Emergency/First Aid</Text>
                <Text style={styles.compactTableCell}>{emergencyFirstAid}</Text>
              </View>
              <View style={styles.compactTableIndentedRow}>
                <Text style={styles.compactTableFirstCell}>Fire Safety</Text>
                <Text style={styles.compactTableCell}>{fireSafety}</Text>
              </View>
              <View style={styles.compactTableIndentedRow}>
                <Text style={styles.compactTableFirstCell}>Weather</Text>
                <Text style={styles.compactTableCell}>{weather}</Text>
              </View>
            </View>
          </View>


          {/* Signatures and Endorsements Section */}
{/* Signatures and Endorsements Section */}
<View style={styles.signatureSection}>
  <Text style={styles.signatureTitle}>5. SIGNATURES / ENDORSEMENTS</Text>
  <View style={styles.signatureRowGap}>
    {/* President's Signature */}
    <View style={styles.borderedSignatureColumn}>
      <Text style={styles.signatureLabel}>a. Organization President</Text>
      <View style={styles.signatureDivider} />
      {presidentSignature ? (
        <>
          <Image 
            src={presidentSignature} 
            style={styles.signatureImage}
          />
          <Text style={styles.signatureName}>{presidentName || 'President'}</Text>
          <Text style={styles.dateText}>Date: ___________________</Text>
        </>
      ) : (
        <>
          <View style={styles.signatureValue}></View>
          <Text style={styles.signatureName}>{presidentName || 'President'}</Text>
          <Text style={styles.dateText}>Date: ___________________</Text>
        </>
      )}
    </View>
    
    {/* Faculty Adviser */}
    <View style={styles.borderedSignatureColumn}>
      <Text style={styles.signatureLabel}>b. Faculty Adviser</Text>
      <View style={styles.signatureDivider} />
      {signatures.adviser ? (
        <>
          {signatures.adviser.signature ? (
            <Image 
              src={signatures.adviser.signature} 
              style={styles.signatureImage}
            />
          ) : (
            <View style={styles.signatureValue}></View>
          )}
          <Text style={styles.signatureName}>
            {signatures.adviser.firstName || signatures.adviser.lastName
              ? `${signatures.adviser.firstName || ''} ${signatures.adviser.lastName || ''}`.trim()
              : 'ADVISER NAME'}
          </Text>
          <Text style={styles.dateText}>
            Date: {signatures.adviser.date ? formatDate(signatures.adviser.date) : "___________________"}
          </Text>
        </>
      ) : (
        <>
          <View style={styles.signatureValue}></View>
          <Text style={styles.signatureName}>ADVISER NAME</Text>
          <Text style={styles.dateText}>Date: ___________________</Text>
        </>
      )}
    </View>
  </View>
</View> 

        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `Page ${pageNumber} of ${totalPages}`
        )} fixed />
      </Page>

      {/* Second Page - Approvals */}
      {/* Second Page - Approvals */}
<Page size="A4" style={styles.page} wrap>
  <View style={styles.signatureSection}>
    <Text style={styles.signatureTitle}>APPROVALS</Text>
    
    {/* Dean & Admin */}
    <View style={styles.signatureRowGap}>
      <View style={styles.borderedSignatureColumn}>
        <SignatureField 
          title="a. Dean"
          firstName={signatures.dean?.firstName}
          lastName={signatures.dean?.lastName}
          signature={signatures.dean?.signature}
          date={signatures.dean?.date}
          status={signatures.dean?.status}
        />
      </View>
      
      <View style={styles.borderedSignatureColumn}>
        <SignatureField 
          title="b. Admin"
          firstName={signatures.admin?.firstName}
          lastName={signatures.admin?.lastName}
          signature={signatures.admin?.signature}
          date={signatures.admin?.date}
          status={signatures.admin?.status}
        />
      </View>
    </View>
    
    {/* Academic Services & Academic Director */}
    <View style={styles.signatureRowGap}>
      <View style={styles.borderedSignatureColumn}>
        <SignatureField 
          title="c. Academic Services"
          firstName={signatures.academicservices?.firstName}
          lastName={signatures.academicservices?.lastName}
          signature={signatures.academicservices?.signature}
          date={signatures.academicservices?.date}
          status={signatures.academicservices?.status}
        />
      </View>
      
      <View style={styles.borderedSignatureColumn}>
        <SignatureField 
          title="d. Academic Director"
          firstName={signatures.academicdirector?.firstName}
          lastName={signatures.academicdirector?.lastName}
          signature={signatures.academicdirector?.signature}
          date={signatures.academicdirector?.date}
          status={signatures.academicdirector?.status}
        />
      </View>
    </View>
    
    {/* Executive Director */}
    <View style={[styles.borderedSignatureColumn, { width: '100%' }]}>
      <SignatureField 
        title="e. Executive Director"
        firstName={signatures.executivedirector?.firstName}
        lastName={signatures.executivedirector?.lastName}
        signature={signatures.executivedirector?.signature}
        date={signatures.executivedirector?.date}
        status={signatures.executivedirector?.status}
      />
    </View>
  </View>

  <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
    `Page ${pageNumber} of ${totalPages}`
  )} fixed />
</Page>
        

      {budgetData && renderBudgetSection()}

        {/* Second Page for Additional Content */}
      </Document>
    );
  };

  export default ActivityPdf;   