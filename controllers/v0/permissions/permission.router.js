import express from 'express';
import { Permission } from './permission.model.js';

const router = express.Router();

// Create Permission
router.post('/', async (req, res) => {
  try {
    const { titre,description } = req.body;
    if(!titre){
      return res.status(400).json({message : "titre est obligatoire"})
    }
    const permission = await Permission.create({
      titre,
      description
    });
    res.status(201).json(permission);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Read all Permissions
router.get('/', async (req, res) => {
  try {
    const permissions = await Permission.findAll();
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Read Permission by ID
router.get('/:id', async (req, res) => {
  try {
    const permission = await Permission.findByPk(req.params.id);
    if (!permission) {
      res.status(404).json({ message: 'Permission not found' });
    } else {
      res.json(permission);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Permission
router.put('/:id', async (req, res) => {
  try {
    const permission = await Permission.findByPk(req.params.id);
    if (!permission) {
      res.status(404).json({ message: 'Permission not found' });
    } else {
      await permission.update(req.body);
      res.json(permission);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete Permission
router.delete('/:id', async (req, res) => {
  try {
    const permission = await Permission.findByPk(req.params.id);
    if (!permission) {
      res.status(404).json({ message: 'Permission not found' });
    } else {
      await permission.destroy();
      res.status(204).end();
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export const PermissionRouter= router;
