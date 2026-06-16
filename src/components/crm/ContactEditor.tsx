import { useState } from "react";
import { X, Loader2, Save } from "lucide-react";
import { Contact, LeadStage } from "@/types/crm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

const STAGES: { value: LeadStage; label: string }[] = [
  { value: "novo", label: "Novo" },
  { value: "qualificado", label: "Qualificado" },
  { value: "proposta", label: "Proposta enviada" },
  { value: "fechado", label: "Fechado" },
  { value: "perdido", label: "Perdido" },
];

const SOURCES = ["whatsapp", "site", "indicação", "instagram", "google", "outro"];

interface Props {
  contact: Contact;
  onClose: () => void;
  onSaved?: (c: Partial<Contact>) => void;
}

export function ContactEditor({ contact, onClose, onSaved }: Props) {
  const [form, setForm] = useState<Partial<Contact>>(contact);
  const [saving, setSaving] = useState(false);

  const set = (k: keyof Contact, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleCepBlur = async () => {
    const cep = (form.cep || "").replace(/\D/g, "");
    if (cep.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      if (!res.ok) return;
      const data = await res.json();
      if (!data || data.erro) return;
      setForm((f) => ({
        ...f,
        street: f.street || data.logradouro || "",
        district: f.district || data.bairro || "",
        city: f.city || data.localidade || "",
        state: f.state || data.uf || "",
      }));
    } catch (err) {
      console.warn("ViaCEP lookup failed:", err);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload: any = {
        name: form.name?.trim() || null,
        email: form.email?.trim() || null,
        cpf: form.cpf?.trim() || null,
        birthdate: form.birthdate || null,
        cep: form.cep?.trim() || null,
        street: form.street?.trim() || null,
        street_number: form.street_number?.trim() || null,
        complement: form.complement?.trim() || null,
        district: form.district?.trim() || null,
        city: form.city?.trim() || null,
        state: form.state?.trim() || null,
        source: form.source || null,
        stage: form.stage || "novo",
        vehicle_brand: form.vehicle_brand?.trim() || null,
        vehicle_model: form.vehicle_model?.trim() || null,
        vehicle_year: form.vehicle_year ? Number(form.vehicle_year) : null,
        notes: form.notes?.trim() || null,
      };
      const { error } = await supabase.from("contacts").update(payload).eq("id", contact.id);
      if (error) throw error;
      toast.success("Contato atualizado!");
      onSaved?.(payload);
      onClose();
    } catch (e: any) {
      toast.error("Erro ao salvar: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0F1117] border border-[#1F232E] custom-scrollbar"
      >
        <div className="p-5 border-b border-[#1F232E] flex items-center justify-between sticky top-0 bg-[#0F1117] z-10">
          <h3 className="text-lg font-bold text-white">Editar contato</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <Section title="Identificação">
            <Field label="Nome">
              <input
                className={inputCls}
                value={form.name || ""}
                onChange={(e) => set("name", e.target.value)}
              />
            </Field>
            <Field label="Telefone (WhatsApp)">
              <input className={inputCls} value={form.phone || ""} disabled />
            </Field>
            <Field label="E-mail">
              <input
                type="email"
                className={inputCls}
                value={form.email || ""}
                onChange={(e) => set("email", e.target.value)}
              />
            </Field>
            <Field label="CPF">
              <input
                className={inputCls}
                value={form.cpf || ""}
                onChange={(e) => set("cpf", e.target.value)}
              />
            </Field>
            <Field label="Data de nascimento">
              <input
                type="date"
                className={inputCls}
                value={form.birthdate || ""}
                onChange={(e) => set("birthdate", e.target.value)}
              />
            </Field>
            <Field label="Origem">
              <select
                className={inputCls}
                value={form.source || ""}
                onChange={(e) => set("source", e.target.value)}
              >
                <option value="">—</option>
                {SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Estágio do funil">
              <select
                className={inputCls}
                value={form.stage || "novo"}
                onChange={(e) => set("stage", e.target.value as LeadStage)}
              >
                {STAGES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
          </Section>

          <Section title="Endereço">
            <Field label="CEP">
              <input
                className={inputCls}
                value={form.cep || ""}
                onChange={(e) => set("cep", e.target.value)}
                onBlur={handleCepBlur}
                placeholder="00000-000"
              />
            </Field>
            <Field label="Rua" colSpan={2}>
              <input
                className={inputCls}
                value={form.street || ""}
                onChange={(e) => set("street", e.target.value)}
              />
            </Field>
            <Field label="Número">
              <input
                className={inputCls}
                value={form.street_number || ""}
                onChange={(e) => set("street_number", e.target.value)}
              />
            </Field>
            <Field label="Complemento">
              <input
                className={inputCls}
                value={form.complement || ""}
                onChange={(e) => set("complement", e.target.value)}
              />
            </Field>
            <Field label="Bairro">
              <input
                className={inputCls}
                value={form.district || ""}
                onChange={(e) => set("district", e.target.value)}
              />
            </Field>
            <Field label="Cidade">
              <input
                className={inputCls}
                value={form.city || ""}
                onChange={(e) => set("city", e.target.value)}
              />
            </Field>
            <Field label="UF">
              <input
                maxLength={2}
                className={inputCls}
                value={form.state || ""}
                onChange={(e) => set("state", e.target.value.toUpperCase())}
              />
            </Field>
          </Section>

          <Section title="Veículo">
            <Field label="Marca">
              <input
                className={inputCls}
                value={form.vehicle_brand || ""}
                onChange={(e) => set("vehicle_brand", e.target.value)}
              />
            </Field>
            <Field label="Modelo">
              <input
                className={inputCls}
                value={form.vehicle_model || ""}
                onChange={(e) => set("vehicle_model", e.target.value)}
              />
            </Field>
            <Field label="Ano">
              <input
                type="number"
                className={inputCls}
                value={form.vehicle_year || ""}
                onChange={(e) =>
                  set("vehicle_year", e.target.value ? Number(e.target.value) : null)
                }
              />
            </Field>
          </Section>

          <Section title="Observações">
            <Field label="Notas internas" colSpan={3}>
              <textarea
                rows={3}
                className={inputCls}
                value={form.notes || ""}
                onChange={(e) => set("notes", e.target.value)}
              />
            </Field>
          </Section>
        </div>

        <div className="p-4 border-t border-[#1F232E] flex justify-end gap-3 sticky bottom-0 bg-[#0F1117]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-white"
          >
            Cancelar
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-black font-semibold text-sm hover:bg-cyan-400 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

const inputCls =
  "w-full bg-[#151821] border border-[#1F232E] rounded-lg px-3 py-2 text-sm text-zinc-200 focus:border-cyan-500/50 outline-none disabled:opacity-50";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h4 className="text-[10px] font-bold uppercase tracking-widest text-cyan-400/80">{title}</h4>
      <div className="grid grid-cols-3 gap-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
  colSpan = 1,
}: {
  label: string;
  children: React.ReactNode;
  colSpan?: number;
}) {
  return (
    <div className="space-y-1" style={{ gridColumn: `span ${colSpan} / span ${colSpan}` }}>
      <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}
