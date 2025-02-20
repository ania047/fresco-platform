import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import db from "../config/db.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const { rows } = await db.query(
      "SELECT id, firstname, lastname, email, password FROM users WHERE email = $1",
      [email]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const payload = {
      user: { id: user.id, firstname: user.firstname, lastname: user.lastname },
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      token,
      user: {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.post("/forgot", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email-ul este necesar." });
  }

  try {
    const { rows } = await db.query(
      "SELECT id, email FROM users WHERE email = $1",
      [email]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Utilizatorul nu a fost găsit." });
    }

    const user = rows[0];

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600000);

    await db.query(
      "UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3",
      [token, expiry, user.id]
    );

    const resetLink = `http://localhost:3000/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Resetare parolă",
      text: `Pentru a-ți reseta parola, accesează următorul link: ${resetLink}`,
      html: `<p>Pentru a-ți reseta parola, accesează următorul link:</p><a href="${resetLink}">${resetLink}</a>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Eroare la trimiterea email-ului:", error);
        return res
          .status(500)
          .json({ message: "A apărut o eroare la trimiterea email-ului." });
      } else {
        return res.json({
          message: "Mail de resetare trimis cu succes! Verifică inbox-ul.",
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ message: "Noua parolă este necesară." });
  }

  try {
    const { rows } = await db.query(
      "SELECT id, reset_token_expiry FROM users WHERE reset_token = $1",
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Token invalid." });
    }

    const user = rows[0];

    if (new Date(user.reset_token_expiry) < new Date()) {
      return res.status(400).json({ message: "Token expirat." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.query(
      "UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2",
      [hashedPassword, user.id]
    );

    res.json({ message: "Parola a fost resetată cu succes." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
