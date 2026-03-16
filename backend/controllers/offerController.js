import { v2 as cloudinary } from "cloudinary";
import offerModel from "../models/offerModel.js";

// Añadir oferta
const addOffer = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.json({ success: false, message: "Debe subir una imagen" });
        }

        // Verificar el límite de 2 ofertas
        const count = await offerModel.countDocuments();
        if (count >= 2) {
            return res.json({ success: false, message: "Solo se permiten un máximo de 2 ofertas simultáneas. Elimine una para agregar otra." });
        }

        // Subir a Cloudinary
        const imageResult = await cloudinary.uploader.upload(file.path, {
            folder: 'ofertas'
        });

        const newOffer = new offerModel({
            image: imageResult.secure_url,
            active: true
        });

        await newOffer.save();
        res.json({ success: true, message: "Oferta añadida correctamente", offer: newOffer });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Listar ofertas para el frontend (solo activas)
const getOffers = async (req, res) => {
    try {
        const offers = await offerModel.find({ active: true });
        res.json({ success: true, offers });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Listar todas las ofertas para admin
const listAllOffers = async (req, res) => {
    try {
        const offers = await offerModel.find({});
        res.json({ success: true, offers });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Eliminar oferta
const removeOffer = async (req, res) => {
    try {
        const { id } = req.params;
        const offer = await offerModel.findById(id);
        
        if (!offer) {
            return res.json({ success: false, message: "Oferta no encontrada" });
        }

        // Eliminar de Cloudinary
        const publicId = offer.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`ofertas/${publicId}`);

        await offerModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Oferta eliminada" });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Alternar estado de oferta
const toggleOfferStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { active } = req.body;

        const offer = await offerModel.findByIdAndUpdate(id, { active }, { new: true });
        if (!offer) {
            return res.json({ success: false, message: "Oferta no encontrada" });
        }

        res.json({ success: true, message: "Estado de oferta actualizado", offer });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

export default {
    addOffer,
    getOffers,
    listAllOffers,
    removeOffer,
    toggleOfferStatus
};
