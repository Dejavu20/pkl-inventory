import User from "../models/UserModel.js";
import argon2 from "argon2";

export const Login = async(req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validasi input
        if (!email || !password) {
            return res.status(400).json({msg: "Email dan Password harus diisi"});
        }
        
        // Cari user berdasarkan email
        const user = await User.findOne({
            where: {
                email: email.trim()
            }
        });
        
        if (!user) {
            return res.status(404).json({msg: "Email atau Password salah"});
        }
        
        // Verifikasi password
        const match = await argon2.verify(user.password, password);
        
        if (!match) {
            return res.status(400).json({msg: "Email atau Password salah"});
        }
        
        // Set session
        req.session.userId = user.uuid;
        
        // Return user data
        res.status(200).json({
            uuid: user.uuid,
            name: user.name,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({msg: error.message || "Gagal melakukan login"});
    }
}

export const Me = async(req, res) => {
    if(!req.session.userId){
        return res.status(401).json({msg: "Mohon login ke akun Anda"});
    }
    const user = await User.findOne({
        attributes: ['id', 'uuid', 'name', 'email', 'role'],
        where: {
            uuid: req.session.userId
        }
    });
    if (!user) return res.status(404).json({msg: "User tidak ditemukan"});
    res.status(200).json(user);
}

export const logOut = (req, res) => {
    req.session.destroy((err) => {
        if(err) return res.status(400).json({msg: "Tidak dapat logout"});
        res.status(200).json({msg: "Berhasil logout"});
    })};