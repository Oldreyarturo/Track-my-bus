import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import Navbar from "../../components/Navbar";

export default function Boletos() {
  const { usuario } = useAuth();
  const [boletos, setBoletos] = useState([]);
  const [rutas, setRutas] = useState([]);
  const [modal, setModal] = useState(false);
  const [qrModal, setQrModal] = useState(null);
  const [form, setForm] = useState({
    ruta_id: "",
    valido_desde: "",
    valido_hasta: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const cargar = async () => {
    try {
      const [b, r] = await Promise.all([
        api.get("/boletos/mis-boletos"),
        api.get("/rutas"),
      ]);
      setBoletos(b.data);
      setRutas(r.data);
    } catch (err) {
      console.error("Error al cargar boletos o rutas:", err);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const getRutaPrecio = () => {
    const ruta = rutas.find((r) => r.id === parseInt(form.ruta_id));
    return ruta?.precio || 0;
  };

  const comprar = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/boletos/comprar", {
        ...form,
        precio: getRutaPrecio(),
      });
      setModal(false);
      setForm({ ruta_id: "", valido_desde: "", valido_hasta: "" });
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || "Error al comprar boleto");
    } finally {
      setLoading(false);
    }
  };

  const ESTADO_COLOR = {
    pagado: "bg-green-100 text-green-700",
    usado: "bg-gray-100 text-gray-500",
    expirado: "bg-red-100 text-red-600",
    cancelado: "bg-red-100 text-red-600",
  };

  const puedeComprar = usuario?.es_estudiante && usuario?.credencial_valida;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-700">Mis boletos</h1>
          {puedeComprar && (
            <button
              onClick={() => setModal(true)}
              className="bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-800 transition"
            >
              + Comprar boleto
            </button>
          )}
        </div>

        {!puedeComprar && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-sm text-yellow-800">
            {!usuario?.es_estudiante
              ? "Solo estudiantes pueden comprar boletos con descuento."
              : "Tu credencial estudiantil esta pendiente de validacion por un administrador."}
          </div>
        )}

        {boletos.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-400">
            No tienes boletos aun
          </div>
        ) : (
          <div className="space-y-3">
            {boletos.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl shadow p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-gray-800">{b.ruta}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Valido: {new Date(b.valido_desde).toLocaleDateString()} —{" "}
                    {new Date(b.valido_hasta).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-400">Precio: ${b.precio}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_COLOR[b.estado]}`}
                  >
                    {b.estado}
                  </span>
                  {b.estado === "pagado" && (
                    <button
                      onClick={() => setQrModal(b)}
                      className="text-blue-700 text-xs font-semibold hover:underline"
                    >
                      Ver QR
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold">Comprar boleto estudiantil</h2>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <form onSubmit={comprar} className="space-y-3">
              <select
                required
                value={form.ruta_id}
                onChange={(e) => setForm({ ...form, ruta_id: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar ruta *</option>
                {rutas.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nombre} — ${r.precio}
                  </option>
                ))}
              </select>

              {form.ruta_id && (
                <div className="bg-blue-50 rounded-lg px-3 py-2 text-sm text-blue-700 font-medium">
                  Precio: ${getRutaPrecio()}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Valido desde
                </label>
                <input
                  type="datetime-local"
                  required
                  value={form.valido_desde}
                  onChange={(e) =>
                    setForm({ ...form, valido_desde: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Valido hasta
                </label>
                <input
                  type="datetime-local"
                  required
                  value={form.valido_hasta}
                  onChange={(e) =>
                    setForm({ ...form, valido_hasta: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModal(false)}
                  className="flex-1 border border-gray-300 rounded-xl py-2 text-sm hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-700 text-white rounded-xl py-2 text-sm font-semibold hover:bg-blue-800 disabled:opacity-50"
                >
                  {loading ? "Comprando..." : "Comprar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {qrModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4 text-center">
            <h2 className="text-lg font-bold">Boleto QR</h2>
            <p className="text-sm text-gray-500">{qrModal.ruta}</p>
            <div className="flex justify-center">
              <QRCodeSVG value={qrModal.qr_token} size={220} />
            </div>
            <p className="text-xs text-gray-400">
              Valido hasta: {new Date(qrModal.valido_hasta).toLocaleString()}
            </p>
            <button
              onClick={() => setQrModal(null)}
              className="w-full border border-gray-300 rounded-xl py-2 text-sm hover:bg-gray-50"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
