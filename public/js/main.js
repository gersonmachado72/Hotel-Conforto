// Hotel Conforto - Sistema de Reservas
// Script principal para carregar quartos da API

console.log('Hotel Conforto - Sistema carregado');

// Função principal para carregar quartos
async function carregarQuartos() {
    const container = document.getElementById('quartos-container');
    
    if (!container) {
        console.error('Elemento #quartos-container não encontrado!');
        return;
    }
    
    console.log('Carregando quartos da API...');
    
    try {
        // Fazer requisição para a API
        const response = await fetch('/api/quartos');
        
        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status}`);
        }
        
        const quartos = await response.json();
        console.log(`${quartos.length} quartos carregados`, quartos);
        
        // Limpar loading
        container.innerHTML = '';
        
        // Renderizar cada quarto
        quartos.forEach(quarto => {
            const quartoHTML = criarCardQuarto(quarto);
            container.innerHTML += quartoHTML;
        });
        
    } catch (error) {
        console.error('Erro ao carregar quartos:', error);
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    <h5>Erro ao carregar quartos</h5>
                    <p>${error.message}</p>
                    <p>Verifique se a API está funcionando: <a href="/api/quartos" target="_blank">/api/quartos</a></p>
                </div>
            </div>
        `;
    }
}

// Criar HTML para um card de quarto
function criarCardQuarto(quarto) {
    const comodidades = quarto.comodidades || [];
    const comodidadesHTML = comodidades.map(comod => 
        `<span class="badge bg-secondary me-1 mb-1">${comod}</span>`
    ).join('');
    
    const statusClass = quarto.status === 'disponivel' ? 'success' : 'danger';
    const statusText = quarto.status === 'disponivel' ? 'Disponível' : 'Indisponível';
    
    return `
        <div class="col-md-3 mb-4">
            <div class="card h-100 room-card">
                <div class="card-body">
                    <h5 class="card-title">Quarto ${quarto.numero}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">${quarto.tipo}</h6>
                    <p class="card-text">
                        <strong>Preço:</strong> R$ ${quarto.preco_noite}/noite<br>
                        <strong>Capacidade:</strong> ${quarto.capacidade} pessoas<br>
                        <strong>Status:</strong> 
                        <span class="badge bg-${statusClass}">${statusText}</span>
                    </p>
                    <p class="card-text">${quarto.descricao || ''}</p>
                    <div class="mb-3">
                        ${comodidadesHTML}
                    </div>
                    ${quarto.status === 'disponivel' 
                        ? `<a href="/reservas?quarto=${quarto.id}" class="btn btn-primary w-100">Reservar Agora</a>`
                        : `<button class="btn btn-secondary w-100" disabled>Indisponível</button>`
                    }
                </div>
            </div>
        </div>
    `;
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado - inicializando sistema...');
    
    // Carregar quartos
    carregarQuartos();
    
    // Ativar tooltips do Bootstrap se existirem
    if (typeof bootstrap !== 'undefined') {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
    
    // Scroll suave para âncoras
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId !== '#') {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
});

// Exportar para uso no console (debug)
window.HotelConforto = {
    carregarQuartos,
    criarCardQuarto
};

console.log('Script main.js carregado com sucesso!');
