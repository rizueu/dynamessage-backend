module.exports = (req, type) => {
  if (!req.files) {
    return {
      status: 400,
      success: false,
      message: 'You have to upload a picture!',
    };
  }

  const picture = req.files.picture;

  const extValid = /jpg|jpeg|png/gi;
  const checkExt = extValid.test(picture.name.split('.').pop());
  const checkMime = extValid.test(picture.mimetype);

  if (!checkExt && !checkMime) {
    return {
      status: 400,
      success: false,
      message: 'You only can upload an images!',
    };
  }

  if (picture.size > 3000000) {
    return {
      status: 400,
      success: false,
      message: 'Picture size max 3MB!',
    };
  }

  let photo = picture.name.split('.')[0];
  photo += '-';
  photo += Date.now();
  photo += '.';
  photo += picture.name.split('.').pop().toLowerCase();

  picture.mv(`./public/${type}/${photo}`);
  return photo;
};
