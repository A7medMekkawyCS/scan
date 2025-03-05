require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('API is working!');
});

mongoose.connect("mongodb://127.0.0.1:27017/myDatabase", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log(" MongoDB Connected")).catch(err => console.log(" MongoDB Error:", err));


const UserSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  password: String,
  mobileNumber: String,
  dateOfBirth: String,
});

const User = mongoose.model("User", UserSchema);


app.post("/api/register", async (req, res) => {
  try {
    const { fullName, email, password, mobileNumber, dateOfBirth } = req.body;

    if (!fullName || !email || !password || !mobileNumber || !dateOfBirth) {
      return res.status(400).json({ message: " جميع الحقول مطلوبة" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "البريد الإلكتروني مسجل مسبقًا" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ fullName, email, password: hashedPassword, mobileNumber, dateOfBirth });
    await newUser.save();

    res.status(201).json({ message: " تم التسجيل بنجاح" });
  } catch (error) {
    res.status(500).json({ message: " حدث خطأ أثناء التسجيل", error });
  }
});


app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: " البريد الإلكتروني أو كلمة المرور غير صحيحة" });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, "secret", { expiresIn: "1h" });
    res.json({ message: " تسجيل الدخول ناجح", token });
  } catch (error) {
    res.status(500).json({ message: " حدث خطأ أثناء تسجيل الدخول", error });
  }
});


const PORT = process.env.PORT || 8002;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
