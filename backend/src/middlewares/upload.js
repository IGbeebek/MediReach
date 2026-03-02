const multer = require('multer');
const path = require('path');
const { BadRequestError } = require('../utils/errors');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/prescriptions'));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `rx-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError('Only JPEG, PNG, WebP and PDF files are allowed'), false);
  }
};

const uploadPrescription = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
}).single('prescription');

module.exports = { uploadPrescription };
