import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import jsPDF from "jspdf";

export default function RelatorioPDFButton({ lavoura, despesas, atividades, insumos, produtos }) {
  const [loading, setLoading] = useState(false);

  function gerarPDF() {
    setLoading(true);
    try {
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageW = 210;
      const margin = 16;
      let y = 20;

      const addLine = (text, x, fontSize = 10, bold = false, color = [30, 30, 30]) => {
        doc.setFontSize(fontSize);
        doc.setFont("helvetica", bold ? "bold" : "normal");
        doc.setTextColor(...color);
        doc.text(text, x, y);
      };

      const newLine = (space = 7) => { y += space; };

      const checkPage = (needed = 15) => {
        if (y + needed > 280) {
          doc.addPage();
          y = 20;
        }
      };

      // Header verde
      doc.setFillColor(34, 139, 87);
      doc.rect(0, 0, 210, 30, "F");
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("MySafra", margin, 13);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text("Relatório de Lavoura", margin, 22);
      doc.setFontSize(9);
      doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, pageW - margin - 50, 22);

      y = 40;

      // Dados da lavoura
      doc.setFillColor(240, 250, 244);
      doc.rect(margin - 2, y - 5, pageW - 2 * margin + 4, 38, "F");

      addLine("Informações da Lavoura", margin, 13, true, [30, 100, 60]);
      newLine(8);
      addLine(`Nome: ${lavoura.nome}`, margin, 10, false, [30, 30, 30]);
      newLine(6);
      addLine(`Cultura: ${lavoura.cultura}`, margin, 10);
      doc.text(`Safra: ${lavoura.safra}`, 110, y);
      newLine(6);
      const tarefas = lavoura.area_hectares || 0;
      const hectares = (tarefas / 2.3).toFixed(2);
      addLine(`Área: ${tarefas} tarefas / ${hectares} ha`, margin, 10);
      doc.text(`Status: ${lavoura.status || "—"}`, 110, y);
      newLine(6);
      if (lavoura.localizacao) {
        addLine(`Localização: ${lavoura.localizacao}`, margin, 10);
        newLine(6);
      }

      y += 8;

      // Despesas
      checkPage(20);
      addLine("Despesas Registradas", margin, 13, true, [30, 100, 60]);
      newLine(8);

      const totalDespesas = despesas.reduce((s, d) => s + (d.valor || 0), 0);
      addLine(`Total: R$ ${totalDespesas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} (${despesas.length} lançamentos)`, margin, 10, true);
      newLine(7);

      if (despesas.length === 0) {
        addLine("Nenhuma despesa registrada.", margin + 4, 9, false, [120, 120, 120]);
        newLine(7);
      } else {
        // Cabeçalho tabela
        doc.setFillColor(220, 240, 228);
        doc.rect(margin - 2, y - 4, pageW - 2 * margin + 4, 8, "F");
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(40, 100, 60);
        doc.text("Descrição", margin, y);
        doc.text("Categoria", 100, y);
        doc.text("Data", 145, y);
        doc.text("Valor (R$)", 170, y);
        newLine(8);

        despesas.forEach(d => {
          checkPage(8);
          doc.setFontSize(8.5);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(40, 40, 40);
          const desc = d.descricao?.length > 35 ? d.descricao.substring(0, 35) + "..." : (d.descricao || "—");
          doc.text(desc, margin, y);
          doc.text(d.categoria || "—", 100, y);
          doc.text(d.data ? new Date(d.data).toLocaleDateString("pt-BR") : "—", 145, y);
          doc.text(`R$ ${(d.valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, 170, y);
          newLine(6.5);

          doc.setDrawColor(230, 240, 230);
          doc.line(margin, y - 2, pageW - margin, y - 2);
        });
      }

      y += 5;

      // Atividades
      checkPage(20);
      addLine("Atividades", margin, 13, true, [30, 100, 60]);
      newLine(8);

      const concluidas = atividades.filter(a => a.status === "Concluída").length;
      addLine(`${concluidas} de ${atividades.length} concluídas`, margin, 10, true);
      newLine(7);

      if (atividades.length === 0) {
        addLine("Nenhuma atividade registrada.", margin + 4, 9, false, [120, 120, 120]);
        newLine(7);
      } else {
        doc.setFillColor(220, 240, 228);
        doc.rect(margin - 2, y - 4, pageW - 2 * margin + 4, 8, "F");
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(40, 100, 60);
        doc.text("Atividade", margin, y);
        doc.text("Tipo", 85, y);
        doc.text("Previsto", 130, y);
        doc.text("Status", 165, y);
        newLine(8);

        atividades.forEach(a => {
          checkPage(8);
          doc.setFontSize(8.5);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(40, 40, 40);
          const titulo = a.titulo?.length > 30 ? a.titulo.substring(0, 30) + "..." : (a.titulo || "—");
          doc.text(titulo, margin, y);
          doc.text(a.tipo || "—", 85, y);
          doc.text(a.data_prevista ? new Date(a.data_prevista).toLocaleDateString("pt-BR") : "—", 130, y);
          doc.text(a.status || "—", 165, y);
          newLine(6.5);

          doc.setDrawColor(230, 240, 230);
          doc.line(margin, y - 2, pageW - margin, y - 2);
        });
      }

      // Resumo final
      checkPage(30);
      y += 8;
      doc.setFillColor(34, 139, 87);
      doc.rect(margin - 2, y - 5, pageW - 2 * margin + 4, 20, "F");
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("Resumo Financeiro", margin, y + 2);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const custoHa = hectares > 0 ? totalDespesas / parseFloat(hectares) : 0;
      doc.text(`Total Despesas: R$ ${totalDespesas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, margin, y + 10);
      doc.text(`Custo/ha: R$ ${custoHa.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, 120, y + 10);

      // Footer
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.setFont("helvetica", "normal");
        doc.text(`MySafra — Página ${i} de ${totalPages}`, pageW / 2, 290, { align: "center" });
      }

      doc.save(`relatorio-${lavoura.nome.replace(/\s+/g, "-").toLowerCase()}-${lavoura.safra || "safra"}.pdf`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={gerarPDF} disabled={loading} className="gap-2">
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
      Exportar PDF
    </Button>
  );
}