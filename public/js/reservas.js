// Hotel Conforto - Sistema de Reservas
// Script para página de reservas

console.log('Script de reservas carregado');

// Dados da reserva
let reservaData = {
    quarto: null,
    quarto_info: null,
    checkin: '',
    checkout: '',
    hospedes: 2,
    total: 0,
    preco_noite: 0
};

// Controle de passos
let currentStep = 1;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Reservas carregado');
    
    // Configurar datas mínimas
    configurarDatas();
    
    // Carregar quarto da URL se existir
    const urlParams = new URLSearchParams(window.location.search);
    const quartoId = urlParams.get('quarto');
    
    if (quartoId) {
        console.log('Carregando quarto da URL:', quartoId);
        carregarQuartoEspecifico(quartoId);
    } else {
        console.log('Nenhum quarto especificado na URL');
    }
    
    // Configurar eventos
    document.getElementById('checkin').addEventListener('change', calcularTotal);
    document.getElementById('checkout').addEventListener('change', calcularTotal);
    document.getElementById('hospedes').addEventListener('change', calcularTotal);
});

function configurarDatas() {
    const hoje = new Date();
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);
    
    const hojeStr = hoje.toISOString().split('T')[0];
    const amanhaStr = amanha.toISOString().split('T')[0];
    
    document.getElementById('checkin').min = hojeStr;
    document.getElementById('checkin').value = hojeStr;
    reservaData.checkin = hojeStr;
    
    document.getElementById('checkout').min = amanhaStr;
    document.getElementById('checkout').value = amanhaStr;
    reservaData.checkout = amanhaStr;
}

async function carregarQuartoEspecifico(quartoId) {
    try {
        const response = await fetch(`/api/quartos/${quartoId}`);
        if (!response.ok) throw new Error('Quarto não encontrado');
        
        const quarto = await response.json();
        
        // Atualizar dados da reserva
        reservaData.quarto = quarto.id;
        reservaData.quarto_info = `Quarto ${quarto.numero} - ${quarto.tipo}`;
        reservaData.preco_noite = parseFloat(quarto.preco_noite);
        
        // Atualizar interface
        document.getElementById('resumo-quarto').textContent = reservaData.quarto_info;
        document.getElementById('resumo-diaria').textContent = `R$ ${quarto.preco_noite}`;
        document.getElementById('confirm-quarto').textContent = reservaData.quarto_info;
        
        // Calcular total inicial
        calcularTotal();
        
        // Ir para passo 2 automaticamente
        setTimeout(() => nextStep(), 1000);
        
    } catch (error) {
        console.error('Erro ao carregar quarto:', error);
        alert('Erro ao carregar quarto: ' + error.message);
    }
}

function calcularTotal() {
    if (!reservaData.preco_noite) return;
    
    const checkin = document.getElementById('checkin').value;
    const checkout = document.getElementById('checkout').value;
    const hospedes = document.getElementById('hospedes').value;
    
    reservaData.checkin = checkin;
    reservaData.checkout = checkout;
    reservaData.hospedes = parseInt(hospedes);
    
    if (!checkin || !checkout) return;
    
    const dias = Math.ceil((new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24));
    if (dias <= 0) {
        document.getElementById('resumo-total').textContent = 'R$ 0,00';
        document.getElementById('confirm-total').textContent = 'R$ 0,00';
        return;
    }
    
    reservaData.total = reservaData.preco_noite * dias;
    
    document.getElementById('resumo-total').textContent = `R$ ${reservaData.total.toFixed(2)}`;
    document.getElementById('confirm-total').textContent = `R$ ${reservaData.total.toFixed(2)}`;
    document.getElementById('confirm-checkin').textContent = formatarData(checkin);
    document.getElementById('confirm-checkout').textContent = formatarData(checkout);
    document.getElementById('confirm-hospedes').textContent = `${hospedes} pessoa${hospedes > 1 ? 's' : ''}`;
}

function formatarData(dataStr) {
    const data = new Date(dataStr);
    return data.toLocaleDateString('pt-BR');
}

// Navegação entre passos
function nextStep() {
    if (currentStep >= 4) return;
    
    // Validar passo atual
    if (currentStep === 1 && !reservaData.quarto) {
        alert('Por favor, selecione um quarto antes de continuar.');
        return;
    }
    
    if (currentStep === 2) {
        const checkin = document.getElementById('checkin').value;
        const checkout = document.getElementById('checkout').value;
        
        if (!checkin || !checkout) {
            alert('Por favor, selecione as datas de check-in e check-out.');
            return;
        }
        
        if (new Date(checkout) <= new Date(checkin)) {
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
        
        // Validar email básico
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Por favor, insira um e-mail válido.');
            return;
        }
    }

    // Avançar passo
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

// FUNÇÃO PRINCIPAL: FINALIZAR RESERVA
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
    const cpf = document.getElementById('cpf').value.trim().replace(/\D/g, '');
    
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
    if (cpf.length !== 11) {
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
        const reservaDados = {
            quarto_id: reservaData.quarto,
            data_checkin: reservaData.checkin,
            data_checkout: reservaData.checkout,
            numero_hospedes: reservaData.hospedes,
            valor_total: reservaData.total,
            observacoes: document.getElementById('observacoes').value || '',
            // Dados do hóspede (a API vai criar automaticamente)
            nome: nome,
            email: email,
            telefone: telefone,
            cpf: cpf
        };
        
        console.log('Enviando reserva:', reservaDados);
        
        // Enviar para API
        const response = await fetch('/api/reservas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reservaDados)
        });
        
        console.log('Status da resposta:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro ${response.status}: ${errorText}`);
        }
        
        const resultado = await response.json();
        console.log('Reserva criada com sucesso:', resultado);
        
        // Salvar dados para página de confirmação
        localStorage.setItem('ultima_reserva', JSON.stringify({
            codigo: resultado.codigo_reserva || resultado.id,
            data_checkin: reservaData.checkin,
            data_checkout: reservaData.checkout,
            quarto_info: reservaData.quarto_info,
            valor_total: reservaData.total,
            nome: nome,
            email: email
        }));
        
        // Redirecionar para página de confirmação
        const codigoReserva = resultado.codigo_reserva || resultado.id || 'RES' + Date.now().toString().slice(-8);
        window.location.href = `/reserva-confirmada.html?codigo=${codigoReserva}`;
        
    } catch (error) {
        console.error('Erro ao finalizar reserva:', error);
        
        let mensagemErro = 'Erro ao finalizar reserva: ';
        if (error.message.includes('Quarto não está disponível')) {
            mensagemErro += 'O quarto selecionado não está mais disponível.';
        } else if (error.message.includes('Quarto já reservado')) {
            mensagemErro += 'O quarto já foi reservado para estas datas.';
        } else {
            mensagemErro += error.message;
        }
        
        alert(mensagemErro);
        
        // Restaurar botão
        btnConfirmar.disabled = false;
        btnConfirmar.innerHTML = btnOriginalText;
    }
}

// Exportar funções para uso global (LINHA IMPORTANTE!)
window.finalizarReserva = finalizarReserva;
window.nextStep = nextStep;
window.prevStep = prevStep;

console.log('Sistema de reservas inicializado com sucesso!');
