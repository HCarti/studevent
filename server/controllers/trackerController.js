io.on('connection', (socket) => {
  console.log('New client connected');

  // In updateTracker event
  socket.on('updateTracker', async ({ eventId, stepIndex, status, remarks, userId }) => {
    try {
      const user = await user.findById(userId);
      const tracker = await tracker.findOne({ eventId });
  
      if (!tracker) {
        return socket.emit('error', { message: 'Tracker not found' });
      }
  
      const step = tracker.steps[stepIndex];
      if (!step || step.faculty !== user.faculty) {
        return socket.emit('error', { message: 'Unauthorized access to this step' });
      }
  
      // Update step if the user has access to it
      step.status = status;
      step.color = status === 'approved' ? 'green' : 'red';
      step.remarks = remarks;
      step.timestamp = Date.now();
  
      await tracker.save();
      socket.emit('trackerUpdated', tracker);
    } catch (error) {
      socket.emit('error', { message: 'Server error' });
    }
  });
  

});
