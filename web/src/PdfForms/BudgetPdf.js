import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderBottom: '1px solid #000',
    paddingBottom: 5,
  },
  universityName: {
    fontSize: 12,
  },
  officeName: {
    fontSize: 10,
  },
  title: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
    textDecoration: 'underline',
  },
  formInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  formLabel: {
    width: '25%',
    fontSize: 10,
  },
  formValue: {
    width: '75%',
    borderBottom: '1px solid #000',
    paddingBottom: 2,
    fontSize: 10,
  },
  tableContainer: {
    border: '1px solid #000',
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottom: '1px solid #000',
    backgroundColor: '#f8f8f8',
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #ddd',
    fontSize: 9,
  },
  lastTableRow: {
    flexDirection: 'row',
    fontSize: 9,
  },
  colHeader: {
    padding: 3,
    borderRight: '1px solid #000',
    textAlign: 'center',
  },
  colCell: {
    padding: 3,
    borderRight: '1px solid #ddd',
    minHeight: 18,
  },
  colQty: {
    width: '8%',
  },
  colUnit: {
    width: '10%',
  },
  colDesc: {
    width: '42%',
  },
  colUnitCost: {
    width: '20%',
  },
  colTotal: {
    width: '20%',
  },
  rightAlign: {
    textAlign: 'right',
    paddingRight: 5,
  },
  centerAlign: {
    textAlign: 'center',
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    paddingRight: 15,
    fontSize: 10,
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
    border: '1px solid #000',
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  checkbox: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: '#000',
    marginRight: 5,
  },
  checked: {
    backgroundColor: '#000',
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

const SignatureField = ({ title, name, position, signature, date, status, remarks }) => (
  <View style={styles.borderedSignatureColumn}>
    <Text style={styles.signatureLabel}>{title}</Text>
    
    <View style={styles.checkboxContainer}>
      <View style={[styles.checkbox, status === 'approved' && styles.checked]} />
      <Text style={{ fontSize: 9 }}>Approved</Text>
    </View>
    <View style={styles.checkboxContainer}>
      <View style={[styles.checkbox, status === 'declined' && styles.checked]} />
      <Text style={{ fontSize: 9 }}>Disapproved</Text>
    </View>
    
    {signature ? (
      <Image src={signature} style={styles.signatureImage} />
    ) : (
      <View style={styles.signatureLine} />
    )}
    
    <Text style={styles.signatureName}>{name || '________________'}</Text>
    {position && <Text style={styles.signaturePosition}>{position}</Text>}
    <Text style={styles.dateText}>Date: {formatDate(date)}</Text>
    
    {remarks && (
      <Text style={styles.remarksText}>Remarks: {remarks}</Text>
    )}
  </View>
);

const BudgetPdf = ({ formData, signatures = {} }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* University Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.universityName}>NU MOA</Text>
          <Text style={styles.officeName}>Student Development and Activities Office</Text>
        </View>
      </View>

      {/* Form Title */}
      <Text style={styles.title}>BUDGET PROPOSAL</Text>

      {/* Organization Info */}
      <View style={styles.formInfo}>
        <Text style={styles.formLabel}>Name of RSO:</Text>
        <Text style={styles.formValue}>{formData?.nameOfRso || '_________________________'}</Text>
      </View>

      {/* Budget Table */}
      <View style={styles.tableContainer}>
        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.colHeader, styles.colQty, styles.centerAlign]}>QTY</Text>
          <Text style={[styles.colHeader, styles.colUnit, styles.centerAlign]}>UNIT</Text>
          <Text style={[styles.colHeader, styles.colDesc]}>DESCRIPTION</Text>
          <Text style={[styles.colHeader, styles.colUnitCost, styles.rightAlign]}>UNIT COST</Text>
          <Text style={[styles.colHeader, styles.colTotal, styles.rightAlign]}>TOTAL COST</Text>
        </View>
        
        {/* Table Rows */}
        {formData?.items?.map((item, index) => (
          <View 
            key={index} 
            style={index === formData.items.length - 1 ? styles.lastTableRow : styles.tableRow}
          >
            <Text style={[styles.colCell, styles.colQty, styles.centerAlign]}>{item.quantity || ''}</Text>
            <Text style={[styles.colCell, styles.colUnit, styles.centerAlign]}>{item.unit || ''}</Text>
            <Text style={[styles.colCell, styles.colDesc]}>{item.description || ''}</Text>
            <Text style={[styles.colCell, styles.colUnitCost, styles.rightAlign]}>{item.unitCost ? `₱${parseFloat(item.unitCost).toFixed(2)}` : ''}</Text>
            <Text style={[styles.colCell, styles.colTotal, styles.rightAlign]}>{item.totalCost ? `₱${parseFloat(item.totalCost).toFixed(2)}` : ''}</Text>
          </View>
        ))}
      </View>

      {/* Grand Total */}
      <View style={styles.grandTotal}>
        <Text>Grand Total: ₱{parseFloat(formData?.grandTotal || 0).toFixed(2)}</Text>
      </View>
    </Page>

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
            title="Adviser:"
            name={signatures.adviser?.name}
            position="Adviser"
            signature={signatures.adviser?.signature}
            date={signatures.adviser?.date}
            status={signatures.adviser?.status}
            remarks={signatures.adviser?.remarks}
          />
        </View>
        
        <View style={styles.signatureRow}>
          <SignatureField 
            title="College Dean"
            name={signatures.dean?.name || "Marilou Jamis"}
            position="Dean"
            signature={signatures.dean?.signature}
            date={signatures.dean?.date}
            status={signatures.dean?.status}
            remarks={signatures.dean?.remarks}
          />
          
          <SignatureField 
            title="SDAO Coordinator"
            name={signatures.admin?.name || "Neresa N. Navarro"}
            position="SDAO"
            signature={signatures.admin?.signature}
            date={signatures.admin?.date}
            status={signatures.admin?.status}
            remarks={signatures.admin?.remarks}
          />
        </View>
        
        <View style={styles.signatureRow}>
          <SignatureField 
            title="Academic Services"
            name={signatures.academicservices?.name || "Gabriel S. Cabardo"}
            position="Academic Services"
            signature={signatures.academicservices?.signature}
            date={signatures.academicservices?.date}
            status={signatures.academicservices?.status}
            remarks={signatures.academicservices?.remarks}
          />
          
          <SignatureField 
            title="Academic Director"
            name={signatures.academicdirector?.name || "Annalie De Lemos"}
            position="Academic Director"
            signature={signatures.academicdirector?.signature}
            date={signatures.academicdirector?.date}
            status={signatures.academicdirector?.status}
            remarks={signatures.academicdirector?.remarks}
          />
        </View>
        <View style={styles.signatureRow}>
          <SignatureField 
            title="Executive Director"
            name={signatures.executivedirector?.name || "Dolly Rose Manalang"}
            position="Executive Director"
            signature={signatures.executivedirector?.signature}
            date={signatures.executivedirector?.date}
            status={signatures.executivedirector?.status}
            remarks={signatures.executivedirector?.remarks}
          />
        </View>
      </View>
    </Page>
  </Document>
);

export default BudgetPdf;