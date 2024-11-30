import React, { useState, useEffect } from 'react';

const MySubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user'));

    if (!token || !userData) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    const fetchSubmissions = async () => {
      try {
        // Backend expects organizationId for organization role or userId for individuals
        const queryParam = userData.role === 'Organization' ? `organizationId=${userData.organizationId}` : `userId=${userData._id}`;

        const response = await fetch(`https://studevent-server.vercel.app/api/forms/submissions?${queryParam}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch submissions');
        }

        const data = await response.json();
        setSubmissions(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  if (loading) {
    return <div>Loading your submissions...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>My Submissions</h1>
      {submissions.length === 0 ? (
        <p>You have not submitted any forms yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Event Title</th>
              <th>Submission Date</th>
              <th>Status</th>
              <th>View Details</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission) => (
              <tr key={submission._id}>
                <td>{submission.eventTitle}</td>
                <td>{new Date(submission.applicationDate).toLocaleDateString()}</td>
                <td>{submission.status || 'Pending'}</td>
                <td>
                  <button onClick={() => window.location.href = `/submission/${submission._id}`}>View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MySubmissions;
