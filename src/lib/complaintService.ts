import { supabase } from './supabase';
import { Complaint, Interview, Action, HistoryEntry, User } from '../types';

export async function checkComplaintNumberUnique(complaintNumber: string, excludeId?: string): Promise<boolean> {
  try {
    let query = supabase
      .from('complaints')
      .select('id, number')
      .eq('number', complaintNumber);
    
    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data.length === 0;
  } catch (error) {
    console.error('Error checking complaint number uniqueness:', error);
    throw error;
  }
}

export async function createComplaint(complaint: Partial<Complaint>) {
  try {
    // Check if complaint number is unique
    const isUnique = await checkComplaintNumberUnique(complaint.complaintNumber!);
    if (!isUnique) {
      throw new Error('Número da denúncia já existe. Por favor, escolha outro número.');
    }

    // Insert main complaint
    const { data: complaintData, error: complaintError } = await supabase
      .from('complaints')
      .insert([{
        number: complaint.complaintNumber,
        category: complaint.category,
        characteristic: complaint.characteristic,
        status: complaint.status,
        responsible_instance: complaint.responsibleInstance,
        removed_member: complaint.removedMember,
        responsible1: complaint.responsible1,
        responsible2: complaint.responsible2,
        received_date: complaint.receivedDate,
        description: complaint.description
      }])
      .select()
      .single();

    if (complaintError) throw complaintError;

    const complaintId = complaintData.id;

    // Insert procedures
    if (complaint.procedures && complaint.procedures.length > 0) {
      const { error: proceduresError } = await supabase
        .from('complaint_procedures')
        .insert(
          complaint.procedures.map(procedure => ({
            complaint_id: complaintId,
            procedure_type: procedure
          }))
        );

      if (proceduresError) throw proceduresError;
    }

    // Insert analysis points
    if (complaint.analysisPoints && complaint.analysisPoints.length > 0) {
      const { error: analysisPointsError } = await supabase
        .from('complaint_analysis_points')
        .insert(
          complaint.analysisPoints.map(point => ({
            complaint_id: complaintId,
            point: point.point,
            conclusion: point.conclusion,
            judgment: point.judgment
          }))
        );

      if (analysisPointsError) throw analysisPointsError;
    }

    // Insert interviews
    if (complaint.interviews && complaint.interviews.length > 0) {
      const { error: interviewsError } = await supabase
        .from('complaint_interviews')
        .insert(
          complaint.interviews.map((interview: Interview) => ({
            complaint_id: complaintId,
            interview_type: interview.type,
            scheduled_date: interview.scheduledDate,
            transcription: interview.transcription
          }))
        );

      if (interviewsError) throw interviewsError;
    }

    // Insert actions
    if (complaint.actions && complaint.actions.length > 0) {
      const { error: actionsError } = await supabase
        .from('complaint_actions')
        .insert(
          complaint.actions.map((action: Action) => ({
            complaint_id: complaintId,
            action_type: action.type,
            description: action.description,
            responsible: action.responsible,
            status: action.status,
            start_date: action.startDate,
            end_date: action.endDate,
            observation: action.observation
          }))
        );

      if (actionsError) throw actionsError;
    }

    // Insert conclusion if exists
    if (complaint.conclusion) {
      const { error: conclusionError } = await supabase
        .from('complaint_conclusions')
        .insert([{
          complaint_id: complaintId,
          procedencia: complaint.conclusion.procedencia,
          closing_date: complaint.conclusion.dataEncerramento,
          justification: complaint.conclusion.justification,
          observation: complaint.conclusion.observation,
          ceo_approval_status: complaint.conclusion.ceoApprovalStatus,
          ceo_approval_date: complaint.conclusion.ceoApprovalDate,
          ceo_comments: complaint.conclusion.ceoComments
        }]);

      if (conclusionError) throw conclusionError;
    }

    // Insert history entry for creation
    const { error: historyError } = await supabase
      .from('complaint_history')
      .insert([{
        complaint_id: complaintId,
        field: 'Criação',
        new_value: 'Nova denúncia criada',
        change_type: 'create',
        user_name: 'Sistema'
      }]);

    if (historyError) throw historyError;

    return complaintData;
  } catch (error) {
    console.error('Error creating complaint:', error);
    throw error;
  }
}

export async function updateComplaint(complaint: Complaint) {
  try {
    // Check if complaint number is unique (excluding current complaint)
    const isUnique = await checkComplaintNumberUnique(complaint.complaintNumber, complaint.id);
    if (!isUnique) {
      throw new Error('Número da denúncia já existe. Por favor, escolha outro número.');
    }

    // Get the current state of the complaint for history comparison
    const { data: oldComplaint, error: oldComplaintError } = await supabase
      .from('complaints')
      .select('*')
      .eq('id', complaint.id)
      .single();

    if (oldComplaintError) throw oldComplaintError;

    // Update main complaint
    const { data: updatedComplaint, error: complaintError } = await supabase
      .from('complaints')
      .update({
        number: complaint.complaintNumber,
        category: complaint.category,
        characteristic: complaint.characteristic,
        status: complaint.status,
        responsible_instance: complaint.responsibleInstance,
        removed_member: complaint.removedMember,
        responsible1: complaint.responsible1,
        responsible2: complaint.responsible2,
        received_date: complaint.receivedDate,
        description: complaint.description
      })
      .eq('id', complaint.id)
      .select()
      .single();

    if (complaintError) throw complaintError;

    // Field mapping for better display
    const fieldMapping = {
      number: 'Número',
      category: 'Categoria',
      characteristic: 'Característica',
      status: 'Status',
      responsible_instance: 'Instância Responsável',
      removed_member: 'Membro Afastado',
      responsible1: 'Responsável 1',
      responsible2: 'Responsável 2',
      received_date: 'Data Recebimento',
      description: 'Descrição'
    };

    // Status mapping for better display
    const statusMapping = {
      nova: 'Nova Denúncia',
      investigacao: 'Em Investigação',
      concluida: 'Concluída',
      arquivada: 'Arquivada'
    };

    // Record changes in history, excluding system fields
    const changedFields = Object.keys(updatedComplaint).filter(key => 
      // Exclude system fields and check for actual changes
      !['id', 'updated_at', 'created_at'].includes(key) &&
      oldComplaint[key] !== updatedComplaint[key]
    );

    // Add history entries only for meaningful changes
    for (const field of changedFields) {
      const displayField = fieldMapping[field] || field;
      let oldValue = oldComplaint[field];
      let newValue = updatedComplaint[field];

      // Format status values
      if (field === 'status') {
        oldValue = statusMapping[oldValue] || oldValue;
        newValue = statusMapping[newValue] || newValue;
      }

      // Format date values
      if (field === 'received_date') {
        oldValue = new Date(oldValue).toLocaleDateString('pt-BR');
        newValue = new Date(newValue).toLocaleDateString('pt-BR');
      }

      await supabase
        .from('complaint_history')
        .insert([{
          complaint_id: complaint.id,
          field: displayField,
          old_value: oldValue,
          new_value: newValue,
          change_type: 'update',
          user_name: 'Sistema'
        }]);
    }

    // Update procedures
    await supabase
      .from('complaint_procedures')
      .delete()
      .eq('complaint_id', complaint.id);

    if (complaint.procedures && complaint.procedures.length > 0) {
      const { error: proceduresError } = await supabase
        .from('complaint_procedures')
        .insert(
          complaint.procedures.map(procedure => ({
            complaint_id: complaint.id,
            procedure_type: procedure
          }))
        );

      if (proceduresError) throw proceduresError;
    }

    // Update analysis points
    await supabase
      .from('complaint_analysis_points')
      .delete()
      .eq('complaint_id', complaint.id);

    if (complaint.analysisPoints && complaint.analysisPoints.length > 0) {
      const { error: analysisPointsError } = await supabase
        .from('complaint_analysis_points')
        .insert(
          complaint.analysisPoints.map(point => ({
            complaint_id: complaint.id,
            point: point.point,
            conclusion: point.conclusion,
            judgment: point.judgment
          }))
        );

      if (analysisPointsError) throw analysisPointsError;
    }

    // Update interviews
    await supabase
      .from('complaint_interviews')
      .delete()
      .eq('complaint_id', complaint.id);

    if (complaint.interviews && complaint.interviews.length > 0) {
      const { error: interviewsError } = await supabase
        .from('complaint_interviews')
        .insert(
          complaint.interviews.map(interview => ({
            complaint_id: complaint.id,
            interview_type: interview.type,
            scheduled_date: interview.scheduledDate,
            transcription: interview.transcription
          }))
        );

      if (interviewsError) throw interviewsError;
    }

    // Update actions
    await supabase
      .from('complaint_actions')
      .delete()
      .eq('complaint_id', complaint.id);

    if (complaint.actions && complaint.actions.length > 0) {
      const { error: actionsError } = await supabase
        .from('complaint_actions')
        .insert(
          complaint.actions.map(action => ({
            complaint_id: complaint.id,
            action_type: action.type,
            description: action.description,
            responsible: action.responsible,
            status: action.status,
            start_date: action.startDate,
            end_date: action.endDate,
            observation: action.observation
          }))
        );

      if (actionsError) throw actionsError;
    }

    // Update conclusion
    await supabase
      .from('complaint_conclusions')
      .delete()
      .eq('complaint_id', complaint.id);

    if (complaint.conclusion) {
      const { error: conclusionError } = await supabase
        .from('complaint_conclusions')
        .insert([{
          complaint_id: complaint.id,
          procedencia: complaint.conclusion.procedencia,
          closing_date: complaint.conclusion.dataEncerramento,
          justification: complaint.conclusion.justification,
          observation: complaint.conclusion.observation,
          ceo_approval_status: complaint.conclusion.ceoApprovalStatus,
          ceo_approval_date: complaint.conclusion.ceoApprovalDate,
          ceo_comments: complaint.conclusion.ceoComments
        }]);

      if (conclusionError) throw conclusionError;
    }

    return true;
  } catch (error) {
    console.error('Error updating complaint:', error);
    throw error;
  }
}

export async function fetchComplaints(currentUser?: User | null) {
  try {
    // Fetch all complaints first
    const { data: complaints, error: complaintsError } = await supabase
      .from('complaints')
      .select(`
        *,
        complaint_procedures (
          procedure_type,
          completed
        ),
        complaint_analysis_points (
          point,
          conclusion,
          judgment
        ),
        complaint_interviews (
          interview_type,
          scheduled_date,
          transcription
        ),
        complaint_actions (
          action_type,
          description,
          responsible,
          status,
          start_date,
          end_date,
          observation
        ),
        complaint_conclusions (
          procedencia,
          closing_date,
          justification,
          observation,
          ceo_approval_status,
          ceo_approval_date,
          ceo_comments
        )
      `)
      .order('created_at', { ascending: false });

    if (complaintsError) throw complaintsError;

    // Filter out complaints where the current user is the removed member
    const filteredComplaints = currentUser 
      ? complaints.filter(complaint => complaint.removed_member !== currentUser.name)
      : complaints;

    // Fetch history for each complaint
    const complaintsWithHistory = await Promise.all(filteredComplaints.map(async (complaint) => {
      const { data: history, error: historyError } = await supabase
        .from('complaint_history')
        .select(`
          timestamp,
          field,
          old_value,
          new_value,
          change_type,
          user_name
        `)
        .eq('complaint_id', complaint.id)
        .order('timestamp', { ascending: true });

      if (historyError) throw historyError;

      return {
        id: complaint.id,
        title: `Denúncia #${complaint.number}`,
        description: complaint.description,
        date: complaint.created_at,
        status: complaint.status,
        complaintNumber: complaint.number,
        category: complaint.category,
        characteristic: complaint.characteristic,
        responsibleInstance: complaint.responsible_instance,
        removedMember: complaint.removed_member,
        responsible1: complaint.responsible1,
        responsible2: complaint.responsible2,
        receivedDate: complaint.received_date,
        procedures: complaint.complaint_procedures.map(p => p.procedure_type),
        analysisPoints: complaint.complaint_analysis_points.map(p => ({
          point: p.point,
          conclusion: p.conclusion,
          judgment: p.judgment
        })),
        interviews: complaint.complaint_interviews.map(i => ({
          type: i.interview_type,
          scheduledDate: i.scheduled_date,
          transcription: i.transcription
        })),
        actions: complaint.complaint_actions.map(a => ({
          type: a.action_type,
          description: a.description,
          responsible: a.responsible,
          status: a.status,
          startDate: a.start_date,
          endDate: a.end_date,
          observation: a.observation
        })),
        conclusion: complaint.complaint_conclusions[0] ? {
          procedencia: complaint.complaint_conclusions[0].procedencia,
          dataEncerramento: complaint.complaint_conclusions[0].closing_date,
          justification: complaint.complaint_conclusions[0].justification,
          observation: complaint.complaint_conclusions[0].observation,
          ceoApprovalStatus: complaint.complaint_conclusions[0].ceo_approval_status,
          ceoApprovalDate: complaint.complaint_conclusions[0].ceo_approval_date,
          ceoComments: complaint.complaint_conclusions[0].ceo_comments
        } : undefined,
        activeTab: 'info',
        history: history.map(h => ({
          timestamp: h.timestamp,
          user: h.user_name,
          field: h.field,
          oldValue: h.old_value,
          newValue: h.new_value,
          type: h.change_type
        }))
      };
    }));

    return complaintsWithHistory;
  } catch (error) {
    console.error('Error fetching complaints:', error);
    throw error;
  }
}