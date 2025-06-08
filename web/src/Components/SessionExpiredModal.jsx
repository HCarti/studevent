// components/SessionExpiredModal.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Alert } from 'antd';
import { jwtDecode } from 'jwt-decode'; // Changed to named import

const SessionExpiredModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const navigate = useNavigate();

  // Enhanced token check with expiration buffer (5 minutes)
  const checkTokenStatus = () => {
    const token = localStorage.getItem('token');
    if (!token) return { expired: true };
    
    try {
      const decoded = jwtDecode(token);
      const now = Date.now() / 1000; // Current time in seconds
      const expiresIn = decoded.exp - now;
      
      return {
        expired: expiresIn <= 0,
        expiresIn,
        willExpireSoon: expiresIn > 0 && expiresIn <= 300 // 5 minutes
      };
    } catch (error) {
      console.error('Token decode error:', error);
      return { expired: true };
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsVisible(false);
    navigate('/', { state: { sessionExpired: true } });
  };

  useEffect(() => {
    // Immediate check on component mount
    const tokenStatus = checkTokenStatus();
    if (tokenStatus.expired) {
      setIsVisible(true);
      return;
    }

    // Set up countdown timer if token will expire soon
    if (tokenStatus.willExpireSoon) {
      setSecondsLeft(Math.floor(tokenStatus.expiresIn));
      setShowWarning(true);
    }

    // Check token status every 30 seconds
    const interval = setInterval(() => {
      const status = checkTokenStatus();
      
      if (status.expired) {
        setIsVisible(true);
        clearInterval(interval);
      } else if (status.willExpireSoon) {
        setSecondsLeft(Math.floor(status.expiresIn));
        setShowWarning(true);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Countdown effect for warning message
  useEffect(() => {
    if (!showWarning || secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showWarning]);

  return (
    <>
      {/* Warning message before expiration */}
      {showWarning && (
        <Alert
          message={`Your session will expire in ${secondsLeft} seconds. Please save your work.`}
          type="warning"
          showIcon
          closable
          onClose={() => setShowWarning(false)}
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 1000,
            maxWidth: 400
          }}
        />
      )}

      {/* Session expired modal */}
      <Modal
        title="Session Expired"
        open={isVisible}
        onCancel={handleLogout}
        footer={[
          <Button 
            key="login" 
            type="primary" 
            onClick={handleLogout}
            size="large"
          >
            Re-Login
          </Button>
        ]}
        closable={false}
        maskClosable={false}
        width={500}
        centered
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <p style={{ fontSize: 16, marginBottom: 24 }}>
            Your session has expired due to inactivity.
          </p>
          <p>Please login again to continue using the application.</p>
        </div>
      </Modal>
    </>
  );
};

export default SessionExpiredModal;