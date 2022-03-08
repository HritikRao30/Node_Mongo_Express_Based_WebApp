const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary'); //storage on cloud object

cloudinary.config({ 
    cloud_name: 'college-of-engineering-pune', 
    api_key: '726234945147733', 
    api_secret: 'pQ4igcwM6EO-4ni_c2RoXUMJEA8' 
});

const storage = new CloudinaryStorage({
    cloudinary:cloudinary,
    params: {
        folder: 'YelpCamp',
        allowedFormats: ['jpeg', 'png', 'jpg']
    }
});

module.exports = {
    cloudinary,
    storage
}