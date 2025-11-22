import { Router, Request, Response } from 'express';
import { documentService } from '../services/documentService';

const router = Router();

/**
 * GET /api/documents
 * Get all available documents
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const documents = await documentService.getAllDocuments();
    res.json({
      success: true,
      data: documents,
      count: documents.length,
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch documents',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/documents/:id
 * Get a specific document's output_tree.json
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Document ID is required',
      });
    }

    const documentStructure = await documentService.getDocumentById(id);
    
    res.json({
      success: true,
      data: documentStructure,
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
        message: error.message,
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch document',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/documents/:id/images
 * Get list of all images for a specific document
 */
router.get('/:id/images', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Document ID is required',
      });
    }

    const images = await documentService.getDocumentImages(id);
    
    res.json({
      success: true,
      data: images,
      count: images.length,
    });
  } catch (error) {
    console.error('Error fetching document images:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
        message: error.message,
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch document images',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/documents/:id/images/:imageName
 * Serve a specific image file
 */
router.get('/:id/images/:imageName', async (req: Request, res: Response) => {
  try {
    const { id, imageName } = req.params;
    
    if (!id || !imageName) {
      return res.status(400).json({
        success: false,
        error: 'Document ID and image name are required',
      });
    }

    // Security: prevent path traversal attacks
    if (imageName.includes('..') || imageName.includes('/') || imageName.includes('\\')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid image name',
      });
    }

    const imagePath = documentService.getImagePath(id, imageName);
    
    // Send the file
    res.sendFile(imagePath, (err) => {
      if (err) {
        console.error('Error sending image:', err);
        if (!res.headersSent) {
          res.status(404).json({
            success: false,
            error: 'Image not found',
          });
        }
      }
    });
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to serve image',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
