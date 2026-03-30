import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PedidoPDFData {
  id?: string;
  lojaNome: string;
  entidadeNome: string;
  data: Date | string;
  observacoes?: string;
  emailSolicitante?: string;
  nomeSolicitante?: string;
  nomeColaborador?: string;
  funcaoColaborador?: string;
  matriculaFuncionario?: string;
  motivoSolicitacao?: string;
  itens: {
    produtoNome: string;
    produtoCodigo: string;
    quantidade: number;
  }[];
}

export function exportarPedidoPDF(pedido: PedidoPDFData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Comprovante de Pedido', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text('Documento gerado automaticamente', pageWidth / 2, 27, { align: 'center' });

  // Linha separadora
  doc.setDrawColor(200);
  doc.line(14, 30, pageWidth - 14, 30);

  // Info do pedido
  let y = 38;
  doc.setTextColor(0);
  doc.setFontSize(11);

  const addField = (label: string, value: string) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}: `, 14, y);
    const labelWidth = doc.getTextWidth(`${label}: `);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 14 + labelWidth, y);
    y += 7;
  };

  if (pedido.id) {
    addField('ID', `#${pedido.id.substring(0, 8).toUpperCase()}`);
  }

  const dataFormatada = format(
    typeof pedido.data === 'string' ? new Date(pedido.data) : pedido.data,
    "dd/MM/yyyy 'às' HH:mm",
    { locale: ptBR }
  );
  addField('Data', dataFormatada);
  addField('Loja', pedido.lojaNome);
  addField('Tipo de Pedido', pedido.entidadeNome);

  if (pedido.emailSolicitante) {
    addField('Email', pedido.emailSolicitante);
  }

  // Campos de rastreabilidade
  if (pedido.nomeSolicitante) addField('Solicitante', pedido.nomeSolicitante);
  if (pedido.nomeColaborador) addField('Colaborador', pedido.nomeColaborador);
  if (pedido.funcaoColaborador) addField('Função', pedido.funcaoColaborador);
  if (pedido.matriculaFuncionario) addField('Matrícula', pedido.matriculaFuncionario);
  if (pedido.motivoSolicitacao) addField('Motivo', pedido.motivoSolicitacao);

  y += 3;

  // Tabela de itens
  const tableData = pedido.itens.map((item, i) => [
    String(i + 1),
    item.produtoCodigo,
    item.produtoNome,
    String(item.quantidade),
  ]);

  autoTable(doc, {
    startY: y,
    head: [['#', 'Código', 'Produto', 'Qtd']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 30 },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 20, halign: 'center' },
    },
    margin: { left: 14, right: 14 },
  });

  // Total de itens
  const finalY = (doc as any).lastAutoTable.finalY + 8;
  const totalQtd = pedido.itens.reduce((sum, item) => sum + item.quantidade, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total de itens: ${totalQtd}`, 14, finalY);

  // Observações
  if (pedido.observacoes) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Observações:', 14, finalY + 10);
    doc.setFont('helvetica', 'normal');
    const obsLines = doc.splitTextToSize(pedido.observacoes, pageWidth - 28);
    doc.text(obsLines, 14, finalY + 17);
  }

  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(
    `Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );

  // Download
  const nomeArquivo = pedido.id
    ? `pedido_${pedido.id.substring(0, 8)}.pdf`
    : `pedido_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`;
  doc.save(nomeArquivo);
}
