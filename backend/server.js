const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, "Ma nhan vien la bat buoc"],
      unique: true,
      trim: true
    },
    fullName: {
      type: String,
      required: [true, "Ho ten la bat buoc"],
      trim: true
    },
    gender: String,
    dateOfBirth: Date,
    department: String,
    position: String,
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: String,
    hireDate: Date,
    status: {
      type: String,
      default: "Đang làm việc"
    }
  },
  { timestamps: true }
);

const Employee = mongoose.model("Employee", employeeSchema);

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "HR API is running" });
});

app.get("/api/employees", async (req, res) => {
  try {
    const search = req.query.search?.trim();
    const filter = search
      ? {
          $or: [
            { employeeId: { $regex: search, $options: "i" } },
            { fullName: { $regex: search, $options: "i" } }
          ]
        }
      : {};

    const employees = await Employee.find(filter).sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: "Loi lay danh sach nhan vien" });
  }
});

app.get("/api/employees/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "ID khong hop le" });
    }

    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: "Khong tim thay nhan vien" });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: "Loi lay thong tin nhan vien" });
  }
});

app.post("/api/employees", async (req, res) => {
  try {
    const employee = await Employee.create(req.body);
    res.status(201).json(employee);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Ma nhan vien da ton tai" });
    }

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Loi them nhan vien" });
  }
});

app.put("/api/employees/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "ID khong hop le" });
    }

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({ message: "Khong tim thay nhan vien" });
    }

    res.json(employee);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Ma nhan vien da ton tai" });
    }

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Loi cap nhat nhan vien" });
  }
});

app.delete("/api/employees/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "ID khong hop le" });
    }

    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: "Khong tim thay nhan vien" });
    }

    res.json({ message: "Xoa nhan vien thanh cong" });
  } catch (error) {
    res.status(500).json({ message: "Loi xoa nhan vien" });
  }
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("Chua cau hinh MONGODB_URI trong file .env");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Da ket noi MongoDB Atlas");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server dang chay tai cong ${PORT}`);
    });
  } catch (error) {
    console.error("Khong the khoi dong server:", error.message);
    process.exit(1);
  }
}

startServer();
