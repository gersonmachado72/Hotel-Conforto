function editarHospede(id) {
    console.log('Abrindo edição do hóspede ID:', id);
    
    // 1. Buscar dados do hóspede da API
    fetch(`/api/hospedes/${id}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao buscar hóspede');
        }
        return response.json();
    })
    .then(hospede => {
        // 2. Abrir modal de edição
        abrirModalEdicaoHospede(hospede);
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao carregar dados do hóspede');
    });
}

// Função para abrir modal de edição
function abrirModalEdicaoHospede(hospede) {
    // Criar HTML do modal
    const modalHTML = `
        <div id="modalEditarHospede" class="modal" style="display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); align-items: center; justify-content: center; z-index: 1000;">
            <div style="background: white; padding: 20px; border-radius: 8px; width: 500px; max-width: 90%;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="margin: 0;">Editar Hóspede</h3>
                    <button onclick="fecharModalEditarHospede()" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
                </div>
                
                <form id="formEditarHospede">
                    <input type="hidden" name="id" value="${hospede.id}">
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Nome:</label>
                        <input type="text" name="nome" value="${hospede.nome}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" required>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Email:</label>
                        <input type="email" name="email" value="${hospede.email}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" required>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Telefone:</label>
                        <input type="text" name="telefone" value="${hospede.telefone}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" required>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">CPF:</label>
                        <input type="text" name="cpf" value="${hospede.cpf}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" required>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Status:</label>
                        <select name="status" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                            <option value="ativo" ${hospede.status === 'ativo' ? 'selected' : ''}>Ativo</option>
                            <option value="inativo" ${hospede.status === 'inativo' ? 'selected' : ''}>Inativo</option>
                            <option value="bloqueado" ${hospede.status === 'bloqueado' ? 'selected' : ''}>Bloqueado</option>
                        </select>
                    </div>
                    
                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button type="submit" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Salvar</button>
                        <button type="button" onclick="fecharModalEditarHospede()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Adicionar modal ao body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Adicionar evento de submit
    document.getElementById('formEditarHospede').addEventListener('submit', function(e) {
        e.preventDefault();
        salvarEdicaoHospede(hospede.id);
    });
}

// Função para fechar modal
function fecharModalEditarHospede() {
    const modal = document.getElementById('modalEditarHospede');
    if (modal) {
        modal.remove();
    }
}

// Função para salvar edição
function salvarEdicaoHospede(id) {
    const form = document.getElementById('formEditarHospede');
    const formData = new FormData(form);
    const dados = Object.fromEntries(formData);
    
    console.log('Salvando edição:', dados);
    
    fetch(`/api/hospedes/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(dados)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao atualizar');
        }
        return response.json();
    })
    .then(result => {
        alert('✅ Hóspede atualizado com sucesso!');
        fecharModalEditarHospede();
        
        // Recarregar a página para ver as mudanças
        location.reload();
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('❌ Erro ao atualizar hóspede');
    });
}
