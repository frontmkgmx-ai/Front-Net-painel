import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import { z } from 'zod';
import { LocalStorageProvider } from '../providers/storage/LocalStorageProvider';

const storageProvider = new LocalStorageProvider();

export const createBucket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = z.object({ name: z.string() }).parse(req.body);
    const userId = (req as any).user.id;

    const bucket = await prisma.bucket.create({
      data: { name, ownerId: userId }
    });
    
    await storageProvider.createBucket(bucket.id);

    await prisma.auditLog.create({
      data: { userId, action: 'CREATE_BUCKET', details: { bucketId: bucket.id } }
    });

    res.json(bucket);
  } catch (error) {
    next(error);
  }
};

export const listBuckets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const buckets = await prisma.bucket.findMany({
      include: { owner: { select: { username: true } } }
    });
    res.json(buckets);
  } catch (error) {
    next(error);
  }
};

export const deleteBucket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bucketId } = req.params;
    const userId = (req as any).user.id;

    await prisma.bucket.delete({ where: { id: bucketId } });
    await storageProvider.deleteBucket(bucketId);

    await prisma.auditLog.create({
      data: { userId, action: 'DELETE_BUCKET', details: { bucketId } }
    });

    res.json({ message: 'Bucket deleted' });
  } catch (error) {
    next(error);
  }
};

export const createFolder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bucketId } = req.params;
    const { name, parentId } = z.object({ name: z.string(), parentId: z.string().optional().nullable() }).parse(req.body);
    const userId = (req as any).user.id;

    const folder = await prisma.folder.create({
      data: {
        bucketId,
        name,
        parentId
      }
    });

    await prisma.auditLog.create({
      data: { userId, action: 'CREATE_FOLDER', details: { folderId: folder.id, bucketId } }
    });

    res.json(folder);
  } catch (error) {
    next(error);
  }
};

export const listContents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bucketId } = req.params;
    const { folderId } = req.query; // optional parentId

    const parentId = folderId ? String(folderId) : null;

    const folders = await prisma.folder.findMany({
      where: { bucketId, parentId }
    });

    const files = await prisma.file.findMany({
      where: { bucketId, folderId: parentId },
      include: { owner: { select: { username: true } } }
    });

    res.json({
      folders,
      files: files.map(f => ({ ...f, size: f.size.toString() }))
    });
  } catch (error) {
    next(error);
  }
};

export const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bucketId } = req.params;
    const { folderId } = req.body; // Can be empty/null
    const userId = (req as any).user.id;
    const file = (req as any).file;

    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    const bucket = await prisma.bucket.findUnique({ where: { id: bucketId } });
    if (!bucket) {
      return res.status(404).json({ message: 'Bucket not found' });
    }

    const { path: finalPath, size } = await storageProvider.uploadFile(bucketId, file);

    const dbFile = await prisma.file.create({
      data: {
        bucketId,
        folderId: folderId || null,
        name: file.originalname,
        path: finalPath,
        size: BigInt(size),
        mimeType: file.mimetype,
        ownerId: userId,
      }
    });

    await prisma.auditLog.create({
      data: { userId, action: 'UPLOAD_FILE', details: { fileId: dbFile.id } }
    });

    res.json({ ...dbFile, size: dbFile.size.toString() });
  } catch (error) {
    next(error);
  }
};

export const downloadFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileId } = req.params;
    const file = await prisma.file.findUnique({ where: { id: fileId } });
    
    if (!file) return res.status(404).json({ message: 'File not found' });

    await prisma.auditLog.create({
      data: { userId: (req as any).user.id, action: 'DOWNLOAD_FILE', details: { fileId } }
    });

    // In a production environment, we'd stream directly or use X-Accel-Redirect.
    res.download(file.path, file.name);
  } catch (error) {
    next(error);
  }
};

export const deleteFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileId } = req.params;
    const userId = (req as any).user.id;

    const file = await prisma.file.findUnique({ where: { id: fileId } });
    if (!file) return res.status(404).json({ message: 'File not found' });

    await storageProvider.deleteFile(file.bucketId, file.path);
    await prisma.file.delete({ where: { id: fileId } });

    await prisma.auditLog.create({
      data: { userId, action: 'DELETE_FILE', details: { fileId } }
    });

    res.json({ message: 'File deleted' });
  } catch (error) {
    next(error);
  }
};
