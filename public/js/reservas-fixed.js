// Dados da reserva
let reservaData = {
    quarto: null,
    quarto_info: null,
    checkin: '',
    checkout: '',
    hospedes: 2,
    total: 0
};

// Elementos
let currentStep = 1;
const totalSteps = 4;

// Inicialização
document.addEventListener('DOMContentLoaded', async function() {
    await loadQuartosDisponiveis();
    setupEventListeners();
    updateResumo();
});

// Carregar quartos disponíveis
async function loadQuartosDisponiveis() {
    const container = document.getElementById('quartos-disponiveis');

    try {
        const response = await fetch('/api/quartos/disponiveis');
        const quartos = await response.json();

        if (!quartos || quartos.length === 0) {
            container.innerHTML = `
                <div class="no-quartos" style="text-align: center; padding: 40px; grid-column: 1/-1;">
                    <i class="fas fa-bed" style="font-size: 3rem; color: #7f8c8d; margin-bottom: 20px;"></i>
                    <h3>Nenhum quarto disponível no momento</h3>
                    <p>Tente selecionar outras datas ou entre em contato conosco.</p>
                    <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        <i class="fas fa-sync-alt"></i> Tentar novamente
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = quartos.map(quarto => `
            <div class="quarto-option" data-quarto-id="${quarto.id}" onclick="selectQuarto(${quarto.id}, '${quarto.numero}', '${quarto.tipo}', ${quarto.preco_noite})">
                <div class="radio"></div>
                <h3>Quarto ${quarto.numero} - ${getTipoNome(quarto.tipo)}</h3>
                <div class="preco">R$ ${parseFloat(quarto.preco_noite).toFixed(2)} /noite</div>
                <p class="descricao">${quarto.descricao || 'Quarto confortável e bem equipado.'}</p>
                <div class="comodidades">
                    <span class="comodidade">${quarto.capacidade} pessoas</span>
                    ${quarto.comodidades && Array.isArray(quarto.comodidades)
                        ? quarto.comodidades.slice(0, 3).map(c =>
                            `<span class="comodidade">${c}</span>`
                          ).join('')
                        : ''
                    }
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Erro ao carregar quartos:', error);
        container.innerHTML = '<p class="error">Erro ao carregar quartos disponíveis.</p>';
    }
}

// Selecionar quarto
function selectQuarto(quartoId, quartoNumero, quartoTipo, precoNoite) {
    // Remover seleção anterior
    document.querySelectorAll('.quarto-option').forEach(option => {
        option.classList.remove('selected');
    });

    // Adicionar seleção atual
    const selectedOption = document.querySelector(`[data-quarto-id="${quartoId}"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
        reservaData.quarto = quartoId;
        reservaData.quarto_info = `Quarto ${quartoNumero} - ${getTipoNome(quartoTipo)}`;
        reservaData.preco_noite = precoNoite;
        updateResumo();
    }
}

function getTipoNome(tipo) {
    const tipos = {
        'standard': 'Standard',
        'deluxe': 'Deluxe',
        'suite': 'Suite',
        'familia': 'Família',
        'luxo': 'Luxo'
    };
    return tipos[tipo] || tipo;
}

// Configurar listeners
function setupEventListeners() {
    // Datas
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');
    const hospedesInput = document.getElementById('hospedes');

    // Configurar data mínima (amanhã)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    checkinInput.min = tomorrow.toISOString().split('T')[0];

    checkinInput.addEventListener('change', function() {
        if (this.value) {
            const minCheckout = new Date(this.value);
            minCheckout.setDate(minCheckout.getDate() + 1);
            checkoutInput.min = minCheckout.toISOString().split('T')[0];
            
            reservaData.checkin = this.value;
            updateResumo();
        }
    });

    checkoutInput.addEventListener('change', function() {
        if (this.value) {
            reservaData.checkout = this.value;
            updateResumo();
        }
    });

    hospedesInput.addEventListener('change', function() {
        reservaData.hospedes = parseInt(this.value);
        updateResumo();
    });

    // Configurar checkout para 2 dias após checkin
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
    checkoutInput.min = dayAfterTomorrow.toISOString().split('T')[0];
    checkoutInput.value = dayAfterTomorrow.toISOString().split('T')[0];
    reservaData.checkout = checkoutInput.value;
}

// Atualizar resumo
function updateResumo() {
    // Atualizar quarto
    document.getElementById('resumo-quarto').textContent = reservaData.quarto_info || '-';
    document.getElementById('confirm-quarto').textContent = reservaData.quarto_info || '-';

    // Calcular total
    if (reservaData.checkin && reservaData.checkout && reservaData.preco_noite) {
        const checkinDate = new Date(reservaData.checkin);
        const checkoutDate = new Date(reservaData.checkout);
        const diffTime = Math.abs(checkoutDate - checkinDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 0) {
            reservaData.total = reservaData.preco_noite * diffDays;
            
            document.getElementById('resumo-diaria').textContent = `R$ ${reservaData.preco_noite.toFixed(2)}`;
            document.getElementById('resumo-total').textContent = `R$ ${reservaData.total.toFixed(2)}`;
            document.getElementById('confirm-total').textContent = `R$ ${reservaData.total.toFixed(2)}`;
        }
    }

    // Atualizar datas e hóspedes na confirmação
    if (reservaData.checkin) {
        document.getElementById('confirm-checkin').textContent = formatarData(reservaData.checkin);
    }
    if (reservaData.checkout) {
        document.getElementById('confirm-checkout').textContent = formatarData(reservaData.checkout);
    }
    document.getElementById('confirm-hospedes').textContent = `${reservaData.hospedes} pessoa${reservaData.hospedes > 1 ? 's' : ''}`;
}

function formatarData(dataStr) {
    if (!dataStr) return '-';
    const data = new Date(dataStr);
    return data.toLocaleDateString('pt-BR');
}

// Navegação entre passos
function nextStep() {
    if (currentStep >= totalSteps) return;
    
    // Validar passo atual
    if (currentStep === 1 && !reservaData.quarto) {
        alert('Por favor, selecione um quarto antes de continuar.');
        return;
    }
    
    if (currentStep === 2) {
        if (!reservaData.checkin || !reservaData.checkout) {
            alert('Por favor, selecione as datas de check-in e check-out.');
            return;
        }
        
        if (new Date(reservaData.checkout) <= new Date(reservaData.checkin)) {
            alert('A data de check-out deve ser posterior ao check-in.');
            return;
        }
    }
    
    if (currentStep === 3) {
        const nome = document.getElementById('nome').value.trim();
        const email = document.getElementById('email').value.trim();
        const telefone = document.getElementById('telefone').value.trim();
        const cpf = document.getElementById('cpf').value.trim();
        
        if (!nome || !email || !telefone || !cpf) {
            alert('Por favor, preencha todos os dados pessoais.');
            return;
        }
    }

    document.getElementById(`step${currentStep}`).classList.remove('active');
    currentStep++;
    document.getElementById(`step${currentStep}`).classList.add('active');
}

function prevStep() {
    if (currentStep <= 1) return;
    document.getElementById(`step${currentStep}`).classList.remove('active');
    currentStep--;
    document.getElementById(`step${currentStep}`).classList.add('active');
}

// FUNÇÃO FINALIZAR RESERVA - CORRIGIDA E COMPLETA
async function finalizarReserva() {
    console.log('Iniciando finalização da reserva...');
    
    // Validar termos
    if (!document.getElementById('termos').checked) {
        alert('Por favor, aceite os termos e condições.');
        return;
    }
    
    // Validar dados pessoais
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    
    if (!nome || !email || !telefone || !cpf) {
        alert('Por favor, preencha todos os dados pessoais.');
        return;
    }
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Email inválido!');
        return;
    }
    
    // Validar CPF
    const cpfNumeros = cpf.replace(/\D/g, '');
    if (cpfNumeros.length !== 11) {
        alert('CPF inválido! Deve conter 11 dígitos.');
        return;
    }
    
    // Desabilitar botão e mostrar loading
    const btnConfirmar = document.querySelector('.btn-confirm');
    if (!btnConfirmar) {
        alert('Erro: Botão de confirmação não encontrado.');
        return;
    }
    
    const btnOriginalText = btnConfirmar.innerHTML;
    btnConfirmar.disabled = true;
    btnConfirmar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
    
    try {
        // Preparar dados para envio
        const reservaFinal = {
            quarto_id: reservaData.quarto,
            hospede: {
                nome: nome,
                email: email,
                telefone: telefone,
                cpf: cpfNumeros
            },
            data_checkin: reservaData.checkin,
            data_checkout: reservaData.checkout,
            numero_hospedes: reservaData.hospedes,
            valor_total: reservaData.total,
            observacoes: document.getElementById('observacoes').value || ''
        };
        
        console.log('Enviando reserva:', reservaFinal);
        
        // Enviar para API
        const reservaResponse = await fetch('/api/reservas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reservaFinal)
        });

        if (!reservaResponse.ok) {
            const error = await reservaResponse.json();
            throw new Error(error.error || 'Erro ao criar reserva');
        }

        const reserva = await reservaResponse.json();
        console.log('Reserva criada com sucesso:', reserva);

        // Salvar dados no localStorage para a página de confirmação
        localStorage.setItem('ultima_reserva', JSON.stringify({
            data_checkin: reservaData.checkin,
            data_checkout: reservaData.checkout,
            quarto_info: reservaData.quarto_info,
            valor_total: reservaData.total,
            codigo_reserva: reserva.codigo_reserva
        }));

        // Redirecionar para confirmação
        window.location.href = `/reserva-confirmada.html?codigo=${reserva.codigo_reserva || reserva.id}`;

    } catch (error) {
        console.error('Erro ao finalizar reserva:', error);
        alert('Erro ao processar reserva: ' + error.message);
        
        // Restaurar botão
        btnConfirmar.disabled = false;
        btnConfirmar.innerHTML = btnOriginalText;
    }
}

// Funções auxiliares para debug
window.debugReserva = {
    getReservaData: () => reservaData,
    getCurrentStep: () => currentStep,
    testAPI: async () => {
        console.log('Testando API de reservas...');
        try {
            const response = await fetch('/api/quartos/disponiveis');
            console.log('GET /api/quartos/disponiveis:', response.status);
            
            // Testar POST simples
            const testData = {
                quarto_id: 2,
                data_checkin: '2024-01-15',
                data_checkout: '2024-01-17',
                numero_hospedes: 2,
                nome: 'Teste',
                email: 'teste@teste.com',
                telefone: '11999999999',
                cpf: '12345678901'
            };
            
            // Primeiro tentar rota pública
            const response2 = await fetch('/api/reservas/public', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(testData)
            });
            console.log('POST /api/reservas/public:', response2.status);
            
            if (!response2.ok) {
                // Tentar rota normal
                const response3 = await fetch('/api/reservas', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        quarto_id: 2,
                        hospede: {
                            nome: 'Teste',
                            email: 'teste@teste.com',
                            telefone: '11999999999',
                            cpf: '12345678901'
                        },
                        data_checkin: '2024-01-15',
                        data_checkout: '2024-01-17',
                        numero_hospedes: 2,
                        valor_total: 900
                    })
                });
                console.log('POST /api/reservas:', response3.status);
            }
        } catch (error) {
            console.error('Erro no teste:', error);
        }
    }
};

// Exportar funções para uso global
window.finalizarReserva = finalizarReserva;
window.nextStep = nextStep;
window.prevStep = prevStep;
window.selectQuarto = selectQuarto;

console.log('Sistema de reservas carregado e pronto!');
