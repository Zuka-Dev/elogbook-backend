const generateEnrollmentKey = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let enrollmentKey = "";
  for (let i = 0; i < 12; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    enrollmentKey += characters[randomIndex];
  }
  return enrollmentKey;
};

module.exports = generateEnrollmentKey;
