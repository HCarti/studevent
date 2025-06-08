// components/SessionExpiredModal.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button } from 'antd'; // Using Ant Design, but you can use any UI library

const SessionExpiredModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  const checkTokenExpiration = () => {
    const token = localStorage.getItem('token');
    if (!token) return true;
    
    try {
      const decoded = jwtDecode(token); // You'll need jwt-decode package
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsVisible(false);
    navigate('/login');
  };

  useEffect(() => {
    // Check on initial load
    if (checkTokenExpiration()) {
      setIsVisible(true);
    }

    // Check periodically
    const interval = setInterval(() => {
      if (checkTokenExpiration()) {
        setIsVisible(true);
        clearInterval(interval);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <Modal
      title="Session Expired"
      visible={isVisible}
      onCancel={handleLogout}
      footer={[
        <Button key="login" type="primary" onClick={handleLogout}>
          Re-Login
        </Button>
      ]}
      closable={false}
      maskClosable={false}
    >
      <p>Your session has expired. Please login again to continue.</p>
    </Modal>
  );
};

export default SessionExpiredModal;