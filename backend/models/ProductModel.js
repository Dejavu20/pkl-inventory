import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import User from "./UserModel.js"; 


const { DataTypes } = Sequelize;

const Products = db.define('product',{
    uuid : {
        type: DataTypes.STRING,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },

    name : {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [3,100],
        }
    },
    
    merek : {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        }
    },

    serialNumber : {
        type: DataTypes.STRING, 
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true
        }
    },
    kategori : {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    image : {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    userId : {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: true,
        }
    },
    status: {
        type: DataTypes.ENUM('tersedia', 'dipinjam'),
        allowNull: false,
        defaultValue: 'tersedia'
    }
},{
    freezeTableName: true
});


User.hasMany(Products);
Products.belongsTo(User, { foreignKey: 'userId' });

export default Products;