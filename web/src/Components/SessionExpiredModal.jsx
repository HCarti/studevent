import { useEffect, useState } from 'react';
import { Modal, Button, Alert } from 'antd';
import { jwtDecode } from 'jwt-decode';

const SessionExpiredModal = ({ onLogout }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [checkedInitial, setCheckedInitial] = useState(false);

  const checkTokenStatus = () => {
    const token = localStorage.getItem('token');
    if (!token) return { expired: true };
    
    try {
      const decoded = jwtDecode(token);
      const now = Date.now() / 1000;
      const expiresIn = decoded.exp - now;
      
      return {
        expired: expiresIn <= 0,
        expiresIn,
        willExpireIn30Seconds: expiresIn > 0 && expiresIn <= 30 // Only care about 30 seconds now
      };
    } catch (error) {
      console.error('Token decode error:', error);
      return { expired: true };
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    if (onLogout) onLogout();
    window.location.href = '/';
  };

  useEffect(() => {
    // Immediate check on component mount
    const tokenStatus = checkTokenStatus();
    setCheckedInitial(true);
    
    if (tokenStatus.expired) {
      setIsVisible(true);
      return;
    }

    // Only set up timer if we're within 30 seconds
    if (tokenStatus.willExpireIn30Seconds) {
      setSecondsLeft(Math.floor(tokenStatus.expiresIn));
      setShowWarning(true);
    }

    // Check more frequently when we're close to expiration
    const interval = setInterval(() => {
      const status = checkTokenStatus();
      
      if (status.expired) {
        setIsVisible(true);
        clearInterval(interval);
      } else if (status.willExpireIn30Seconds) {
        setSecondsLeft(Math.floor(status.expiresIn));
        setShowWarning(true);
      } else if (secondsLeft > 30) {
        setShowWarning(false);
      }
    }, 1000); // Check every second when we're close

    return () => clearInterval(interval);
  }, []);

  // Countdown effect for warning message
  useEffect(() => {
    if (!showWarning) return;

    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        const newSeconds = prev - 1;
        if (newSeconds <= 0) {
          clearInterval(timer);
          setIsVisible(true);
          return 0;
        }
        return newSeconds;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showWarning]);

  return (
    <>
      {/* Warning message - only shows at exactly 30 seconds */}
      {showWarning && secondsLeft <= 30 && (
        <Alert
          message={`Your session will expire in ${secondsLeft} seconds. Please save your work.`}
          type="warning"
          showIcon
          closable
          onClose={() => setShowWarning(false)}
          style={{
            position: 'fixed',
            top: 70,
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