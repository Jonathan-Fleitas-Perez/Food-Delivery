import categoryModel from "../models/categoryModel.js";
import { v2 as cloudinary } from 'cloudinary';

// Listar todas las categorías (público)
const listCategories = async (req, res) => {
  try {
    const categories = await categoryModel.find({}).sort({ name: 1 });
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Agregar categoría
const addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const imageFile = req.file;

    const exists = await categoryModel.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Esta categoría ya existe' });
    }

    let imageUrl = '';
    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
      imageUrl = imageUpload.secure_url;
    }

    const category = new categoryModel({ name, image: imageUrl });
    await category.save();
    res.json({ success: true, message: 'Categoría creada', data: category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Actualizar categoría
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, active } = req.body;
    const imageFile = req.file;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (active !== undefined) updateData.active = active;

    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
      updateData.image = imageUpload.secure_url;
    }

    const category = await categoryModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
    }
    res.json({ success: true, message: 'Categoría actualizada', data: category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Eliminar categoría
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await categoryModel.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
    }
    res.json({ success: true, message: 'Categoría eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { listCategories, addCategory, updateCategory, deleteCategory };
