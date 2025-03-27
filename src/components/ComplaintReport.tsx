import React, { useState, useMemo } from 'react';
import { Complaint } from '../types';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FileText, Download, Search, X } from 'lucide-react';

interface ComplaintReportProps {
  complaints: Complaint[];
}

export function ComplaintReport({ complaints }: ComplaintReportProps) {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    characteristic: '',
    status: '',
    date: ''
  });

  const categories = useMemo(() => 
    Array.from(new Set(complaints.map(c => c.category))).sort(),
    [complaints]
  );

  const characteristics = useMemo(() => 
    Array.from(new Set(complaints.map(c => c.characteristic))).sort(),
    [complaints]
  );

  const filteredComplaints = useMemo(() => {
    return complaints.filter(complaint => {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = !filters.search || 
        complaint.complaintNumber.toLowerCase().includes(searchLower) ||
        complaint.category.toLowerCase().includes(searchLower) ||
        complaint.characteristic.toLowerCase().includes(searchLower) ||
        complaint.responsibleInstance.toLowerCase().includes(searchLower) ||
        complaint.responsible1.toLowerCase().includes(searchLower) ||
        complaint.responsible2.toLowerCase().includes(searchLower);

      const matchesCategory = !filters.category || complaint.category === filters.category;
      const matchesCharacteristic = !filters.characteristic || complaint.characteristic === filters.characteristic;
      const matchesStatus = !filters.status || complaint.status === filters.status;
      
      const complaintDate = new Date(complaint.receivedDate);
      const matchesDate = !filters.date || complaintDate >= new Date(filters.date);

      return matchesSearch && matchesCategory && matchesCharacteristic && 
             matchesStatus && matchesDate;
    });
  }, [complaints, filters]);

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      characteristic: '',
      status: '',
      date: ''
    });
  };

  const calculateSLA = (complaint: Complaint) => {
    const startDate = new Date(complaint.receivedDate);
    const endDate = complaint.conclusion?.dataEncerramento 
      ? new Date(complaint.conclusion.dataEncerramento)
      : new Date();
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'nova': return 'Nova Denúncia';
      case 'investigacao': return 'Em Investigação';
      case 'concluida': return 'Concluída';
      case 'arquivada': return 'Arquivada';
      default: return status;
    }
  };

  const generatePDF = (complaint: Complaint) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const textWidth = pageWidth - (2 * margin);
    let yPos = 100;

    // Helper functions
    const addHeaderFooter = () => {
      doc.setFillColor(220, 0, 0);
      doc.rect(0, 0, pageWidth, 25, 'F');
      doc.rect(0, pageHeight - 25, pageWidth, 25, 'F');
      
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('CONFIDENCIAL', pageWidth/2, 15, { align: 'center' });
      doc.text('CONFIDENCIAL', pageWidth/2, pageHeight - 10, { align: 'center' });
    };

    const addSection = (title: string) => {
      doc.addPage();
      yPos = 40;
      doc.setFillColor(220, 0, 0);
      doc.rect(margin, yPos - 10, textWidth, 1, 'F');
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(title, margin, yPos);
      yPos += 20;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
    };

    // Cover page
    doc.setFillColor(245, 245, 245);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Title
    doc.setFontSize(24);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('TELETEX', pageWidth/2, 40, { align: 'center' });
    
    doc.setFontSize(18);
    doc.text('Relatório de Denúncia', pageWidth/2, 60, { align: 'center' });
    doc.text(complaint.complaintNumber, pageWidth/2, 75, { align: 'center' });

    // Confidential notice
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);

    const paragraphs = [
      'O presente relatório é confidencial, endereçado única e exclusivamente ao Comitê de Compliance da Teletex.',
      'Portanto, o conteúdo do presente relatório, incluindo qualquer anexo, é dirigido apenas ao Comitê, pois contém informações privadas, privilegiadas, sigilosas e confidenciais, que podem servir como evidências, sob as leis aplicáveis ou em processos judiciais.',
      'Caso você não seja o destinatário pretendido, você está notificado de que qualquer uso, disseminação, distribuição ou cópia deste relatório é estritamente proibido.',
      'Se você recebeu este relatório por engano, notifique o Comitê de Compliance da Teletex imediatamente através dos canais de reporte existentes (https://teletex.ouvidoriacompliance.com.br/) e destrua se estiver impresso ou exclua imediatamente, se disponível em meio eletrônico.',
      'Apenas o Comitê de Compliance, mediante deliberação interna de seus membros, é quem pode autorizar o encaminhamento ou a entrega das informações aqui constantes para quem entender de direito, total ou parcialmente.'
    ];

    paragraphs.forEach(paragraph => {
      const splitText = doc.splitTextToSize(paragraph, textWidth);
      doc.text(splitText, margin, yPos);
      yPos += splitText.length * 7 + 5;
    });

    // Generation date on cover
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Gerado em ${new Date().toLocaleString('pt-BR')}`,
      pageWidth/2,
      pageHeight - 30,
      { align: 'center' }
    );

    // Add header/footer to cover
    addHeaderFooter();

    // 1. Basic Information
    addSection('1. Informações Gerais');
    
    const basicInfo = [
      ['Número:', complaint.complaintNumber],
      ['Categoria:', complaint.category],
      ['Característica:', complaint.characteristic],
      ['Status:', getStatusText(complaint.status)],
      ['Instância Responsável:', complaint.responsibleInstance],
      complaint.removedMember ? ['Membro Afastado:', complaint.removedMember] : null,
      ['Responsável 1:', complaint.responsible1],
      ['Responsável 2:', complaint.responsible2],
      ['Data Recebimento:', new Date(complaint.receivedDate).toLocaleDateString('pt-BR')],
      ['SLA:', `${calculateSLA(complaint)} dias`]
    ].filter(Boolean);

    doc.autoTable({
      startY: yPos,
      head: [],
      body: basicInfo,
      theme: 'grid',
      styles: {
        fontSize: 11,
        cellPadding: 5,
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60, fillColor: [245, 245, 245] },
        1: { cellWidth: pageWidth - margin * 2 - 60 }
      }
    });

    // 2. Procedures
    addSection('2. Procedimentos Realizados');
    if (complaint.procedures && complaint.procedures.length > 0) {
      doc.autoTable({
        startY: yPos,
        head: [['Procedimento']],
        body: complaint.procedures.map(proc => [proc]),
        theme: 'grid',
        styles: {
          fontSize: 11,
          cellPadding: 5,
          lineColor: [200, 200, 200],
          lineWidth: 0.1
        },
        headStyles: {
          fillColor: [220, 0, 0],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        }
      });
    } else {
      doc.text('Nenhum procedimento registrado.', margin, yPos);
    }

    // 3. Analysis Points
    addSection('3. Pontos de Análise');
    if (complaint.analysisPoints && complaint.analysisPoints.length > 0) {
      doc.autoTable({
        startY: yPos,
        head: [['Ponto de Análise', 'Conclusão', 'Julgamento']],
        body: complaint.analysisPoints.map(point => [
          point.point,
          point.conclusion || 'Sem conclusão',
          point.judgment
        ]),
        theme: 'grid',
        styles: {
          fontSize: 11,
          cellPadding: 5,
          lineColor: [200, 200, 200],
          lineWidth: 0.1
        },
        headStyles: {
          fillColor: [220, 0, 0],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        }
      });
    } else {
      doc.text('Nenhum ponto de análise registrado.', margin, yPos);
    }

    // 4. Interviews
    addSection('4. Entrevistas Realizadas');
    if (complaint.interviews && complaint.interviews.length > 0) {
      complaint.interviews.forEach((interview, index) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`4.${index + 1}. ${interview.type}`, margin, yPos);
        yPos += 10;
        
        const interviewData = [
          ['Data:', new Date(interview.scheduledDate).toLocaleDateString('pt-BR')],
          ['Transcrição:', interview.transcription]
        ];

        doc.autoTable({
          startY: yPos,
          head: [],
          body: interviewData,
          theme: 'grid',
          styles: {
            fontSize: 11,
            cellPadding: 5,
            lineColor: [200, 200, 200],
            lineWidth: 0.1
          },
          columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 40, fillColor: [245, 245, 245] },
            1: { cellWidth: pageWidth - margin * 2 - 40 }
          }
        });

        yPos = (doc as any).lastAutoTable.finalY + 10;
      });
    } else {
      doc.text('Nenhuma entrevista registrada.', margin, yPos);
    }

    // 5. Actions
    addSection('5. Plano de Ação');
    if (complaint.actions && complaint.actions.length > 0) {
      complaint.actions.forEach((action, index) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`5.${index + 1}. Ação`, margin, yPos);
        yPos += 10;

        const actionData = [
          ['Tipo:', action.type],
          ['Descrição:', action.description],
          ['Responsável:', action.responsible],
          ['Status:', action.status],
          ['Data Início:', new Date(action.startDate).toLocaleDateString('pt-BR')],
          ['Data Fim:', new Date(action.endDate).toLocaleDateString('pt-BR')]
        ];

        if (action.observation) {
          actionData.push(['Observação:', action.observation]);
        }

        doc.autoTable({
          startY: yPos,
          head: [],
          body: actionData,
          theme: 'grid',
          styles: {
            fontSize: 11,
            cellPadding: 5,
            lineColor: [200, 200, 200],
            lineWidth: 0.1
          },
          columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 40, fillColor: [245, 245, 245] },
            1: { cellWidth: pageWidth - margin * 2 - 40 }
          }
        });

        yPos = (doc as any).lastAutoTable.finalY + 10;
      });
    } else {
      doc.text('Nenhuma ação registrada.', margin, yPos);
    }

    // 6. Conclusion
    if (complaint.conclusion) {
      addSection('6. Conclusão');
      const conclusionData = [
        ['Procedência:', complaint.conclusion.procedencia],
        ['Data Encerramento:', new Date(complaint.conclusion.dataEncerramento).toLocaleDateString('pt-BR')],
        ['Justificativa:', complaint.conclusion.justification]
      ];

      if (complaint.conclusion.observation) {
        conclusionData.push(['Observações:', complaint.conclusion.observation]);
      }

      conclusionData.push(['Status Aprovação CEO:', 
        complaint.conclusion.ceoApprovalStatus === 'pending' ? 'Pendente' :
        complaint.conclusion.ceoApprovalStatus === 'approved' ? 'Aprovado' : 'Rejeitado'
      ]);

      if (complaint.conclusion.ceoApprovalDate) {
        conclusionData.push(['Data Aprovação CEO:', new Date(complaint.conclusion.ceoApprovalDate).toLocaleDateString('pt-BR')]);
      }

      if (complaint.conclusion.ceoComments) {
        conclusionData.push(['Comentários CEO:', complaint.conclusion.ceoComments]);
      }

      doc.autoTable({
        startY: yPos,
        head: [],
        body: conclusionData,
        theme: 'grid',
        styles: {
          fontSize: 11,
          cellPadding: 5,
          lineColor: [200, 200, 200],
          lineWidth: 0.1
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 60, fillColor: [245, 245, 245] },
          1: { cellWidth: pageWidth - margin * 2 - 60 }
        }
      });
    }

    // Add header/footer to all pages
    for (let i = 1; i <= doc.getNumberOfPages(); i++) {
      doc.setPage(i);
      addHeaderFooter();
    }

    doc.save(`denuncia-${complaint.complaintNumber}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por número, categoria, característica..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              {filters.search && (
                <button
                  onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          <div>
            <select
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="">Todas as categorias</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.characteristic}
              onChange={(e) => setFilters(prev => ({ ...prev, characteristic: e.target.value }))}
            >
              <option value="">Todas as características</option>
              {characteristics.map(characteristic => (
                <option key={characteristic} value={characteristic}>{characteristic}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">Todos os status</option>
              <option value="nova">Nova Denúncia</option>
              <option value="investigacao">Em Investigação</option>
              <option value="concluida">Concluída</option>
              <option value="arquivada">Arquivada</option>
            </select>
          </div>

          <div>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.date}
              onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
              placeholder="Data a partir de"
            />
          </div>

          {(filters.search || filters.category || filters.characteristic || 
            filters.status || filters.date) && (
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-700 flex items-center"
            >
              <X className="h-4 w-4 mr-1" />
              Limpar filtros
            </button>
          )}
        </div>

        <div className="mt-4 text-sm text-gray-600">
          {filteredComplaints.length} {filteredComplaints.length === 1 ? 'denúncia encontrada' : 'denúncias encontradas'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredComplaints.map(complaint => (
          <div
            key={complaint.id}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {complaint.complaintNumber}
                </h3>
                <p className="text-sm text-gray-600">
                  {new Date(complaint.receivedDate).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <button
                onClick={() => generatePDF(complaint)}
                className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                title="Baixar PDF"
              >
                <Download className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">SLA:</span>
                <span className="font-medium">{calculateSLA(complaint)} dias</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Categoria:</span>
                <span className="text-gray-900">{complaint.category}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Característica:</span>
                <span className="text-gray-900">{complaint.characteristic}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Instância:</span>
                <span className="text-gray-900">{complaint.responsibleInstance}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium
                  ${complaint.status === 'nova' ? 'bg-blue-100 text-blue-800' :
                    complaint.status === 'investigacao' ? 'bg-yellow-100 text-yellow-800' :
                    complaint.status === 'concluida' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'}`}>
                  {getStatusText(complaint.status)}
                </span>
              </div>
              {complaint.conclusion && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Procedência:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium
                    ${complaint.conclusion.procedencia === 'Procedente' ? 'bg-green-100 text-green-800' :
                      complaint.conclusion.procedencia === 'Parcialmente procedente' ? 'bg-yellow-100 text-yellow-800' :
                      complaint.conclusion.procedencia === 'Improcedente' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'}`}>
                    {complaint.conclusion.procedencia}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}