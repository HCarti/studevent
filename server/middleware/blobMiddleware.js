const multer = require('multer');
const { PutBlobResult } = require('@vercel/blob');

// Memory storage (file never hits disk)
const memoryStorage = multer.memoryStorage();

module.exports.blobUploadMiddleware = multer({ 
  storage: memoryStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel/CSV files are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});