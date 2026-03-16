import municipalityModel from '../models/municipalityModel.js';

// Get all municipalities
const getMunicipalities = async (req, res) => {
    try {
        const municipalities = await municipalityModel.find({});
        res.json({ success: true, data: municipalities });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error al obtener municipios' });
    }
};

// Add a new municipality (admin only)
const addMunicipality = async (req, res) => {
    try {
        const { name, deliveryFee, active = true } = req.body;
        
        const exist = await municipalityModel.findOne({ name });
        if (exist) {
            return res.status(400).json({ success: false, message: 'El municipio ya existe' });
        }

        const newMunicipality = new municipalityModel({
            name,
            deliveryFee,
            active
        });

        await newMunicipality.save();
        res.json({ success: true, message: 'Municipio agreado exitosamente' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error al agregar municipio' });
    }
};

// Update municipality (admin only)
const updateMunicipality = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, deliveryFee, active } = req.body;

        const municipality = await municipalityModel.findByIdAndUpdate(
            id, 
            { name, deliveryFee, active },
            { new: true }
        );

        if (!municipality) {
            return res.status(404).json({ success: false, message: 'Municipio no encontrado' });
        }

        res.json({ success: true, message: 'Municipio actualizado exitosamente' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error al actualizar municipio' });
    }
};

// Delete municipality (admin only)
const deleteMunicipality = async (req, res) => {
    try {
        const { id } = req.params;
        const municipality = await municipalityModel.findByIdAndDelete(id);

        if (!municipality) {
            return res.status(404).json({ success: false, message: 'Municipio no encontrado' });
        }

        res.json({ success: true, message: 'Municipio eliminado exitosamente' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error al eliminar municipio' });
    }
};

export { getMunicipalities, addMunicipality, updateMunicipality, deleteMunicipality };
