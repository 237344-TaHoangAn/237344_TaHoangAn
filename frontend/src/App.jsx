
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const emptyEmployee = {
  employeeId: "",
  fullName: "",
  gender: "Nam",
  dateOfBirth: "",
  department: "",
  position: "",
  email: "",
  phone: "",
  hireDate: "",
  status: "Đang làm việc",
};

function formatDate(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function App() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState(emptyEmployee);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  async function loadEmployees(keyword = search) {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (keyword.trim()) params.set("search", keyword.trim());

      const response = await fetch(
        `${API_URL}/api/employees?${params.toString()}`
      );

      if (!response.ok) throw new Error("Không thể tải danh sách nhân viên.");

      const data = await response.json();
      setEmployees(data);
    } catch {
      setError("Không kết nối được API. Hãy kiểm tra backend cổng 5000.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees("");
  }, []);

  function openCreateForm() {
    setForm(emptyEmployee);
    setEditingId(null);
    setShowForm(true);
    setNotice("");
  }

  function openEditForm(employee) {
    setForm({
      employeeId: employee.employeeId || "",
      fullName: employee.fullName || "",
      gender: employee.gender || "Nam",
      dateOfBirth: formatDate(employee.dateOfBirth),
      department: employee.department || "",
      position: employee.position || "",
      email: employee.email || "",
      phone: employee.phone || "",
      hireDate: formatDate(employee.hireDate),
      status: employee.status || "Đang làm việc",
    });
    setEditingId(employee._id);
    setShowForm(true);
    setNotice("");
  }

  function updateField(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setNotice("");
    setError("");

    try {
      const response = await fetch(
        editingId
          ? `${API_URL}/api/employees/${editingId}`
          : `${API_URL}/api/employees`,
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Không thể lưu nhân viên.");
      }

      setShowForm(false);
      setNotice(editingId ? "Cập nhật nhân viên thành công." : "Thêm nhân viên thành công.");
      await loadEmployees();
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi lưu nhân viên.");
    }
  }

  async function handleDelete(employee) {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa nhân viên ${employee.fullName} (${employee.employeeId})?`
    );
    if (!confirmed) return;

    setNotice("");
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/employees/${employee._id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Không thể xóa nhân viên.");
      }

      setNotice("Xóa nhân viên thành công.");
      await loadEmployees();
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi xóa nhân viên.");
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">HR</div>
          <div>
            <h1>Quản lý nhân sự</h1>
            <p>Hệ thống quản lý thông tin nhân viên</p>
          </div>
        </div>
        <span className="connection"><span /> Hệ thống nhân sự</span>
      </header>

      <section className="page-content">
        <div className="page-heading">
          <div>
            <p className="eyebrow">TỔNG QUAN</p>
            <h2>Danh sách nhân viên</h2>
            <p className="subtitle">Quản lý hồ sơ và thông tin nhân sự của doanh nghiệp.</p>
          </div>
          <button className="primary-button" onClick={openCreateForm}>
            + Thêm nhân viên
          </button>
        </div>

        <div className="stats-grid">
          <article className="stat-card">
            <span className="stat-icon">♙</span>
            <div><p>Tổng nhân viên</p><strong>{employees.length}</strong></div>
          </article>
          <article className="stat-card">
            <span className="stat-icon green">✓</span>
            <div><p>Đang hiển thị</p><strong>{employees.length}</strong></div>
          </article>
          <article className="stat-card">
            <span className="stat-icon purple">⌕</span>
            <div><p>Chế độ</p><strong className="mode-label">Trực tuyến</strong></div>
          </article>
        </div>

        {notice && <div className="alert success">{notice}</div>}
        {error && <div className="alert danger">{error}</div>}

        <section className="panel">
          <div className="panel-toolbar">
            <div>
              <h3>Hồ sơ nhân viên</h3>
              <p>{employees.length} hồ sơ trong kết quả hiện tại</p>
            </div>
            <form
              className="search-form"
              onSubmit={(event) => {
                event.preventDefault();
                loadEmployees(search);
              }}
            >
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm mã nhân viên, họ tên..."
                aria-label="Tìm nhân viên"
              />
              <button type="submit" className="search-button">Tìm kiếm</button>
            </form>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>NHÂN VIÊN</th>
                  <th>MÃ NHÂN VIÊN</th>
                  <th>PHÒNG BAN</th>
                  <th>CHỨC VỤ</th>
                  <th>LIÊN HỆ</th>
                  <th>TRẠNG THÁI</th>
                  <th>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="empty-state">Đang tải dữ liệu...</td></tr>
                ) : employees.length === 0 ? (
                  <tr><td colSpan="7" className="empty-state">Không tìm thấy nhân viên.</td></tr>
                ) : (
                  employees.map((employee) => (
                    <tr key={employee._id}>
                      <td>
                        <div className="employee-cell">
                          <div className="avatar">
                            {(employee.fullName || "?").trim().slice(-1).toUpperCase()}
                          </div>
                          <div>
                            <strong>{employee.fullName}</strong>
                            <small>{employee.email || "Chưa có email"}</small>
                          </div>
                        </div>
                      </td>
                      <td><span className="employee-code">{employee.employeeId}</span></td>
                      <td>{employee.department || "—"}</td>
                      <td>{employee.position || "—"}</td>
                      <td>{employee.phone || "—"}</td>
                      <td>
                        <span className={`status ${employee.status === "Đang làm việc" ? "active" : "inactive"}`}>
                          {employee.status || "Chưa xác định"}
                        </span>
                      </td>
                      <td>
                        <div className="actions">
                          <button title="Xem thông tin" onClick={() => window.alert(
                            `Mã: ${employee.employeeId}\nHọ tên: ${employee.fullName}\nGiới tính: ${employee.gender || "—"}\nNgày sinh: ${formatDate(employee.dateOfBirth) || "—"}\nPhòng ban: ${employee.department || "—"}\nChức vụ: ${employee.position || "—"}\nEmail: ${employee.email || "—"}\nĐiện thoại: ${employee.phone || "—"}\nNgày vào làm: ${formatDate(employee.hireDate) || "—"}\nTrạng thái: ${employee.status || "—"}`
                          )}>Xem</button>
                          <button title="Sửa nhân viên" onClick={() => openEditForm(employee)}>Sửa</button>
                          <button className="delete-button" title="Xóa nhân viên" onClick={() => handleDelete(employee)}>Xóa</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {showForm && (
          <div className="modal-backdrop" onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowForm(false);
          }}>
            <section className="modal" role="dialog" aria-modal="true" aria-labelledby="form-title">
              <div className="modal-heading">
                <div>
                  <p className="eyebrow">{editingId ? "CẬP NHẬT HỒ SƠ" : "HỒ SƠ MỚI"}</p>
                  <h2 id="form-title">{editingId ? "Sửa nhân viên" : "Thêm nhân viên"}</h2>
                </div>
                <button className="close-button" onClick={() => setShowForm(false)} aria-label="Đóng">×</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <label>Mã nhân viên *
                    <input name="employeeId" value={form.employeeId} onChange={updateField} required />
                  </label>
                  <label>Họ và tên *
                    <input name="fullName" value={form.fullName} onChange={updateField} required />
                  </label>
                  <label>Giới tính
                    <select name="gender" value={form.gender} onChange={updateField}>
                      <option>Nam</option><option>Nữ</option><option>Khác</option>
                    </select>
                  </label>
                  <label>Ngày sinh
                    <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={updateField} />
                  </label>
                  <label>Phòng ban
                    <input name="department" value={form.department} onChange={updateField} />
                  </label>
                  <label>Chức vụ
                    <input name="position" value={form.position} onChange={updateField} />
                  </label>
                  <label>Email
                    <input type="email" name="email" value={form.email} onChange={updateField} />
                  </label>
                  <label>Số điện thoại
                    <input name="phone" value={form.phone} onChange={updateField} />
                  </label>
                  <label>Ngày vào làm
                    <input type="date" name="hireDate" value={form.hireDate} onChange={updateField} />
                  </label>
                  <label>Trạng thái
                    <select name="status" value={form.status} onChange={updateField}>
                      <option>Đang làm việc</option>
                      <option>Nghỉ việc</option>
                      <option>Tạm nghỉ</option>
                    </select>
                  </label>
                </div>
                <div className="modal-actions">
                  <button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Hủy</button>
                  <button type="submit" className="primary-button">
                    {editingId ? "Lưu thay đổi" : "Thêm nhân viên"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </section>
      <footer className="footer">Hệ thống quản lý nhân sự · MSSV 237344 · Tạ Hoàng Ân</footer>
    </main>
  );
}

export default App;
