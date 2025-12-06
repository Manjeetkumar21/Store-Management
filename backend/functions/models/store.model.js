const { defineModel, DataTypes } = require('../util/firesequelize');
const bcrypt = require('bcryptjs');

const Store = defineModel('stores', {
  id: { type: DataTypes.STRING },
  companyId: { type: DataTypes.STRING, required: true },
  name: { type: DataTypes.STRING, required: true },
  location: { type: DataTypes.STRING, required: true },
  email: { type: DataTypes.STRING, required: true },
  password: { type: DataTypes.STRING, required: true },
  image: { type: DataTypes.STRING, default: '' },
  address: { type: DataTypes.STRING, default: '' },
  phone: { type: DataTypes.STRING, default: '' },
  createdBy: { type: DataTypes.STRING, default: null },
  landingPage: {
    type: DataTypes.OBJECT,
    default: {
      hero: {
        heading: 'Streamline Your Store Operations',
        subheading: 'Manage inventory, track orders, and grow your business with our comprehensive store management platform.',
        heroImage: '/store_hero_illustration.png'
      },
      navbar: {
        logoImage: ''
      },
      footer: {
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        phone: '',
        email: ''
      }
    }
  },
  createdAt: { type: DataTypes.TIMESTAMP },
  updatedAt: { type: DataTypes.TIMESTAMP }
});

// Password hashing helper
Store.hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

module.exports = Store;
