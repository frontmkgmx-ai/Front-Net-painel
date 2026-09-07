import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/auth';
import multer from 'multer';
import { 
  createBucket, 
  listBuckets,
  deleteBucket,
  createFolder,
  listContents,
  uploadFile, 
  downloadFile,
  deleteFile
} from '../controllers/storageController';

const upload = multer({ dest: process.env.STORAGE_PATH || '/opt/mycloud/storage/tmp' });

const router = Router();

router.use(authenticate);

router.post('/buckets', requireRole(['SUPER_ADMIN', 'ADMIN']), createBucket);
router.get('/buckets', listBuckets);
router.delete('/buckets/:bucketId', requireRole(['SUPER_ADMIN', 'ADMIN']), deleteBucket);

router.post('/buckets/:bucketId/folders', createFolder);
router.get('/buckets/:bucketId/contents', listContents);

router.post('/buckets/:bucketId/files', upload.single('file'), uploadFile);
router.get('/files/:fileId/download', downloadFile);
router.delete('/files/:fileId', deleteFile);

export default router;
