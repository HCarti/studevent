import { useLocation } from 'react-router-dom';

const PdfPreviewPage = () => {
  const location = useLocation();
  const { pdfUrl } = location.state || {}; // Retrieve the pdfUrl from state

  if (!pdfUrl) {
    return <div>No PDF available to preview</div>;
  }

  return (
    <div>
      <h2>PDF Preview</h2>
      <iframe
        src={pdfUrl}
        width="100%"
        height="1000px"
        title="PDF Preview"
      />
    </div>
  );
};

export default PdfPreviewPage;
